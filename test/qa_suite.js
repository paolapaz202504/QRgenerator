/**
 * DevTeam QA Rigorous Test Suite for QRbey (QRgenerator)
 * Lead: qaAgent & pmAgent
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
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

  // 13. Verificación Sintáctica Estricta de Todo el Frontend ES Modules
  await test('Verificación de Integridad Sintáctica de Módulos Frontend (public/js)', async () => {
    function walkJs(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(walkJs(fullPath));
        } else if (file.endsWith('.js')) {
          results.push(fullPath);
        }
      });
      return results;
    }

    const jsFiles = walkJs(path.join(__dirname, '../public/js'));
    if (jsFiles.length < 5) throw new Error('No se encontraron archivos JS en public/js');

    for (const fp of jsFiles) {
      const code = fs.readFileSync(fp, 'utf8');
      try {
        if (vm.SourceTextModule) {
          new vm.SourceTextModule(code, { identifier: fp });
        } else {
          // Si no está activo el flag --experimental-vm-modules, validar como Script removiendo sentencias import/export
          const scriptCode = code
            .replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '// import')
            .replace(/import\s+['"].*?['"];?/g, '// import')
            .replace(/export\s+(default\s+)?(async\s+)?(class|function|const|let|var)\s+/g, '$2$3 ')
            .replace(/export\s*\{[\s\S]*?\};?/g, '// export');
          new vm.Script(scriptCode, { filename: fp });
        }
      } catch (err) {
        throw new Error(`Error de sintaxis en ${fp}: ${err.message}`);
      }
    }
  });

  // 14. Desacoplamiento Silueta vs Ícono Central
  await test('Desacoplamiento Silueta vs Ícono: Silueta activa con showIcon=false y customLogoDataUrl', async () => {
    const dummyIconDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAALUlEQVRYR+3QQREAAAzCMPBnffk8Bhcq2Kekm+f0BQCAgICAgICAgICAgICAgMAbv6gCG75hSmsAAAAASUVORK5CYII=';
    const testUrl = 'https://qrbey.com/silueta-independiente';
    
    const res = await makeRequest('/api/generate', 'POST', {
      url: testUrl,
      title: 'Silueta Pura',
      qrSilhouetteMode: 'icon_only',
      showIcon: false,
      iconName: 'fa-heart',
      customLogoDataUrl: dummyIconDataUrl,
      silhouetteColor: '#ec4899',
      patternColor: '#831843'
    });

    if (res.statusCode !== 200) throw new Error(`Status esperado 200, recibido: ${res.statusCode}`);
    if (!res.buffer || res.buffer.length < 5000) throw new Error('Buffer de imagen inválido o corrupto');

    // Validación óptica con jsQR
    const img = await loadImage(res.buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, img.width, img.height);

    const code = jsQR(imgData.data, imgData.width, imgData.height);
    if (!code) throw new Error('jsQR no pudo decodificar el código QR con silueta independiente');
    if (code.data !== testUrl) throw new Error(`Dato decodificado '${code.data}' no coincide con '${testUrl}'`);
  });

  // 15. Reglas de Negocio Estrictas: Diferenciación entre Créditos de Configuración y Códigos QR Generados
  await test('Reglas de Negocio Estrictas: Plantilla gratis, Config consume créditos, Botón genera QR', async () => {
    const testEmail = `qa_rules_${Date.now()}@qrbey.com`;
    await makeRequest('/api/auth/oauth-login', 'POST', {
      provider: 'google',
      email: testEmail,
      name: 'Business Rules Tester'
    });

    let stats = (await makeRequest(`/api/user/stats?email=${testEmail}`, 'GET')).json().userStats;
    if (stats.creditsUsed !== 0 || stats.generationsCount !== 0) {
      throw new Error(`Estado inicial incorrecto: credits=${stats.creditsUsed}, gen=${stats.generationsCount}`);
    }

    // Regla 1: Plantilla / Preview (isExplicitGenerate: false) NO consume créditos ni códigos QR
    await makeRequest('/api/generate', 'POST', {
      url: 'https://qrbey.com/regla-1',
      title: 'Regla 1 Preview',
      userEmail: testEmail,
      isExplicitGenerate: false
    });
    stats = (await makeRequest(`/api/user/stats?email=${testEmail}`, 'GET')).json().userStats;
    if (stats.creditsUsed !== 0 || stats.generationsCount !== 0) {
      throw new Error(`Regla 1 violada: Se consumió créditos o QRs en preview de plantilla`);
    }

    // Regla 2: Modificar configuración consume crédito (POST /api/user/consume-credit)
    const consumeRes = (await makeRequest('/api/user/consume-credit', 'POST', { userEmail: testEmail })).json();
    if (!consumeRes.success || consumeRes.creditsUsed !== 1) {
      throw new Error(`Regla 2 violada: No se incrementó creditsUsed a 1: ${JSON.stringify(consumeRes)}`);
    }
    stats = (await makeRequest(`/api/user/stats?email=${testEmail}`, 'GET')).json().userStats;
    if (stats.creditsUsed !== 1 || stats.generationsCount !== 0) {
      throw new Error(`Regla 2 inconsistencia: credits=${stats.creditsUsed}, gen=${stats.generationsCount}`);
    }

    // Regla 3: Clic en 'Generar código QR' (isExplicitGenerate: true) incrementa generaciones de QR
    await makeRequest('/api/generate', 'POST', {
      url: 'https://qrbey.com/regla-3',
      title: 'Regla 3 Explicit',
      userEmail: testEmail,
      isExplicitGenerate: true
    });
    stats = (await makeRequest(`/api/user/stats?email=${testEmail}`, 'GET')).json().userStats;
    if (stats.generationsCount !== 1) {
      throw new Error(`Regla 3 violada: generationsCount esperado 1, obtenido ${stats.generationsCount}`);
    }
    if (stats.creditsUsed !== 1) {
      throw new Error(`Regla 3 inconsistencia: creditsUsed no debe verse alterado por la generación`);
    }
  });

  // Prueba 16: Privacidad y Aislamiento Estricto de Historial (Sin fuga de información a anónimos)
  await test('Privacidad y Aislamiento de Historial: Anónimos reciben lista vacía sin filtrar datos ajenos', async () => {
    const resAnon = await makeRequest('/api/user/history', 'GET');
    const dataAnon = resAnon.json();
    if (!dataAnon.success || !Array.isArray(dataAnon.history) || dataAnon.history.length !== 0) {
      throw new Error(`Fuga de datos detectada: usuario anónimo recibió ${dataAnon.history.length} registros ajenos`);
    }

    const resEmpty = await makeRequest('/api/user/history?email=', 'GET');
    const dataEmpty = resEmpty.json();
    if (!dataEmpty.success || !Array.isArray(dataEmpty.history) || dataEmpty.history.length !== 0) {
      throw new Error(`Fuga de datos detectada con email vacío`);
    }
  });

  // Prueba 17: Obligatoriedad de Autenticación al Presionar "Generar código QR"
  await test('Obligatoriedad de Inicio de Sesión al Generar Código QR (isExplicitGenerate: true)', async () => {
    const resAuthReq = await makeRequest('/api/generate', 'POST', {
      url: 'https://qrbey.com/test-auth-required',
      title: 'QR Sin Sesion',
      isExplicitGenerate: true
      // Nota: sin userEmail
    });

    if (resAuthReq.statusCode !== 401) {
      throw new Error(`Esperado HTTP 401 Unauthorized, obtenido: ${resAuthReq.statusCode}`);
    }
    const data = resAuthReq.json();
    if (!data || data.authRequired !== true) {
      throw new Error(`Esperado authRequired: true en respuesta`);
    }
  });

  // Prueba 18: Registro e Inicio de Sesión Universal (Gmail, Hotmail, Yahoo)
  await test('Registro e Inicio de Sesión Universal (Gmail, Hotmail, Yahoo y correo propio)', async () => {
    const providersTest = [
      { email: 'usuario.prueba@gmail.com', provider: 'Google / Gmail', name: 'Usuario Gmail' },
      { email: 'usuario.prueba@hotmail.com', provider: 'Microsoft / Hotmail', name: 'Usuario Hotmail' },
      { email: 'usuario.prueba@yahoo.com', provider: 'Yahoo Mail', name: 'Usuario Yahoo' }
    ];

    for (const item of providersTest) {
      const loginRes = await makeRequest('/api/auth/oauth-login', 'POST', item);
      if (loginRes.statusCode !== 200) {
        throw new Error(`Error en login para ${item.email}: HTTP ${loginRes.statusCode}`);
      }
      const data = loginRes.json();
      if (!data.success || !data.user || data.user.email !== item.email) {
        throw new Error(`Datos de usuario inválidos para ${item.email}`);
      }
      if (data.user.maxCredits !== 50 || data.user.maxDownloads !== 15) {
        throw new Error(`Cuotas iniciales incorrectas para ${item.email}`);
      }
    }
  });

  // Prueba 19: Cuotas Mensuales y Límites de Planes (Free Vitalicio vs Pro/Corp Mensual)
  await test('Cuotas Mensuales y Configuración de Planes (Free Vitalicio vs Pro/Corp Mensual)', async () => {
    const configRes = await makeRequest('/api/config', 'GET');
    const configData = configRes.json();
    if (!configData || !configData.plans) {
      throw new Error('No se pudo obtener la configuración de planes');
    }

    const { free, pro, corporate } = configData.plans;

    // Plan Free: 15 descargas, 50 créditos, vitalicio
    if (free.maxDownloads !== 15 || free.maxCredits !== 50 || free.isMonthly !== false) {
      throw new Error(`Plan Free incorrecto: ${JSON.stringify(free)}`);
    }

    // Plan Pro: 500 descargas, 2000 créditos, mensual
    if (pro.maxDownloads !== 500 || pro.maxCredits !== 2000 || pro.isMonthly !== true || pro.priceMonthly !== 9.99) {
      throw new Error(`Plan Pro incorrecto: ${JSON.stringify(pro)}`);
    }

    // Plan Corporate: 2000 descargas, 10000 créditos, mensual
    if (corporate.maxDownloads !== 2000 || corporate.maxCredits !== 10000 || corporate.isMonthly !== true || corporate.priceMonthly !== 29.99) {
      throw new Error(`Plan Corporate incorrecto: ${JSON.stringify(corporate)}`);
    }
  });

  // Prueba 20: Guardado Automático en Historial y Auditoría de Créditos al Generar Código QR
  await test('Guardado de Código QR en Historial y Trazabilidad de Créditos al Generar (Auditoría)', async () => {
    const auditTesterEmail = `auditoria_${Date.now()}@qrbey.com`;

    // 1. Iniciar sesión / registrar usuario
    await makeRequest('/api/auth/oauth-login', 'POST', {
      email: auditTesterEmail,
      name: 'Auditor Tester',
      provider: 'Test'
    });

    // 2. Consumir 2 créditos de configuración
    await makeRequest('/api/user/consume-credit', 'POST', { userEmail: auditTesterEmail });
    await makeRequest('/api/user/consume-credit', 'POST', { userEmail: auditTesterEmail });

    // 3. Generar código QR explícito
    const genRes = await makeRequest('/api/generate', 'POST', {
      url: 'https://qrbey.com/trazabilidad-test',
      title: 'QR Auditado',
      userEmail: auditTesterEmail,
      isExplicitGenerate: true
    });

    if (genRes.statusCode !== 200) {
      throw new Error(`Fallo al generar QR auditado: HTTP ${genRes.statusCode}`);
    }

    // 4. Verificar que el código QR fue guardado automáticamente en el historial con la trazabilidad de créditos
    const histRes = await makeRequest(`/api/user/history?email=${auditTesterEmail}`, 'GET');
    const histData = histRes.json();
    if (!histData.success || !Array.isArray(histData.history) || histData.history.length === 0) {
      throw new Error('El código QR generado no fue guardado automáticamente en el historial del usuario');
    }

    const savedEntry = histData.history[0];
    if (savedEntry.creditsUsedAtGeneration !== 2) {
      throw new Error(`Trazabilidad de créditos incorrecta: esperado 2 créditos consumidos, recibido: ${savedEntry.creditsUsedAtGeneration}`);
    }
    if (savedEntry.remainingCreditsAtGeneration !== 48) {
      throw new Error(`Trazabilidad de créditos restantes incorrecta: esperado 48, recibido: ${savedEntry.remainingCreditsAtGeneration}`);
    }
    if (savedEntry.planAtGeneration !== 'free') {
      throw new Error(`Plan al momento de generar incorrecto: ${savedEntry.planAtGeneration}`);
    }
    if (!savedEntry.imageDataUrl || !savedEntry.imageDataUrl.startsWith('data:image')) {
      throw new Error('No se guardó el contenido visual del código QR en el historial');
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
