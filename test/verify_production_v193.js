const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

function post(url, payload) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        data: Buffer.concat(chunks)
      }));
    });
    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

async function run() {
  console.log('Verifying live production on https://qrbey.onrender.com/ for v1.9.3 ...');

  // 1. Check /api/health
  const health = await get('https://qrbey.onrender.com/api/health');
  console.log('Health status:', health.status, 'Payload:', health.data.trim());
  const healthJson = JSON.parse(health.data);
  if (healthJson.version !== '1.9.3') {
    throw new Error(`Expected version 1.9.3 but got ${healthJson.version}`);
  }

  // 2. Check Home / contains #mini-editor between #hero and #como-funciona
  const home = await get('https://qrbey.onrender.com/');
  console.log('Home status:', home.status);

  const posHero = home.data.indexOf('id="hero"');
  const posMiniEditor = home.data.indexOf('id="mini-editor"');
  const posComoFunciona = home.data.indexOf('id="como-funciona"');

  const ordered = (posHero !== -1 && posMiniEditor !== -1 && posComoFunciona !== -1 && posHero < posMiniEditor && posMiniEditor < posComoFunciona);
  console.log('Mini-Editor positioned strictly between Hero and Como Funciona:', ordered);
  if (!ordered) throw new Error('Mini-editor position failed in home HTML');

  console.log('Mini-Editor has #mini-qr-input:', home.data.includes('id="mini-qr-input"'));
  console.log('Mini-Editor has #mini-qr-btn:', home.data.includes('id="mini-qr-btn"'));
  console.log('Mini-Editor has #mini-result (aria-live="polite"):', home.data.includes('id="mini-result"') && home.data.includes('aria-live="polite"'));
  console.log('Mini-Editor has #mini-btn-customize & #mini-btn-download:', home.data.includes('id="mini-btn-customize"') && home.data.includes('id="mini-btn-download"'));
  console.log('Mini-Editor has presets chips:', home.data.includes('data-preset="restaurante"') && home.data.includes('data-preset="salon"'));

  if (!home.data.includes('id="mini-qr-input"') || !home.data.includes('id="mini-qr-btn"') || !home.data.includes('id="mini-result"')) {
    throw new Error('Mini-editor missing key interactive elements');
  }

  // 3. Test Anonymous Generation on /api/generate
  const demoGen = await post('https://qrbey.onrender.com/api/generate', {
    url: 'https://mirestaurante.com/menu',
    isExplicitGenerate: false,
    designId: 'design-gastronomia-1',
    targetWidth: 400
  });
  console.log('Anonymous Demo QR generation status:', demoGen.status, 'Content-Type:', demoGen.headers['content-type'], 'Bytes:', demoGen.data.length);
  if (demoGen.status !== 200 || !demoGen.headers['content-type'].includes('image/png') || demoGen.data.length < 100) {
    throw new Error('Anonymous Demo QR generation failed on live server');
  }

  // 4. Verify /editor route and step1 partial (containing #qr-url)
  const editor = await get('https://qrbey.onrender.com/editor?url=https%3A%2F%2Fmirestaurante.com%2Fmenu&preset=restaurante');
  console.log('Editor status:', editor.status);
  console.log('Editor has #editor section:', editor.data.includes('id="editor"'));
  console.log('Editor has #step1-container:', editor.data.includes('id="step1-container"'));
  
  const step1 = await get('https://qrbey.onrender.com/html/step1-info.html');
  console.log('Step 1 partial has #qr-url:', step1.data.includes('id="qr-url"'));
  
  if (editor.status !== 200 || !editor.data.includes('id="editor"') || !step1.data.includes('id="qr-url"')) {
    throw new Error('Editor route verification failed');
  }

  console.log('\n🎉 ALL LIVE PRODUCTION VERIFICATIONS PASSED FOR v1.9.3!');
}

run().catch(err => {
  console.error('❌ Production verification error:', err);
  process.exit(1);
});
