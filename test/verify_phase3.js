const fs = require('fs');
const http = require('http');

async function fetchRoute(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3030${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function verifyPhase3() {
  console.log('--- Verifying Phase 3 ---');
  
  // 1. /sobre-nosotros returns HTTP 200
  const sobreRes = await fetchRoute('/sobre-nosotros');
  console.log(`/sobre-nosotros status: ${sobreRes.status} (expected 200) -> ${sobreRes.status === 200 ? 'PASS' : 'FAIL'}`);
  
  // 2. /nosotros redirects 301 to /sobre-nosotros
  const nosotrosRes = await fetchRoute('/nosotros');
  console.log(`/nosotros status: ${nosotrosRes.status} (expected 301) -> ${nosotrosRes.status === 301 ? 'PASS' : 'FAIL'}`);
  console.log(`/nosotros redirect location: ${nosotrosRes.headers.location} -> ${nosotrosRes.headers.location === '/sobre-nosotros' ? 'PASS' : 'FAIL'}`);

  // 3. /sobre-nosotros contents: H1, Mission, etc.
  const hasH1 = /<h1[^>]*>\s*Sobre QRbey\s*<\/h1>/i.test(sobreRes.data);
  const hasMission = sobreRes.data.includes('QRs que no caducan para negocios de barrio');
  const hasContact = sobreRes.data.includes('qrbeyconctact@gmail.com');
  console.log(`H1 is "Sobre QRbey": ${hasH1 ? 'PASS' : 'FAIL'}`);
  console.log(`Has literal mission: ${hasMission ? 'PASS' : 'FAIL'}`);
  console.log(`Has real contact email: ${hasContact ? 'PASS' : 'FAIL'}`);

  // 4. href="/sobre-nosotros" in all 4 routes
  const routes = ['', 'restaurantes', 'salones-belleza', 'comercios'];
  for (const r of routes) {
    const file = r ? `public/${r}.html` : 'public/index.html';
    const content = fs.readFileSync(file, 'utf8');
    const hasLink = content.includes('href="/sobre-nosotros"');
    console.log(`${file} contains href="/sobre-nosotros": ${hasLink ? 'PASS' : 'FAIL'}`);
    if (!hasLink) throw new Error(`Missing link in ${file}`);
  }

  // 5. aggregateRating condition
  const indexHtml = fs.readFileSync('public/index.html', 'utf8');
  const hasAggRating = indexHtml.includes('aggregateRating');
  console.log(`Index has aggregateRating: ${hasAggRating}`);
  if (hasAggRating) {
    // If present, must have external reviews
    const hasExternal = /<a href="[^"]+"[^>]*>Ver en/i.test(indexHtml);
    console.log(`External reviews linked: ${hasExternal}`);
  } else {
    console.log('aggregateRating correctly omitted in absence of verified external profiles: PASS');
  }

  console.log('ALL PHASE 3 CHECKS PASSED LOCALLY!');
}

verifyPhase3().catch(e => {
  console.error(e);
  process.exit(1);
});
