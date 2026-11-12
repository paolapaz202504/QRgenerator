const http = require('http');
const fs = require('fs');

async function fetchRoute(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3030${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function runDoD() {
  console.log('=== DEFINITION OF DONE VERIFICATION ===');
  
  // F1 Checks
  console.log('\n[F1 Verification]');
  const home = await fetchRoute('/');
  const h1Count = (home.data.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) throw new Error(`F1 Failed: Expected exactly 1 H1 on home, found ${h1Count}`);
  if (!home.data.includes('id="hero"')) throw new Error('F1 Failed: id="hero" not found on home');
  console.log('✅ F1 Passed: Exactly 1 H1 and id="hero" present.');

  // F2 Checks
  console.log('\n[F2 Verification]');
  const verticals = ['/restaurantes', '/salones-belleza', '/comercios'];
  for (const r of verticals) {
    const res = await fetchRoute(r);
    if (res.status !== 200) throw new Error(`F2 Failed: ${r} returned status ${res.status}`);
    if (!res.data.includes('application/ld+json')) throw new Error(`F2 Failed: ${r} missing application/ld+json`);
    if (!res.data.includes('rel="canonical"')) throw new Error(`F2 Failed: ${r} missing rel="canonical"`);
    console.log(`✅ F2 Passed for ${r}: HTTP 200, ld+json present, canonical present`);
  }

  const sitemap = await fetchRoute('/sitemap.xml');
  const locCount = (sitemap.data.match(/<loc>/g) || []).length;
  if (locCount < 4) throw new Error(`F2 Failed: sitemap loc count ${locCount} is less than 4`);
  console.log(`✅ F2 Passed: sitemap.xml has ${locCount} URLs (>= 4).`);

  // F3 Checks
  console.log('\n[F3 Verification]');
  const sobre = await fetchRoute('/sobre-nosotros');
  if (sobre.status !== 200) throw new Error(`F3 Failed: /sobre-nosotros returned status ${sobre.status}`);
  console.log('✅ F3 Passed: /sobre-nosotros returned HTTP 200');

  if (home.data.includes('aggregateRating')) {
    const match = home.data.match(/<a href="([^"]+)"[^>]*>Ver en/i);
    if (!match || match[1].includes('qrbey.onrender.com')) {
      throw new Error('F3 Failed: aggregateRating present without external verified review URL');
    }
  } else {
    console.log('✅ F3 Passed: aggregateRating omitted cleanly in absence of external reviews');
  }

  // F4 Checks
  console.log('\n[F4 Verification]');
  const apiRes = await fetchRoute('/api');
  if (apiRes.status !== 200) throw new Error(`F4 Failed: /api returned status ${apiRes.status}`);
  console.log('✅ F4 Passed: /api returned HTTP 200');

  if (!fs.existsSync('metrics/kpis.csv')) throw new Error('F4 Failed: metrics/kpis.csv does not exist');
  if (!fs.existsSync('metrics/geo-prompts.txt')) throw new Error('F4 Failed: metrics/geo-prompts.txt does not exist');
  
  const promptsCount = fs.readFileSync('metrics/geo-prompts.txt', 'utf8').trim().split('\n').length;
  if (promptsCount !== 5) throw new Error(`F4 Failed: geo-prompts.txt has ${promptsCount} lines, expected 5`);
  console.log(`✅ F4 Passed: metrics/kpis.csv exists and metrics/geo-prompts.txt has 5 prompts.`);

  console.log('\n==================================');
  console.log('🎉 ALL CHECKS PASSED');
  console.log('==================================');
}

runDoD().catch(e => {
  console.error('\n❌ DEFINITION OF DONE FAILED:', e.message);
  process.exit(1);
});
