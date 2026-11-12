const https = require('https');

const urls = [
  'https://qrbey.onrender.com/',
  'https://qrbey.onrender.com/restaurantes',
  'https://qrbey.onrender.com/salones-belleza',
  'https://qrbey.onrender.com/comercios'
];

async function checkUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        let blocks = [];
        while ((match = regex.exec(data)) !== null) {
          try {
            const parsed = JSON.parse(match[1].trim());
            blocks.push(parsed);
          } catch (e) {
            blocks.push({ error: e.message });
          }
        }
        resolve({ url, status: res.statusCode, blocks });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== VERIFICANDO JSON-LD EN VIVO EN PRODUCCIÓN ===');
  for (const u of urls) {
    const res = await checkUrl(u);
    console.log(`\nURL: ${res.url} (Status: ${res.status})`);
    console.log(`  Bloques JSON-LD detectados: ${res.blocks.length}`);
    res.blocks.forEach((b, i) => {
      if (b.error) {
        console.error(`  [${i+1}] ERROR: ${b.error}`);
      } else if (b['@graph']) {
        console.log(`  [${i+1}] @graph con tipos: [${b['@graph'].map(x => x['@type']).join(', ')}]`);
      } else {
        console.log(`  [${i+1}] @type: ${b['@type']}`);
      }
    });
  }
}

run().catch(console.error);
