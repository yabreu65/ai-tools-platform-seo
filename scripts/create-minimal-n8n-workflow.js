#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

function loadEnv(filePath) {
  const env = {};
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  } catch {}
  return env;
}

function request(method, url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request({
      method,
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + (u.search || ''),
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 20000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function buildAuthHeaders(env) {
  const headers = {};
  if (env.N8N_API_KEY && env.N8N_API_KEY.trim()) {
    headers['X-N8N-API-KEY'] = env.N8N_API_KEY.trim();
  }
  if (env.N8N_BASIC_AUTH_USER && env.N8N_BASIC_AUTH_PASSWORD) {
    const token = Buffer.from(`${env.N8N_BASIC_AUTH_USER}:${env.N8N_BASIC_AUTH_PASSWORD}`).toString('base64');
    headers['Authorization'] = `Basic ${token}`;
  } else {
    const token = Buffer.from('admin:admin').toString('base64');
    headers['Authorization'] = `Basic ${token}`;
  }
  return headers;
}

function buildMinimalWorkflow() {
  const webhookPath = 'competitor-analysis';
  const nextWebhookUrl = 'http://host.docker.internal:3000/api/competitor-analysis/webhook';

  const nodes = [
    {
      parameters: {
        httpMethod: 'POST',
        path: webhookPath,
        responseMode: 'responseNode',
        options: {}
      },
      id: 'webhook-trigger',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [240, 300]
    },
    {
      parameters: {
        functionCode:
`const { analysisId, competitors } = $json;\n\nif (!analysisId || !competitors || !Array.isArray(competitors)) {\n  throw new Error('Datos de entrada inválidos');\n}\n\nconst normalized = competitors.map(c => typeof c === 'string' ? { url: c, name: c } : c);\n\nreturn {\n  analysisId,\n  competitors: normalized.slice(0, 5),\n  processedAt: new Date().toISOString()\n};`
      },
      id: 'process-input',
      name: 'Process Input',
      type: 'n8n-nodes-base.function',
      typeVersion: 1,
      position: [500, 300]
    },
    {
      parameters: {
        url: nextWebhookUrl,
        sendBody: true,
        bodyContentType: 'json',
        jsonBody:
`={ \"analysisId\": \"{{ $json.analysisId }}\", \"type\": \"competitor\", \"status\": \"processing\", \"results\": {{ JSON.stringify($json) }} }`,
        options: {}
      },
      id: 'notify-frontend',
      name: 'Notify Frontend',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 3,
      position: [760, 240]
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody:
`={ \"success\": true, \"analysisId\": \"{{ $json.analysisId }}\", \"status\": \"processing\" }`
      },
      id: 'respond-success',
      name: 'Respond to Webhook',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: [1000, 240]
    }
  ];

  const connections = {
    'webhook-trigger': { main: [[{ node: 'process-input', type: 'main', index: 0 }]] },
    'process-input': { main: [[{ node: 'notify-frontend', type: 'main', index: 0 }]] },
    'notify-frontend': { main: [[{ node: 'respond-success', type: 'main', index: 0 }]] }
  };

  return {
    name: 'Minimal Competitor Analysis',
    nodes,
    connections,
    settings: { saveManualExecutions: true },
    active: true
  };
}

async function createWorkflow(n8nBase, headers, payload) {
  // Try v1 API first
  let res = await request('POST', `${n8nBase}/api/v1/workflows`, payload, headers);
  if (res.status === 401 || res.status === 404 || res.status === 405) {
    // Try REST API
    res = await request('POST', `${n8nBase}/rest/workflows`, payload, headers);
  }
  return res;
}

async function main() {
  const root = process.cwd();
  const env = loadEnv(path.join(root, '.env.local'));
  const n8nBase = env.N8N_BASE_URL || 'http://localhost:5678';
  const headers = buildAuthHeaders(env);

  const workflow = buildMinimalWorkflow();
  const res = await createWorkflow(n8nBase, headers, workflow);

  const output = { status: res.status, body: null };
  try { output.body = JSON.parse(res.body); } catch { output.body = res.body; }
  console.log(JSON.stringify(output, null, 2));

  if (res.status < 200 || res.status >= 300) {
    console.error('Failed to create workflow');
    process.exit(1);
  }
}

main();