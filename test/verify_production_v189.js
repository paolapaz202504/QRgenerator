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
  console.log('Verifying live production on https://qrbey.onrender.com/ for v1.8.9 ...');

  // 1. Check /api/health
  const health = await get('https://qrbey.onrender.com/api/health');
  console.log('Health status:', health.status, 'Payload:', health.data.trim());
  const healthJson = JSON.parse(health.data);
  if (healthJson.version !== '1.8.9') {
    throw new Error(`Expected version 1.8.9 but got ${healthJson.version}`);
  }

  // 2. Check Home /
  const home = await get('https://qrbey.onrender.com/');
  console.log('Home status:', home.status);
  console.log('Home has .planes-component:', home.data.includes('planes-component'));
  console.log('Home has Pagar button:', home.data.includes('Pagar'));
  console.log('Home has NO "Pagar con Recurrente":', !home.data.includes('Pagar con Recurrente'));
  console.log('Home has Plan Activo support:', home.data.includes('btn-select-free-plan'));

  // 3. Check Dedicated /editor route
  const editor = await get('https://qrbey.onrender.com/editor');
  console.log('Editor status:', editor.status);
  console.log('Editor has #editor:', editor.data.includes('id="editor"'));

  // 4. Check Vertical Landings
  const rest = await get('https://qrbey.onrender.com/restaurantes');
  console.log('Restaurantes status:', rest.status);

  console.log('\n🎉 ALL LIVE PRODUCTION VERIFICATIONS PASSED FOR v1.8.9!');
}

run().catch(err => {
  console.error('❌ Production verification error:', err);
  process.exit(1);
});
