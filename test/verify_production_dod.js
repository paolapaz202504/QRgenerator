const https = require('https');
const fs = require('fs');

async function fetchRoute(path) {
  return new Promise((resolve, reject) => {
    https.get(`https://qrbey.onrender.com${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function verifyProductionDoD() {
  console.log('=== VERIFICANDO DEFINITION OF DONE EN PRODUCCIÓN (https://qrbey.onrender.com) ===');
  
  // F1 Checks
  console.log('\n[F1 - Home]');
  const home = await fetchRoute('/');
  const h1Count = (home.data.match(/<h1\b/gi) || []).length;
  console.log(`H1 count: ${h1Count} (esperado 1): ${h1Count === 1 ? 'PASS' : 'FAIL'}`);
  console.log(`id="hero" presente: ${home.data.includes('id="hero"') ? 'PASS' : 'FAIL'}`);
  if (h1Count !== 1 || !home.data.includes('id="hero"')) throw new Error('F1 Failed in production');

  // F2 Checks
  console.log('\n[F2 - Verticales & SEO]');
  const verticals = ['/restaurantes', '/salones-belleza', '/comercios'];
  for (const r of verticals) {
    const res = await fetchRoute(r);
    const hasLd = res.data.includes('application/ld+json');
    const hasCanonical = res.data.includes('rel="canonical"');
    console.log(`${r}: Status ${res.status} (200), ld+json: ${hasLd}, canonical: ${hasCanonical}`);
    if (res.status !== 200 || !hasLd || !hasCanonical) throw new Error(`F2 Failed for ${r} in production`);
  }

  const sitemap = await fetchRoute('/sitemap.xml');
  const locCount = (sitemap.data.match(/<loc>/g) || []).length;
  console.log(`sitemap.xml loc count: ${locCount} (esperado >= 4): ${locCount >= 4 ? 'PASS' : 'FAIL'}`);
  if (locCount < 4) throw new Error('F2 Failed sitemap in production');

  // F3 Checks
  console.log('\n[F3 - E-E-A-T & Sobre Nosotros]');
  const sobre = await fetchRoute('/sobre-nosotros');
  console.log(`/sobre-nosotros status: ${sobre.status} (esperado 200): ${sobre.status === 200 ? 'PASS' : 'FAIL'}`);
  if (sobre.status !== 200) throw new Error('F3 Failed /sobre-nosotros in production');

  if (home.data.includes('aggregateRating')) {
    const match = home.data.match(/<a href="([^"]+)"[^>]*>Ver en/i);
    if (!match || match[1].includes('qrbey.onrender.com')) {
      throw new Error('F3 Failed: aggregateRating present without external verified review URL');
    }
  } else {
    console.log('aggregateRating correctamente omitido en JSON-LD ante ausencia de enlaces externos: PASS');
  }

  // F4 Checks
  console.log('\n[F4 - Integración IA / API]');
  const apiRes = await fetchRoute('/api');
  console.log(`/api status: ${apiRes.status} (esperado 200): ${apiRes.status === 200 ? 'PASS' : 'FAIL'}`);
  if (apiRes.status !== 200) throw new Error('F4 Failed /api in production');

  const kpisOk = fs.existsSync('metrics/kpis.csv');
  const promptsOk = fs.existsSync('metrics/geo-prompts.txt');
  console.log(`metrics/kpis.csv: ${kpisOk ? 'PASS' : 'FAIL'}, geo-prompts.txt: ${promptsOk ? 'PASS' : 'FAIL'}`);
  if (!kpisOk || !promptsOk) throw new Error('F4 Failed metrics files');

  console.log('\n=============================================');
  console.log('🎉 ALL CHECKS PASSED EN PRODUCCIÓN EN VIVO');
  console.log('=============================================');
}

verifyProductionDoD().catch(e => {
  console.error('\n❌ ERROR EN PRODUCCIÓN:', e.message);
  process.exit(1);
});
