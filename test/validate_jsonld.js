const fs = require('fs');
const files = [
  'public/index.html',
  'public/restaurantes.html',
  'public/salones-belleza.html',
  'public/comercios.html'
];

let allPass = true;

files.forEach(file => {
  console.log('\n--- Checking:', file);
  if (!fs.existsSync(file)) {
    console.error('File not found:', file);
    allPass = false;
    return;
  }
  const html = fs.readFileSync(file, 'utf8');
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  while ((match = regex.exec(html)) !== null) {
    count++;
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw);
      if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        const types = parsed['@graph'].map(item => item['@type']).join(', ');
        console.log(`  Block #${count} (@graph with types: [${types}], @context: ${parsed['@context']}) - VALID JSON`);
        parsed['@graph'].forEach(item => {
          if (item['@type'] === 'SoftwareApplication') {
            console.log(`    - SoftwareApplication name: ${item.name}`);
            console.log(`    - offers: ${Array.isArray(item.offers) ? item.offers.length : 0}`);
          }
        });
      } else {
        console.log(`  Block #${count} (@type: ${parsed['@type']}, @context: ${parsed['@context']}) - VALID JSON`);
        if (parsed['@type'] === 'SoftwareApplication') {
          console.log(`    - name: ${parsed.name}`);
          console.log(`    - offers: ${Array.isArray(parsed.offers) ? parsed.offers.length : 0}`);
        } else if (parsed['@type'] === 'FAQPage') {
          console.log(`    - mainEntity: ${Array.isArray(parsed.mainEntity) ? parsed.mainEntity.length : 0} questions`);
        }
      }
    } catch (e) {
      console.error(`  Block #${count} INVALID JSON:`, e.message);
      console.error(raw);
      allPass = false;
    }
  }
  if (count === 0) {
    console.error('  ERROR: No JSON-LD blocks found in', file);
    allPass = false;
  } else {
    console.log(`  Total: ${count} blocks`);
  }
});

console.log('\nResult:', allPass ? 'ALL JSON-LD VALID' : 'FAILURES DETECTED');
process.exit(allPass ? 0 : 1);
