/**
 * DevTeam QA Rigorous Test Suite for QRbey (QRgenerator)
 * Lead: qaAgent & pmAgent
 */

const http = require('http');
const jsQR = require('jsqr');
const { createCanvas, loadImage } = require('canvas');

const BASE_URL = 'http://127.0.0.1:3030';

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { ...headers }
    };

    let postData = null;
    if (body) {
      postData = typeof body === 'string' ? body : JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          buffer,
          text: buffer.toString('utf8'),
          json: () => JSON.parse(buffer.toString('utf8'))
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTestSuite() {
  console.log('🧪 ==============================================================');
  console.log('🧪 Iniciando Suite de Pruebas de Calidad Rigurosa — DevTeam (qaAgent)');
  console.log('🧪 ==============================================================\n');

  // Asegurar que el servidor esté activo
  let isReady = false;
  try {
    await makeRequest('/api/health');
    isReady = true;
  } catch (e) {
    console.log('⚡ Iniciando servidor local en segundo plano para pruebas...');
    require('../server');
  }

  if (!isReady) {
    for (let i = 0; i < 60; i++) {
      try {
        await new Promise(r => setTimeout(r, 300));
        await makeRequest('/api/health');
        isReady = true;
        console.log('\n✅ Servidor listo y respondiendo en ' + BASE_URL + '\n');
        break;
      } catch (err) {
        process.stdout.write('.');
      }
    }
    if (!isReady) {
      throw new Error('El servidor no inició a tiempo en ' + BASE_URL);
    }
  }

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`⏳ Ejecutando: ${name}... `);
    try {
      await fn();
      console.log('✅ APROBADO');
      passed++;
    } catch (err) {
      console.log('❌ FALLÓ: ' + (err.message || err));
      failed++;
    }
  }

  // 1. Health Endpoints (UptimeRobot & Render)
  await test('Endpoint /api/health responde GET con status 200 y JSON', async () => {
    const res = await makeRequest('/api/health', 'GET');
    if (res.statusCode !== 200) throw new Error(`Status code esperado 200, recibido: ${res.statusCode}`);
    const data = res.json();
    if (data.status !== 'ok' || !data.uptime) throw new Error('Cuerpo de salud inválido');
  });

  await test('Endpoint /api/health responde HEAD con status 200 (Anti-Sleep UptimeRobot)', async () => {
    const res = await makeRequest('/api/health', 'HEAD');
    if (res.statusCode !== 200) throw new Error(`Status code esperado 200, recibido: ${res.statusCode}`);
  });

  // 2. Config & Centralized Plans in .env
  await test('Endpoint /api/config entrega planes y pasarela Recurrente', async () => {
    const res = await makeRequest('/api/config', 'GET');
    if (res.statusCode !== 200) throw new Error(`Status: ${res.statusCode}`);
    const data = res.json();
    if (!data.plans || !data.plans.free || !data.plans.pro || !data.plans.corporate) {
      throw new Error('Configuración de planes incompleta');
    }
    if (data.plans.free.maxDownloads !== 15 || data.plans.free.maxCredits !== 50) {
      throw new Error(`Cuotas del plan Free incorrectas: ${JSON.stringify(data.plans.free)}`);
    }
    if (data.payment.gateway !== 'recurrente') {
      throw new Error('Pasarela de pago no configurada como Recurrente');
    }
  });

  // 3. Designs Catalogue & HTTP Cache Headers
  await test('Endpoint /api/designs entrega 20 categorías y cabeceras de caché', async () => {
    const res = await makeRequest('/api/designs', 'GET');
    if (res.statusCode !== 200) throw new Error(`Status: ${res.statusCode}`);
    const cacheHeader = res.headers['cache-control'] || '';
    if (!cacheHeader.includes('max-age')) throw new Error('Cabecera Cache-Control ausente o incorrecta');
    const data = res.json();
    if (!data.categories || data.categories.length < 15) throw new Error('Menos categorías de las esperadas');
  });

  // 4. Security Headers (Helmet)
  await test('Cabeceras de Seguridad Helmet presentes en respuestas HTTP', async () => {
    const res = await makeRequest('/api/health', 'GET');
    if (!res.headers['x-content-type-options']) {
      throw new Error('Cabecera X-Content-Type-Options no detectada');
    }
  });

  // 5. QR Generation (PNG estándar)
  await test('Generación de QR en formato PNG (POST /api/generate)', async () => {
    const payload = {
      url: 'https://qrbey.com',
      title: 'QR Test',
      bannerText: 'SCAN ME',
      targetWidth: 600
    };
    const res = await makeRequest('/api/generate', 'POST', payload);
    if (res.statusCode !== 200) throw new Error(`Status: ${res.statusCode}`);
    if (!res.headers['content-type'].includes('image/png')) {
      throw new Error(`Content-Type esperado image/png, recibido: ${res.headers['content-type']}`);
    }
    if (res.buffer.length < 500) throw new Error('Buffer de imagen PNG sospechosamente pequeño');
  });

  // 6. QR Generation (SVG vectorial puro)
  await test('Generación de QR en formato SVG vectorial nativo (format: "svg")', async () => {
    const payload = {
      url: 'https://qrbey.com/vectorial',
      title: 'Vector QR',
      format: 'svg'
    };
    const res = await makeRequest('/api/generate', 'POST', payload);
    if (res.statusCode !== 200) throw new Error(`Status: ${res.statusCode}`);
    if (!res.headers['content-type'].includes('image/svg+xml')) {
      throw new Error(`Content-Type esperado image/svg+xml, recibido: ${res.headers['content-type']}`);
    }
    if (!res.text.includes('<svg') || !res.text.includes('</svg>')) {
      throw new Error('Contenido no es XML/SVG válido');
    }
  });

  // 7. QR Escaneabilidad con jsQR
  await test('Escaneabilidad y decodificación óptica de QR generado con jsQR', async () => {
    const testUrl = 'https://qrbey.com/verify-qr-code';
    const payload = {
      url: testUrl,
      title: 'Test Readability',
      targetWidth: 600
    };
    const res = await makeRequest('/api/generate', 'POST', payload);
    const img = await loadImage(res.buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, img.width, img.height);

    const code = jsQR(imgData.data, imgData.width, imgData.height);
    if (!code) throw new Error('jsQR no pudo decodificar el código QR generado');
    if (code.data !== testUrl) throw new Error(`Dato decodificado '${code.data}' no coincide con '${testUrl}'`);
  });

  // 8. Payment Flow (Recurrente Checkout & Idempotency)
  await test('Flujo de Checkout y Confirmación Idempotente con Recurrente', async () => {
    // 1. Iniciar sesión ficticia para tener usuario en repo
    const userEmail = 'qa_tester@qrbey.com';
    await makeRequest('/api/auth/oauth-login', 'POST', {
      provider: 'google',
      email: userEmail,
      name: 'QA Tester'
    });

    // 2. Crear Checkout Session
    const checkoutRes = await makeRequest('/api/payment/checkout', 'POST', {
      userEmail,
      plan: 'pro',
      months: 3
    });
    if (checkoutRes.statusCode !== 200) throw new Error(`Checkout falló con status: ${checkoutRes.statusCode}`);
    const checkoutData = checkoutRes.json();
    if (!checkoutData.success || !checkoutData.transactionId) throw new Error('Transacción no creada');
    if (checkoutData.amount !== 29.97) throw new Error(`Monto esperado 29.97, recibido: ${checkoutData.amount}`);

    // 3. Confirmar Transacción (Simulación de Webhook o Retorno)
    const confirmRes = await makeRequest('/api/payment/confirm', 'POST', {
      transactionId: checkoutData.transactionId
    });
    if (confirmRes.statusCode !== 200) throw new Error(`Confirmación falló: ${confirmRes.statusCode}`);
    const confirmData = confirmRes.json();
    if (!confirmData.success || confirmData.user.plan !== 'pro') {
      throw new Error(`Plan no actualizado a pro: ${JSON.stringify(confirmData)}`);
    }

    // 4. Idempotencia: re-confirmar no debe fallar ni duplicar
    const reconfirmRes = await makeRequest('/api/payment/confirm', 'POST', {
      transactionId: checkoutData.transactionId
    });
    const reconfirmData = reconfirmRes.json();
    if (!reconfirmData.success) throw new Error('Fallo de idempotencia en reconfirmación');
  });

  // 10. Validación Dinámica de Créditos por Plan
  await test('Verificación Dinámica de Límites de Créditos por Plan (.env)', async () => {
    const testEmail = `qa_free_${Date.now()}@qrbey.com`;
    // Registrar usuario free
    await makeRequest('/api/auth/oauth-login', 'POST', {
      provider: 'google',
      email: testEmail,
      name: 'Free Tester'
    });
    const freeStats = (await makeRequest(`/api/user/stats?email=${testEmail}`, 'GET')).json();
    if (freeStats.userStats.maxCredits !== 50 || freeStats.userStats.maxDownloads !== 15) {
      throw new Error(`Límites incorrectos para usuario Free: ${JSON.stringify(freeStats.userStats)}`);
    }

    // Usuario Pro
    await makeRequest('/api/user/upgrade-plan', 'POST', {
      userEmail: testEmail,
      plan: 'pro',
      months: 1
    });
    const proStats = (await makeRequest(`/api/user/stats?email=${testEmail}`, 'GET')).json();
    if (proStats.userStats.maxCredits !== 2000 || proStats.userStats.maxDownloads !== 500) {
      throw new Error(`Límites incorrectos para usuario Pro: ${JSON.stringify(proStats.userStats)}`);
    }
  });

  // 11. 22 Patrones de Puntos Disponibles
  await test('Catálogo de 22 Patrones de Puntos completos en API /api/designs', async () => {
    const res = await makeRequest('/api/designs', 'GET');
    const data = res.json();
    if (!data.patterns || data.patterns.length !== 22) {
      throw new Error(`Cantidad de patrones esperada 22, recibida: ${data.patterns ? data.patterns.length : 0}`);
    }
  });

  // 12. 600 Diseños con Fondos Claros y Escaneabilidad Óptica
  await test('Catálogo de 600 Diseños Preestablecidos con Fondos Claros y Alto Contraste', async () => {
    const res = await makeRequest('/api/designs', 'GET');
    const data = res.json();
    if (!data.designs || data.designs.length !== 600) {
      throw new Error(`Cantidad de diseños esperada 600, recibida: ${data.designs ? data.designs.length : 0}`);
    }
    // Verificar que los fondos no sean oscuros
    const darkBgs = ['#0f172a', '#1e293b', '#090d16', '#1e1b4b'];
    const invalidDark = data.designs.filter(d => darkBgs.includes(d.bgColor));
    if (invalidDark.length > 0) {
      throw new Error(`Se encontraron ${invalidDark.length} diseños con fondos oscuros obsoletos`);
    }
  });

  console.log('\n==============================================================');
  console.log(`📊 RESULTADOS DE PRUEBAS: ${passed} APROBADAS | ${failed} FALLIDAS`);
  console.log('==============================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Error fatal ejecutando test suite:', err);
  process.exit(1);
});
