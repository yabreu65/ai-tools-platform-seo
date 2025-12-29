#!/usr/bin/env node

/**
 * Interactive guide to create and activate the n8n workflow for Competitor Analysis.
 * This script prints clear, step-by-step instructions and verifies readiness by
 * testing the webhook endpoints when you indicate you are done.
 */

const readline = require('readline');
const http = require('http');
const https = require('https');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const SAMPLE_PAYLOAD = {
  analysisId: 'demo-123',
  competitors: [{ url: 'https://example.com', name: 'Demo' }],
  analysisTypes: ['seo']
};

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function postJson(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;

    const data = JSON.stringify(SAMPLE_PAYLOAD);
    const { hostname, port, path } = new URL(url);

    const req = client.request(
      { hostname, port, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );

    req.on('error', (err) => resolve({ status: 0, body: String(err) }));
    req.write(data);
    req.end();
  });
}

async function checkReadiness() {
  console.log('\nVerificando endpoints del webhook...');
  const prod = await postJson('http://localhost:5678/webhook/competitor-analysis');
  const test = await postJson('http://localhost:5678/webhook/test/competitor-analysis');

  console.log(`- Producción (/webhook/competitor-analysis): HTTP ${prod.status}`);
  if (prod.status === 200 || (prod.status >= 200 && prod.status < 300)) {
    console.log('  ✓ El webhook de producción responde correctamente.');
  } else if (prod.status === 404) {
    console.log('  ✗ 404: El workflow puede no estar activado o la ruta difiere.');
  } else if (prod.status === 401) {
    console.log('  ✗ 401: Autenticación requerida o configuración de n8n restringida.');
  } else {
    console.log(`  ✗ Código inesperado: ${prod.status}`);
  }

  console.log(`- Test (/webhook/test/competitor-analysis): HTTP ${test.status}`);
  if (test.status === 200 || (test.status >= 200 && test.status < 300)) {
    console.log('  ✓ El endpoint de prueba responde. Esto indica que el Webhook está creado.');
  } else if (test.status === 404) {
    console.log('  ✗ 404 en test: El Webhook aún no está creado con esa ruta.');
  } else {
    console.log(`  ✗ Código inesperado en test: ${test.status}`);
  }

  console.log('\nRespuesta del servidor (si hubo cuerpo):');
  console.log('---');
  try { console.log(JSON.stringify(JSON.parse(prod.body), null, 2)); } catch { console.log(prod.body.slice(0, 400) || '(sin cuerpo)'); }
  console.log('---');
}

async function main() {
  console.log('\n=== Guía interactiva: Crear y activar el workflow de n8n (Competitor Analysis) ===');
  console.log('\nPrerrequisitos:');
  console.log('- Servicios corriendo: docker compose up -d');
  console.log('- Acceso a n8n: http://localhost:5678 (crear usuario si es primera vez)');

  await ask('\nPulsa Enter para ver los pasos de creación en la UI...');

  console.log('\n1) Crear workflow:');
  console.log('- Nombre: "Competitor Analysis Webhook"');
  console.log('- Descripción: Maneja POST /webhook/competitor-analysis y retorna confirmación');

  console.log('\n2) Añade nodo Webhook:');
  console.log('- HTTP Method: POST');
  console.log('- Path: competitor-analysis');
  console.log('- Response: Usa un nodo "Respond to Webhook" para responder');
  console.log('- (Opcional para pruebas rápidas) Response Mode: On Received');

  console.log('\n3) Añade nodo Function con el siguiente código (pégalo tal cual):');
  console.log('----- Function code start -----');
  console.log(`const input = $json;
return [{
  json: {
    ok: true,
    message: 'Competitor analysis received',
    analysisId: input.analysisId ?? 'demo-123',
    competitors: input.competitors ?? [],
    analysisTypes: input.analysisTypes ?? [],
    receivedAt: new Date().toISOString()
  }
}];`);
  console.log('----- Function code end -----');

  console.log('\n4) Añade nodo Respond to Webhook:');
  console.log('- Response Body: JSON');
  console.log('- JSON/Expression: {{$json}}');
  console.log('- Status Code: 200');

  console.log('\n5) Conecta los nodos en el orden: Webhook -> Function -> Respond to Webhook');

  console.log('\n6) Guarda y Activa el workflow (el endpoint de producción será /webhook/competitor-analysis).');

  console.log('\n7) Payload de prueba (para curl y para ejecutar desde la UI):');
  console.log(JSON.stringify(SAMPLE_PAYLOAD, null, 2));

  await ask('\nCuando hayas activado el workflow, pulsa Enter para verificar...');
  await checkReadiness();

  console.log('\nComandos útiles:');
  console.log('- Probar producción:');
  console.log("  curl -X POST http://localhost:5678/webhook/competitor-analysis -H 'Content-Type: application/json' -d '" + JSON.stringify(SAMPLE_PAYLOAD) + "'");
  console.log('- Probar test (si NO está activado):');
  console.log("  curl -X POST http://localhost:5678/webhook/test/competitor-analysis -H 'Content-Type: application/json' -d '" + JSON.stringify(SAMPLE_PAYLOAD) + "'");

  console.log('\nSiguiente paso en este proyecto:');
  console.log('- Ejecutar: node scripts/test-n8n-integration.js');
  console.log('- Probar desde el frontend: http://localhost:3000/generar-titulo-seo');

  rl.close();
}

main().catch((err) => {
  console.error('Error en la guía:', err);
  rl.close();
  process.exitCode = 1;
});