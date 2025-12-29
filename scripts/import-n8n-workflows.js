#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Minimal .env loader
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

function buildAuthHeaders(env) {
  const headers = {};
  if (env.N8N_API_KEY && env.N8N_API_KEY.trim()) {
    headers['Authorization'] = `Bearer ${env.N8N_API_KEY.trim()}`;
  } else if (env.N8N_BASIC_AUTH_USER && env.N8N_BASIC_AUTH_PASSWORD) {
    const token = Buffer.from(`${env.N8N_BASIC_AUTH_USER}:${env.N8N_BASIC_AUTH_PASSWORD}`).toString('base64');
    headers['Authorization'] = `Basic ${token}`;
  } else {
    // Fallback to default admin/admin when docker-compose sets it
    const token = Buffer.from(`admin:admin`).toString('base64');
    headers['Authorization'] = `Basic ${token}`;
  }
  return headers;
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
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function importWorkflow(n8nBase, headers, workflowJson) {
  // Try v1 API first
  let res = await request('POST', `${n8nBase}/api/v1/workflows`, workflowJson, headers);
  if (res.status === 401 || res.status === 404 || res.status === 405) {
    // Try REST API fallback
    res = await request('POST', `${n8nBase}/rest/workflows`, workflowJson, headers);
  }
  if (res.status >= 200 && res.status < 300) {
    try {
      const data = JSON.parse(res.body || '{}');
      return { ok: true, id: data.id || data.data?.id || data?.data?.workflow?.id, raw: data };
    } catch {
      return { ok: true, id: null, raw: res.body };
    }
  }
  return { ok: false, status: res.status, body: res.body };
}

async function activateWorkflow(n8nBase, headers, workflowId) {
  if (!workflowId) return { ok: false, error: 'No workflow ID to activate' };
  // Try v1 PATCH
  let res = await request('PATCH', `${n8nBase}/api/v1/workflows/${workflowId}`, { active: true }, headers);
  if (res.status === 401 || res.status === 404 || res.status === 405) {
    // REST PATCH
    res = await request('PATCH', `${n8nBase}/rest/workflows/${workflowId}`, { active: true }, headers);
  }
  if (res.status >= 200 && res.status < 300) return { ok: true };
  return { ok: false, status: res.status, body: res.body };
}

async function listWorkflows(n8nBase, headers) {
  let res = await request('GET', `${n8nBase}/api/v1/workflows`, null, headers);
  if (res.status === 401 || res.status === 404 || res.status === 405) {
    res = await request('GET', `${n8nBase}/rest/workflows`, null, headers);
  }
  if (res.status >= 200 && res.status < 300) {
    try { return JSON.parse(res.body); } catch { return res.body; }
  }
  return null;
}

async function main() {
  const root = process.cwd();
  const env = loadEnv(path.join(root, '.env.local'));
  const n8nBase = env.N8N_BASE_URL || 'http://localhost:5678';
  const headers = buildAuthHeaders(env);

  const flowsDir = path.join(root, 'apps', 'n8n', 'flows');
  if (!fs.existsSync(flowsDir)) {
    console.error(`Flows directory not found: ${flowsDir}`);
    process.exit(1);
  }

  // Pre-check: list workflows to verify auth
  const list = await listWorkflows(n8nBase, headers);
  if (!list) {
    console.warn('No se pudo listar workflows. Verifica N8N_API_KEY o Basic Auth (admin/admin).');
  }

  const files = fs.readdirSync(flowsDir).filter(f => f.endsWith('.json'));
  const report = { base: n8nBase, imported: [], activated: [], errors: [], files };

  for (const file of files) {
    const fullPath = path.join(flowsDir, file);
    try {
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const json = JSON.parse(raw);

      // Import
      const imp = await importWorkflow(n8nBase, headers, json);
      if (!imp.ok) {
        report.errors.push({ file, action: 'import', status: imp.status, body: imp.body });
        continue;
      }

      const workflowId = imp.id || imp.raw?.id || imp.raw?.data?.id;
      report.imported.push({ file, id: workflowId });

      // Activate
      const act = await activateWorkflow(n8nBase, headers, workflowId);
      if (!act.ok) {
        report.errors.push({ file, action: 'activate', status: act.status, body: act.body, id: workflowId });
      } else {
        report.activated.push({ file, id: workflowId });
      }

    } catch (e) {
      report.errors.push({ file, action: 'read_or_parse', error: e.message });
    }
  }

  console.log(JSON.stringify(report, null, 2));
}

main();