#!/usr/bin/env node
'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');

function fetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request({
      method: opts.method || 'GET',
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + (u.search || ''),
      headers: Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}),
      timeout: opts.timeout || 10000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body));
    req.end();
  });
}

async function main() {
  const report = { timestamp: new Date().toISOString(), steps: {} };

  // 1) Health checks
  report.steps.web_ping = await fetch('http://localhost:3000/api/ping').catch(() => ({ status: 0 }));
  report.steps.backend_health = await fetch('http://localhost:3001/api/keyword-scraper/health').catch(() => ({ status: 0 }));
  report.steps.mongo_check = await fetch('http://localhost:3000/api/competitor-analysis/status/test-manual').catch(() => ({ status: 0 }));

  // 2) Probar endpoint backend directamente (simulación de análisis)
  const sampleCompetitors = [
    'https://example.com',
    'https://example.org'
  ];

  // Si existe una ruta para iniciar análisis en backend, úsala. De lo contrario, usar Next.js
  // Intento Next.js iniciar análisis con formato esperado (array de URLs)
  const analyzeReq = {
    analysisId: `manual-${Date.now()}`,
    competitors: sampleCompetitors,
    analysisType: 'full',
    depth: 3,
    includeHistorical: false,
    keywordLimit: 50
  };

  report.steps.nextjs_analyze = await fetch('http://localhost:3000/api/competitor-analysis/analyze', {
    method: 'POST',
    body: analyzeReq,
  }).catch((e) => ({ status: 0, error: e.message }));

  // 3) Consultar estado/resultados (Mongo vía Next.js)
  const aid = analyzeReq.analysisId;
  report.steps.results_status = await fetch(`http://localhost:3000/api/competitor-analysis/status/${aid}`).catch(() => ({ status: 0 }));
  report.steps.results_details = await fetch(`http://localhost:3000/api/competitor-analysis/results/${aid}`).catch(() => ({ status: 0 }));

  console.log(JSON.stringify(report, null, 2));
}

main();