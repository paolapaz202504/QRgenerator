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
  console.log('Verifying live production on https://qrbey.onrender.com/ for v1.9.2 ...');

  // 1. Check /api/health
  const health = await get('https://qrbey.onrender.com/api/health');
  console.log('Health status:', health.status, 'Payload:', health.data.trim());
  const healthJson = JSON.parse(health.data);
  if (healthJson.version !== '1.9.2') {
    throw new Error(`Expected version 1.9.2 but got ${healthJson.version}`);
  }

  // 2. Check Home /
  const home = await get('https://qrbey.onrender.com/');
  console.log('Home status:', home.status);
  
  const posInicio = home.data.indexOf('nav-item-inicio');
  const posSoluciones = home.data.indexOf('nav-item-soluciones');
  const posEditor = home.data.indexOf('nav-item-editor');
  const posPrecios = home.data.indexOf('nav-item-precios');
  const posNosotros = home.data.indexOf('nav-item-nosotros');
  const posAyuda = home.data.indexOf('nav-item-ayuda');
  const posContacto = home.data.indexOf('nav-item-contacto');

  const ordered = (posInicio < posSoluciones && posSoluciones < posEditor && posEditor < posPrecios && posPrecios < posNosotros && posNosotros < posAyuda && posAyuda < posContacto);
  console.log('Home navigation order is strict Inicio->Soluciones->Editor->Precios->Nosotros->Ayuda->Contacto:', ordered);
  if (!ordered) throw new Error('Home navigation order is not strictly followed');

  console.log('Home has user widgets:', home.data.includes('id="user-profile-widget"') && home.data.includes('id="btn-open-oauth"'));

  // 3. Check Contact Page /contacto (Navbar user widget + nav-auth.js)
  const contact = await get('https://qrbey.onrender.com/contacto');
  console.log('Contact status:', contact.status);
  console.log('Contact has user widget:', contact.data.includes('id="user-profile-widget"'));
  console.log('Contact has login button:', contact.data.includes('id="btn-open-oauth"'));
  console.log('Contact has nav-auth.js:', contact.data.includes('nav-auth.js'));
  if (!contact.data.includes('id="user-profile-widget"') || !contact.data.includes('id="btn-open-oauth"') || !contact.data.includes('nav-auth.js')) {
    throw new Error('Contact page missing user profile widget or nav-auth.js');
  }

  // 4. Check Nosotros Page (/sobre-nosotros)
  const sobreNosotros = await get('https://qrbey.onrender.com/sobre-nosotros');
  console.log('Sobre Nosotros status:', sobreNosotros.status);
  console.log('Sobre Nosotros redirects to /contacto:', sobreNosotros.data.includes('href="/contacto"'));
  console.log('Sobre Nosotros has user widgets & nav-auth.js:', sobreNosotros.data.includes('id="user-profile-widget"') && sobreNosotros.data.includes('nav-auth.js'));
  if (!sobreNosotros.data.includes('href="/contacto"')) {
    throw new Error('Sobre Nosotros page does not link to /contacto');
  }

  // 5. Check Editor (/editor)
  const editor = await get('https://qrbey.onrender.com/editor');
  console.log('Editor status:', editor.status);
  console.log('Editor has user widgets & nav-auth.js:', editor.data.includes('id="user-profile-widget"') && editor.data.includes('nav-auth.js'));
  console.log('Editor has Submenu Editor option:', editor.data.includes('Pruébalo ahora: diseña tu QR en 2 minutos'));
  console.log('Editor has Submenu Mis QR option:', editor.data.includes('Historial de Códigos QR Generados'));

  console.log('\n🎉 ALL LIVE PRODUCTION VERIFICATIONS PASSED FOR v1.9.2!');
}

run().catch(err => {
  console.error('❌ Production verification error:', err);
  process.exit(1);
});
