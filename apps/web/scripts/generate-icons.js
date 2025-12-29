const fs = require('fs');
const path = require('path');

// Simple script to create placeholder favicon files
// In production, you should use proper icons generated from your logo

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '../public');

// Create a simple 1x1 transparent PNG (base64)
const transparentPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

console.log('📱 Generando iconos placeholder...\n');

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(publicDir, filename);

  // Write the same transparent PNG for all sizes
  // In a real scenario, you'd resize the actual logo
  fs.writeFileSync(filepath, transparentPNG);
  console.log(`✅ Creado: ${filename}`);
});

// Create favicons
const faviconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 }
];

faviconSizes.forEach(({ name }) => {
  const filepath = path.join(publicDir, name);
  fs.writeFileSync(filepath, transparentPNG);
  console.log(`✅ Creado: ${name}`);
});

console.log('\n✨ Iconos placeholder generados correctamente!');
console.log('⚠️  IMPORTANTE: Estos son iconos temporales transparentes.');
console.log('📝 Para producción, reemplázalos con tu logo real usando:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://favicon.io/');
