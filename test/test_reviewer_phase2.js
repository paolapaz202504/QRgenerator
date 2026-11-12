const http = require('http');

async function fetchRoute(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3030${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function runReviewerPhase2() {
  console.log('--- Reviewer Commands for Phase 2 ---');
  
  const routes = ['/restaurantes', '/salones-belleza', '/comercios'];
  for (const r of routes) {
    const res = await fetchRoute(r);
    const hasH1 = /<h1\b/i.test(res.data);
    const ldCount = (res.data.match(/application\/ld\+json/g) || []).length;
    console.log(`${r}: HTTP ${res.status} (expected 200), hasH1: ${hasH1}, ld+json count: ${ldCount} (>= 1)`);
    if (res.status !== 200 || !hasH1 || ldCount < 1) {
      throw new Error(`Failed check on route ${r}`);
    }
  }

  const sitemapRes = await fetchRoute('/sitemap.xml');
  const locCount = (sitemapRes.data.match(/<loc>/g) || []).length;
  console.log(`sitemap.xml loc count: ${locCount} (expected == 4): ${locCount === 4 ? 'PASS' : 'FAIL'}`);

  const robotsRes = await fetchRoute('/robots.txt');
  const hasSitemapInRobots = robotsRes.data.includes('Sitemap:');
  console.log(`robots.txt has Sitemap: ${hasSitemapInRobots ? 'PASS' : 'FAIL'}`);

  const urls = ['/', '/restaurantes', '/salones-belleza', '/comercios'];
  for (const u of urls) {
    const res = await fetchRoute(u);
    const hasCanonical = res.data.includes('rel="canonical"');
    const hasOgTitle = res.data.includes('og:title');
    console.log(`${u}: canonical: ${hasCanonical ? 'PASS' : 'FAIL'}, og:title: ${hasOgTitle ? 'PASS' : 'FAIL'}`);
    if (!hasCanonical || !hasOgTitle) throw new Error(`Failed metadata check on ${u}`);
  }

  console.log('ALL PHASE 2 REVIEWER CHECKS PASSED LOCALLY!');
}

runReviewerPhase2().catch(e => {
  console.error(e);
  process.exit(1);
});
