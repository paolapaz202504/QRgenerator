/**
 * QA RIGUROSO DevTeam / qaAgent - Matriz Combinatoria Exhaustiva de Opciones Visuales
 * QRbey (QR Studio Pro) - Certificación de Calidad y Escaneabilidad Óptica
 */

const qrGeneratorService = require('../services/QRGeneratorService');
const jsQR = require('jsqr');
const { createCanvas, loadImage } = require('canvas');

async function decodeBuffer(buf) {
  try {
    const img = await loadImage(buf);
    const cvs = createCanvas(img.width, img.height);
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, img.width, img.height);
    const code = jsQR(imgData.data, img.width, img.height);
    return code ? { success: true, data: code.data } : { success: false, reason: 'Decodificador jsQR no detectó el código' };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

async function runCombinatorialSuite() {
  console.log('======================================================================');
  console.log('🔬 DevTeam qaAgent: SUITE COMBINATORIA RIGUROSA DE OPCIONES VISUALES');
  console.log('======================================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failures = [];

  const patterns = qrGeneratorService.getPatterns().map(p => p.id);
  const eyeStyles = ['square', 'rounded', 'circle', 'leaf'];
  const silhouetteModes = ['none', 'icon_only', 'icon_center', 'icon_pure'];
  const gradientTypes = ['single', 'linear', 'radial'];
  const frameShapes = ['rectangular', 'square', 'rounded', 'circle', 'shield', 'ticket', 'hexagonal', 'diamond_card', 'badge_star', 'wavy'];
  const densities = [1, 20, 50, 80, 100];

  // 1. MATRIZ 1: 22 Patrones de Puntos x 4 Estilos de Ojos
  console.log('▶ [Matriz 1] Evaluando 22 Patrones de Puntos x 4 Estilos de Ojos...');
  for (const pat of patterns) {
    for (const eye of eyeStyles) {
      totalTests++;
      const buf = await qrGeneratorService.generateCanvas({
        designId: '0',
        url: 'https://qrbey.com/qa/pat-eye',
        customDotStyle: pat,
        customEyeStyle: eye,
        qrDensity: 50
      });
      const res = await decodeBuffer(buf);
      if (res.success && res.data.includes('qrbey.com')) {
        passedTests++;
      } else {
        failures.push({ suite: 'Matriz 1 (Pat x Ojo)', config: `pat=${pat}, eye=${eye}`, reason: res.reason });
      }
    }
  }
  console.log(`  ✓ Matriz 1 completada: ${patterns.length * eyeStyles.length} combinaciones.`);

  // 2. MATRIZ 2: 4 Siluetas Temáticas x 3 Tipos de Degradado
  console.log('▶ [Matriz 2] Evaluando 4 Siluetas Temáticas x 3 Tipos de Degradado...');
  for (const sil of silhouetteModes) {
    for (const grad of gradientTypes) {
      totalTests++;
      const buf = await qrGeneratorService.generateCanvas({
        designId: '0',
        url: 'https://qrbey.com/qa/sil-grad',
        qrSilhouetteMode: sil,
        gradientType: grad,
        qrColor2: '#3b82f6',
        customColors: {
          qrColor: '#0f172a',
          qrColor2: '#3b82f6',
          gradientType: grad,
          silhouetteColor: '#2563eb',
          patternColor: '#1e3a8a'
        }
      });
      const res = await decodeBuffer(buf);
      if (res.success && res.data.includes('qrbey.com')) {
        passedTests++;
      } else {
        failures.push({ suite: 'Matriz 2 (Silueta x Degradado)', config: `sil=${sil}, grad=${grad}`, reason: res.reason });
      }
    }
  }
  console.log(`  ✓ Matriz 2 completada: ${silhouetteModes.length * gradientTypes.length} combinaciones.`);

  // 3. MATRIZ 3: 10 Formas de Marco del Póster
  console.log('▶ [Matriz 3] Evaluando 10 Formas de Marco del Póster...');
  for (const shape of frameShapes) {
    totalTests++;
    const buf = await qrGeneratorService.generateCanvas({
      designId: '0',
      url: 'https://qrbey.com/qa/frame-shape',
      frameShape: shape
    });
    const res = await decodeBuffer(buf);
    if (res.success && res.data.includes('qrbey.com')) {
      passedTests++;
    } else {
      failures.push({ suite: 'Matriz 3 (Forma de Marco)', config: `shape=${shape}`, reason: res.reason });
    }
  }
  console.log(`  ✓ Matriz 3 completada: ${frameShapes.length} combinaciones.`);

  // 4. MATRIZ 4: Espectro de Densidad (1% al 100%)
  console.log('▶ [Matriz 4] Evaluando Espectro de Densidad (1%, 20%, 50%, 80%, 100%)...');
  for (const d of densities) {
    totalTests++;
    const buf = await qrGeneratorService.generateCanvas({
      designId: '0',
      url: 'https://qrbey.com/qa/density',
      qrDensity: d
    });
    const res = await decodeBuffer(buf);
    if (res.success && res.data.includes('qrbey.com')) {
      passedTests++;
    } else {
      failures.push({ suite: 'Matriz 4 (Densidad)', config: `density=${d}%`, reason: res.reason });
    }
  }
  console.log(`  ✓ Matriz 4 completada: ${densities.length} niveles.`);

  // 5. MATRIZ 5: Descarga HD (Resolución 2x / 1200px)
  console.log('▶ [Matriz 5] Evaluando Renderizado de Alta Definición (HD)...');
  totalTests++;
  const bufHd = await qrGeneratorService.generateCanvas({
    designId: '0',
    url: 'https://qrbey.com/qa/hd',
    targetWidth: 1200
  });
  const resHd = await decodeBuffer(bufHd);
  if (resHd.success && resHd.data.includes('qrbey.com')) {
    passedTests++;
  } else {
    failures.push({ suite: 'Matriz 5 (HD 1200px)', config: 'targetWidth=1200', reason: resHd.reason });
  }
  console.log('  ✓ Matriz 5 completada.');

  console.log('\n======================================================================');
  console.log(`📊 RESULTADO FINAL: ${passedTests} / ${totalTests} PRUEBAS EXITOSAS (${Math.round(passedTests / totalTests * 100)}%)`);
  console.log('======================================================================');

  if (failures.length > 0) {
    console.error(`\n❌ Fallos detectados (${failures.length}):`);
    failures.forEach(f => console.error(`  - [${f.suite}] ${f.config} -> ${f.reason}`));
    process.exit(1);
  } else {
    console.log('\n✅ CERTIFICACIÓN DE CALIDAD DevTeam: 100% de combinaciones visuales verificadas y escaneables ópticamente.');
    process.exit(0);
  }
}

runCombinatorialSuite().catch(err => {
  console.error('Error fatal en ejecución de suite QA:', err);
  process.exit(1);
});
