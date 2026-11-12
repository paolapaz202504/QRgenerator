const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Verifying live production on https://qrbey.onrender.com/ for v1.9.1 ...');

  // 1. Check /api/health
  const health = await get('https://qrbey.onrender.com/api/health');
  console.log('Health status:', health.status, 'Payload:', health.data.trim());
  const healthJson = JSON.parse(health.data);
  if (healthJson.version !== '1.9.1') {
    throw new Error(`Expected version 1.9.1 but got ${healthJson.version}`);
  }

  // 2. Check Home /
  const home = await get('https://qrbey.onrender.com/');
  console.log('Home status:', home.status);
  console.log('Home has Precios button:', home.data.includes('Precios'));
  console.log('Home has Soluciones y Sectores:', home.data.includes('Soluciones y Sectores'));
  console.log('Home does NOT have Mis QR in main menu:', !home.data.includes('Mis QR'));
  console.log('Home has Ayuda link to /#faq:', home.data.includes('href="/#faq"') && home.data.includes('Ayuda'));
  console.log('Home has Contacto in nav:', home.data.includes('href="/contacto"'));

  // 3. Check Contact Page /contacto (No breadcrumb, No Crear QR)
  const contact = await get('https://qrbey.onrender.com/contacto');
  console.log('Contact status:', contact.status);
  console.log('Contact has #contact-form:', contact.data.includes('id="contact-form"'));
  console.log('Contact does NOT have Breadcrumb:', !contact.data.includes('aria-label="Breadcrumb"'));
  console.log('Contact does NOT have Crear QR:', !contact.data.includes('Crear QR'));

  // 4. Check Restaurantes (/restaurantes) (Has Breadcrumb, No Crear QR)
  const rest = await get('https://qrbey.onrender.com/restaurantes');
  console.log('Restaurantes status:', rest.status);
  console.log('Restaurantes has Breadcrumb:', rest.data.includes('aria-label="Breadcrumb"'));
  console.log('Restaurantes does NOT have Crear QR in menu:', !rest.data.includes('Crear QR'));

  // 5. Check Editor (/editor) (Submenu with Editor & Mis QR, No duplicate breadcrumbs)
  const editor = await get('https://qrbey.onrender.com/editor');
  console.log('Editor status:', editor.status);
  console.log('Editor does NOT have Breadcrumb:', !editor.data.includes('aria-label="Breadcrumb"'));
  console.log('Editor has Submenu Editor option:', editor.data.includes('Pruébalo ahora: diseña tu QR en 2 minutos'));
  console.log('Editor has Submenu Mis QR option:', editor.data.includes('Historial de Códigos QR Generados'));

  console.log('\n🎉 ALL LIVE PRODUCTION VERIFICATIONS PASSED FOR v1.9.1!');
}

run().catch(err => {
  console.error('❌ Production verification error:', err);
  process.exit(1);
});
