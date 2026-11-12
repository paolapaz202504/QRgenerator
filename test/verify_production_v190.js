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
  console.log('Verifying live production on https://qrbey.onrender.com/ for v1.9.0 ...');

  // 1. Check /api/health
  const health = await get('https://qrbey.onrender.com/api/health');
  console.log('Health status:', health.status, 'Payload:', health.data.trim());
  const healthJson = JSON.parse(health.data);
  if (healthJson.version !== '1.9.0') {
    throw new Error(`Expected version 1.9.0 but got ${healthJson.version}`);
  }

  // 2. Check Home /
  const home = await get('https://qrbey.onrender.com/');
  console.log('Home status:', home.status);
  console.log('Home has Precios button:', home.data.includes('Precios'));
  console.log('Home has Soluciones y Sectores:', home.data.includes('Soluciones y Sectores'));
  console.log('Home has Ayuda link to /#faq:', home.data.includes('href="/#faq"') && home.data.includes('Ayuda'));
  console.log('Home has Contacto in nav:', home.data.includes('href="/contacto"'));

  // 3. Check Contact Page /contacto
  const contact = await get('https://qrbey.onrender.com/contacto');
  console.log('Contact status:', contact.status);
  console.log('Contact has #contact-form:', contact.data.includes('id="contact-form"'));
  console.log('Contact has Breadcrumb:', contact.data.includes('aria-label="Breadcrumb"'));

  // 4. Check Secondary Page Breadcrumb (/restaurantes)
  const rest = await get('https://qrbey.onrender.com/restaurantes');
  console.log('Restaurantes status:', rest.status);
  console.log('Restaurantes has Breadcrumb:', rest.data.includes('aria-label="Breadcrumb"'));
  console.log('Restaurantes has Soluciones dropdown:', rest.data.includes('Soluciones y Sectores'));

  console.log('\n🎉 ALL LIVE PRODUCTION VERIFICATIONS PASSED FOR v1.9.0!');
}

run().catch(err => {
  console.error('❌ Production verification error:', err);
  process.exit(1);
});
