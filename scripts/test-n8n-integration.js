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
  const report = { timestamp: new Date().toISOString(), checks: {} };

  try {
    // Health checks
    report.checks.n8n_healthz = await fetch('http://localhost:5678/healthz').catch(() => ({ status: 0 }));
    report.checks.n8n_health = report.checks.n8n_healthz.status === 200 ? report.checks.n8n_healthz : await fetch('http://localhost:5678/health').catch(() => ({ status: 0 }));
    report.checks.web_ping = await fetch('http://localhost:3000/api/ping').catch(() => ({ status: 0 }));
    report.checks.backend_health = await fetch('http://localhost:3001/api/keyword-scraper/health').catch(() => ({ status: 0 }));

    // Trigger competitor analysis webhook (test payload)
    const payload = {
      analysisId: `test-${Date.now()}`,
      competitors: [{ url: 'https://example.com' }],
      userPlan: 'basic'
    };

    report.checks.trigger_competitor = await fetch('http://localhost:5678/webhook/competitor-analysis', {
      method: 'POST',
      body: payload,
    }).catch((e) => ({ status: 0, error: e.message }));

    // Read back results from Next.js API if available
    if (report.checks.trigger_competitor.status === 200) {
      const analysisId = payload.analysisId;
      report.checks.results_status = await fetch(`http://localhost:3000/api/competitor-analysis/status/${analysisId}`).catch(() => ({ status: 0 }));
      report.checks.results_details = await fetch(`http://localhost:3000/api/competitor-analysis/results/${analysisId}`).catch(() => ({ status: 0 }));
    }
  } catch (error) {
    report.error = error.message;
  }

  console.log(JSON.stringify(report, null, 2));
}

main();