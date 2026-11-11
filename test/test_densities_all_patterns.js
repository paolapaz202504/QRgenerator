const qrGeneratorService = require('../services/QRGeneratorService');
const jsQR = require('jsqr');
const { createCanvas, loadImage } = require('canvas');

async function testAllPatternsAndDensities() {
  const patterns = qrGeneratorService.getPatterns();
  const densities = [1, 5, 10, 25, 50, 75, 100];
  console.log(`Testing ${patterns.length} patterns across ${densities.length} densities...`);

  let failures = [];
  let successes = 0;

  for (const pat of patterns) {
    for (const d of densities) {
      try {
        const buf = await qrGeneratorService.generateCanvas({
          designId: '0',
          url: 'https://qrbey.com/test-density',
          customDotStyle: pat.id,
          qrDensity: d
        });
        const img = await loadImage(buf);
        const cvs = createCanvas(img.width, img.height);
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imgData.data, img.width, img.height);
        if (code && code.data.includes('qrbey.com')) {
          successes++;
        } else {
          failures.push({ pattern: pat.id, density: d, reason: 'Unscannable by jsQR' });
        }
      } catch (err) {
        failures.push({ pattern: pat.id, density: d, reason: `Error: ${err.message}` });
      }
    }
  }

  console.log(`\nResults: ${successes} OK, ${failures.length} FAILED`);
  if (failures.length > 0) {
    console.log('Failed cases:');
    failures.forEach(f => console.log(`  - Pattern: ${f.pattern}, Density: ${f.density} -> ${f.reason}`));
  }
}

testAllPatternsAndDensities().catch(console.error);
