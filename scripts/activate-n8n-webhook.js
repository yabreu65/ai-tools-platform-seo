#!/usr/bin/env node
/**
 * Activates the n8n Competitor Analysis workflow via API.
 * - Reads N8N base URL and API key from project .env.local
 * - Attempts activation using both legacy and new endpoints
 * - Falls back with clear instructions if API key is missing or workflow not found
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

function log(msg) {
  console.log(`[activate-n8n] ${msg}`);
}

function readEnvLocal(rootDir) {
  const envPath = path.join(rootDir, '.env.local');
  const env = {};
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) {
        const key = m[1];
        let val = m[2];
        // strip quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
    }
  } catch (e) {
    log(`No se pudo leer .env.local: ${e.message}`);
  }
  return env;
}

function request(method, urlStr, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === 'https:' ? https : http;
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + (url.search || ''),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json;
        try { json = data ? JSON.parse(data) : null; } catch { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const env = readEnvLocal(root);

  const baseUrl = env.N8N_EDITOR_BASE_URL || 'http://localhost:5678';
  const apiKey = env.N8N_API_KEY || '';
  const workflowId = 'competitor-analysis-workflow';

  log(`Base URL: ${baseUrl}`);
  if (!apiKey) {
    log('ADVERTENCIA: N8N_API_KEY no está definido en .env.local. La activación probablemente fallará con 401.');
  }

  // Build headers: prefer API key, otherwise try Basic Auth (admin/admin)
  let commonHeaders = {};
  if (apiKey) {
    log('Usando X-N8N-API-Key de .env.local');
    commonHeaders['X-N8N-API-Key'] = apiKey;
  } else {
    const basicUser = env.N8N_BASIC_AUTH_USER || 'admin';
    const basicPass = env.N8N_BASIC_AUTH_PASSWORD || 'admin';
    const basicToken = Buffer.from(`${basicUser}:${basicPass}`).toString('base64');
    log(`Usando Basic Auth por defecto (${basicUser})`);
    commonHeaders['Authorization'] = `Basic ${basicToken}`;
  }

  // Try new REST API first: GET workflows, then POST activate
  try {
    log('Intentando descubrir workflows vía /rest/workflows ...');
    const listRest = await request('GET', `${baseUrl}/rest/workflows`, null, commonHeaders);
    if (listRest.status === 200 && Array.isArray(listRest.body?.data)) {
      const wf = listRest.body.data.find(w => w.id === workflowId || w.name === 'Competitor Analysis Workflow');
      if (wf) {
        log(`Workflow encontrado (rest): id=${wf.id}, active=${wf.active}`);
        const activateRest = await request('POST', `${baseUrl}/rest/workflows/${wf.id}/activate`, null, commonHeaders);
        if (activateRest.status >= 200 && activateRest.status < 300) {
          log('Activación exitosa vía REST.');
          console.log(JSON.stringify({ ok: true, method: 'rest', status: activateRest.status, body: activateRest.body }, null, 2));
          return;
        } else {
          log(`Fallo activando vía REST: ${activateRest.status} ${JSON.stringify(activateRest.body)}`);
        }
      } else {
        log('Workflow no ubicado en /rest/workflows.');
      }
    } else {
      log(`No se pudo listar /rest/workflows: status=${listRest.status}`);
    }
  } catch (e) {
    log(`Error REST: ${e.message}`);
  }

  // Fallback to legacy API v1
  try {
    log('Intentando activación vía /api/v1/workflows/activate ...');
    const activateV1 = await request('POST', `${baseUrl}/api/v1/workflows/activate`, { id: workflowId }, commonHeaders);
    if (activateV1.status >= 200 && activateV1.status < 300) {
      log('Activación exitosa vía API v1.');
      console.log(JSON.stringify({ ok: true, method: 'v1', status: activateV1.status, body: activateV1.body }, null, 2));
      return;
    } else {
      log(`Fallo activando vía API v1: ${activateV1.status} ${JSON.stringify(activateV1.body)}`);
    }
  } catch (e) {
    log(`Error API v1: ${e.message}`);
  }

  // If both failed, provide guidance
  log('No se pudo activar el workflow automáticamente. Recomendaciones:');
  log('- Verifica N8N_API_KEY en .env.local y reinicia n8n si lo agregaste.');
  log('- Abre n8n en el navegador: http://localhost:5678 y activá manualmente el workflow.');
  log('- Si el workflow no existe, importá el JSON: apps/n8n/flows/competitor-analysis-workflow.json');
  console.log(JSON.stringify({ ok: false, reason: 'activation_failed' }, null, 2));
}

main().catch(err => {
  log(`Error inesperado: ${err.message}`);
  process.exit(1);
});