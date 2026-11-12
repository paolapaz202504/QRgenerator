const fs = require('fs');

function verifyPhase2() {
  const routes = ['restaurantes', 'salones-belleza', 'comercios'];
  const results = {
    routes_exist: true,
    h1_correct: true,
    h1_unique_per_page: true,
    ld_json_valid: true,
    canonical_present: true,
    og_present: true,
    twitter_present: true,
    sitemap_correct: false,
    robots_correct: false,
    details: []
  };

  const expectedH1s = {
    'restaurantes': 'Código QR para menús de restaurante: actualiza tu carta sin reimprimir',
    'salones-belleza': 'Código QR para salones de belleza: agenda citas y fideliza clientas sin reimprimir',
    'comercios': 'Código QR para comercios y supermercados: WiFi, catálogo y promociones en un solo código'
  };

  routes.forEach(route => {
    const filePath = `public/${route}.html`;
    if (!fs.existsSync(filePath)) {
      results.routes_exist = false;
      results.details.push(`File missing: ${filePath}`);
      return;
    }

    const html = fs.readFileSync(filePath, 'utf8');

    // Check H1
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    if (h1Matches.length !== 1) {
      results.h1_unique_per_page = false;
      results.details.push(`${route}: expected 1 H1, found ${h1Matches.length}`);
    } else {
      const h1Text = h1Matches[0].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
      const exp = expectedH1s[route];
      if (h1Text.toLowerCase() !== exp.toLowerCase()) {
        results.h1_correct = false;
        results.details.push(`${route}: H1 mismatch.\n  Expected: "${exp}"\n  Found:    "${h1Text}"`);
      }
    }

    // Check LD+JSON
    const ldMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
    if (ldMatches.length === 0) {
      results.ld_json_valid = false;
      results.details.push(`${route}: No LD+JSON blocks found`);
    } else {
      ldMatches.forEach((b, idx) => {
        const raw = b.replace(/<script[^>]*>|<\/script>/gi, '').trim();
        try {
          JSON.parse(raw);
        } catch (e) {
          results.ld_json_valid = false;
          results.details.push(`${route}: LD+JSON block ${idx + 1} invalid: ${e.message}`);
        }
      });
    }

    // Canonical
    if (!html.includes('rel="canonical"')) {
      results.canonical_present = false;
      results.details.push(`${route}: canonical missing`);
    }

    // OG & Twitter
    if (!html.includes('property="og:title"') && !html.includes('name="og:title"')) {
      results.og_present = false;
      results.details.push(`${route}: og:title missing`);
    }
    if (!html.includes('name="twitter:card"')) {
      results.twitter_present = false;
      results.details.push(`${route}: twitter:card missing`);
    }
  });

  // Check sitemap.xml
  const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  const locCount = (sitemap.match(/<loc>/g) || []).length;
  results.sitemap_correct = (locCount >= 4);
  results.details.push(`sitemap.xml loc count: ${locCount}`);

  // Check robots.txt
  const robots = fs.readFileSync('public/robots.txt', 'utf8');
  results.robots_correct = robots.includes('Sitemap:') && robots.includes('User-agent:');
  results.details.push(`robots.txt valid: ${results.robots_correct}`);

  results.all_pass = results.routes_exist &&
                     results.h1_correct &&
                     results.h1_unique_per_page &&
                     results.ld_json_valid &&
                     results.canonical_present &&
                     results.og_present &&
                     results.twitter_present &&
                     results.sitemap_correct &&
                     results.robots_correct;

  return results;
}

if (require.main === module) {
  const res = verifyPhase2();
  console.log('Phase 2 Verification:', res);
}

module.exports = { verifyPhase2 };
