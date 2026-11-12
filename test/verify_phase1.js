const fs = require('fs');

function verifyPhase1(html) {
  const results = {
    f1_t1_hero: false,
    f1_t1_h1_unique: false,
    f1_t2_dom_order: false,
    f1_t3_plans_context: false,
    f1_t4_no_forbidden_text: false,
    all_pass: false,
    detected_order: [],
    details: []
  };

  // 1. Hero exists
  results.f1_t1_hero = /<section\b[^>]*\bid=['"]hero['"]/i.test(html);
  
  // 2. Exactly one H1
  const h1Matches = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  results.f1_t1_h1_unique = (h1Matches.length === 1) && /<h1\b[^>]*\bid=['"]hero-h1['"]/i.test(html);
  results.details.push(`H1 count: ${h1Matches.length}`);

  // 3. DOM Order
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    const mainContent = mainMatch[1];
    const directChildren = [];
    // Match only direct children of main
    // We can do this with a lightweight state parser or regex on top-level tags
    const tagRegex = /<(section|footer)\b([^>]*)>/gi;
    let match;
    while ((match = tagRegex.exec(mainContent)) !== null) {
      const tagName = match[1].toLowerCase();
      const attrs = match[2];
      const idMatch = attrs.match(/\bid=['"]([^'"]+)['"]/i);
      const id = idMatch ? idMatch[1] : tagName;
      directChildren.push(id);
    }
    results.detected_order = directChildren;
    const expected = ['hero', 'como-funciona', 'verticales', 'editor', 'testimonios', 'planes', 'faq', 'footer'];
    results.f1_t2_dom_order = JSON.stringify(directChildren) === JSON.stringify(expected);
    results.details.push(`DOM order matches: ${results.f1_t2_dom_order} (found: ${directChildren.join(', ')})`);
  }

  // 4. Plans context
  const plansReq = [
    '1 QR estático',
    'QRs dinámicos ilimitados',
    'multi-sucursal, API'
  ];
  results.f1_t3_plans_context = plansReq.every(phrase => html.includes(phrase));
  results.details.push(`Plans context phrases present: ${results.f1_t3_plans_context}`);

  // 5. Forbidden patterns
  const forbidden = /(ACCESO OFICIAL|PORTAL DIGITAL|CERTIFICADO ISO|SPA & RELAX|ECO BARRIO|TEST DRIVE)/i;
  results.f1_t4_no_forbidden_text = !forbidden.test(html);
  results.details.push(`No forbidden patterns: ${results.f1_t4_no_forbidden_text}`);

  results.all_pass = results.f1_t1_hero && 
                     results.f1_t1_h1_unique && 
                     results.f1_t2_dom_order && 
                     results.f1_t3_plans_context && 
                     results.f1_t4_no_forbidden_text;

  return results;
}

if (require.main === module) {
  const html = fs.readFileSync('public/index.html', 'utf8');
  const res = verifyPhase1(html);
  console.log('Phase 1 Verification:', res);
}

module.exports = { verifyPhase1 };
