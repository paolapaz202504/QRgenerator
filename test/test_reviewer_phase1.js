const http = require('http');

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function runReviewerChecks() {
  const html = await fetchHtml('http://localhost:3030/');
  
  console.log('--- Reviewer Commands for Phase 1 ---');
  
  // 1. id="hero"
  const hasHero = html.includes('id="hero"');
  console.log('grep -q id="hero":', hasHero ? 'PASS' : 'FAIL');
  
  // 2. <h1 id="hero-h1">
  const hasHeroH1 = html.includes('<h1 id="hero-h1">') || /<h1\b[^>]*\bid=['"]hero-h1['"]/i.test(html);
  console.log('grep -q <h1 id="hero-h1">: ', hasHeroH1 ? 'PASS' : 'FAIL');
  
  // 3. Exactly one <h1>
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  console.log('grep -c <h1 == 1:', h1Count === 1 ? `PASS (${h1Count})` : `FAIL (${h1Count})`);
  
  // 4. Plans context
  const plans = ["1 QR estático", "QRs dinámicos ilimitados", "multi-sucursal, API"];
  const plansPass = plans.every(p => html.includes(p));
  console.log('for plan in ... grep -q "$plan":', plansPass ? 'PASS' : 'FAIL');
  
  // 5. Forbidden patterns
  const forbiddenRegex = /ACCESO OFICIAL|PORTAL DIGITAL|CERTIFICADO ISO|SPA & RELAX|ECO BARRIO|TEST DRIVE/i;
  const noForbidden = !forbiddenRegex.test(html);
  console.log('Forbidden patterns check:', noForbidden ? 'PASS' : 'FAIL');
  
  // 6. DOM Order
  const { verifyDomOrder } = require('./verify_dom_order');
  const domRes = verifyDomOrder(html);
  console.log('DOM Order check:', domRes.pass ? 'PASS' : 'FAIL');
}

runReviewerChecks().catch(console.error);
