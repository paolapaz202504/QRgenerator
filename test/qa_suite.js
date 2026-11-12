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

  // PRUEBA 21: Reglas de Venta de Planes: Free -> PRO/ENTERPRISE reinicia créditos y códigos QR a 0
  await test('Reglas de Venta: Free ➔ PRO y Free ➔ ENTERPRISE reinicia créditos y códigos generados a 0 con nuevos límites', async () => {
    const testUserEmail = `upgrade_free_pro_${Date.now()}@qrbey.com`;
    
    // 1. Crear usuario en Plan Free
    await makeRequest('/api/auth/oauth-login', 'POST', {
      email: testUserEmail,
      name: 'Free Upgrade Tester',
      provider: 'Google'
    });

    // 2. Consumir 5 créditos y generar 1 código QR
    await makeRequest('/api/user/consume-credit', 'POST', { userEmail: testUserEmail });
    await makeRequest('/api/user/consume-credit', 'POST', { userEmail: testUserEmail });
    await makeRequest('/api/user/consume-credit', 'POST', { userEmail: testUserEmail });
    await makeRequest('/api/user/consume-credit', 'POST', { userEmail: testUserEmail });
    await makeRequest('/api/user/consume-credit', 'POST', { userEmail: testUserEmail });

    await makeRequest('/api/generate', 'POST', {
      url: 'https://qrbey.com/free-usage',
      title: 'QR Free',
      userEmail: testUserEmail,
      isExplicitGenerate: true
    });

    // 3. Comprar Plan PRO (Free -> PRO)
    const upgradeRes = await makeRequest('/api/user/upgrade-plan', 'POST', {
      userEmail: testUserEmail,
      plan: 'pro',
      months: 1
    });

    const upData = upgradeRes.json();
    if (!upData.success || !upData.user) {
      throw new Error('Error al actualizar plan a PRO');
    }

    if (upData.user.plan !== 'pro') {
      throw new Error(`Plan esperado pro, recibido: ${upData.user.plan}`);
    }
    if (upData.user.creditsUsed !== 0) {
      throw new Error(`Los créditos consumidos debían reiniciarse a 0 al pasar de Free a PRO, recibido: ${upData.user.creditsUsed}`);
    }
    if (upData.user.generationsCount !== 0) {
      throw new Error(`Los códigos generados debían reiniciarse a 0 al pasar de Free a PRO, recibido: ${upData.user.generationsCount}`);
    }
    if (upData.user.maxCredits !== 2000) {
      throw new Error(`Límite maxCredits esperado 2000, recibido: ${upData.user.maxCredits}`);
    }
    if (upData.user.maxDownloads !== 500) {
      throw new Error(`Límite maxDownloads esperado 500, recibido: ${upData.user.maxDownloads}`);
    }

    // 4. Probar también compra directa de Free -> ENTERPRISE
    const testUserEmail2 = `upgrade_free_corp_${Date.now()}@qrbey.com`;
    await makeRequest('/api/auth/oauth-login', 'POST', {
      email: testUserEmail2,
      name: 'Free to Corp Tester',
      provider: 'Google'
    });
    await makeRequest('/api/user/consume-credit', 'POST', { userEmail: testUserEmail2 });
    await makeRequest('/api/generate', 'POST', {
      url: 'https://qrbey.com/free-usage-2',
      title: 'QR Free 2',
      userEmail: testUserEmail2,
      isExplicitGenerate: true
    });

    const upgradeCorpRes = await makeRequest('/api/user/upgrade-plan', 'POST', {
      userEmail: testUserEmail2,
      plan: 'enterprise',
      months: 1
    });
    const upCorpData = upgradeCorpRes.json();
    if (!upCorpData.success || !upCorpData.user) {
      throw new Error('Error al actualizar plan directo a Enterprise');
    }
    if (upCorpData.user.plan !== 'corporate') {
      throw new Error(`Plan esperado corporate, recibido: ${upCorpData.user.plan}`);
    }
    if (upCorpData.user.creditsUsed !== 0 || upCorpData.user.generationsCount !== 0) {
      throw new Error('Los créditos y códigos generados debían reiniciarse a 0 al pasar de Free a Enterprise');
    }
    if (upCorpData.user.maxCredits !== 10000 || upCorpData.user.maxDownloads !== 2000) {
      throw new Error('Límites incorrectos al pasar de Free a Enterprise');
    }
  });

  // PRUEBA 22: Reglas de Venta de Planes: PRO -> ENTERPRISE conserva consumos y amplía límites
  await test('Reglas de Venta: PRO ➔ ENTERPRISE amplía límites sin reiniciar créditos ni códigos generados', async () => {
    const testUserEmail = `upgrade_pro_corp_${Date.now()}@qrbey.com`;
    
    // 1. Crear usuario directamente en Plan PRO
    await makeRequest('/api/auth/oauth-login', 'POST', {
      email: testUserEmail,
      name: 'Pro Corp Tester',
      provider: 'Google'
    });
    await makeRequest('/api/user/upgrade-plan', 'POST', {
      userEmail: testUserEmail,
      plan: 'pro',
      months: 1
    });

    // 2. Consumir 12 créditos y generar 3 códigos QR en Plan PRO
    for (let i = 0; i < 12; i++) {
      await makeRequest('/api/user/consume-credit', 'POST', { userEmail: testUserEmail });
    }
    for (let i = 0; i < 3; i++) {
      await makeRequest('/api/generate', 'POST', {
        url: `https://qrbey.com/pro-usage-${i}`,
        title: `QR Pro ${i}`,
        userEmail: testUserEmail,
        isExplicitGenerate: true
      });
    }

    // 3. Adquirir Plan ENTERPRISE / CORPORATE (PRO -> CORPORATE)
    const upgradeRes = await makeRequest('/api/user/upgrade-plan', 'POST', {
      userEmail: testUserEmail,
      plan: 'corporate',
      months: 1
    });

    const upData = upgradeRes.json();
    if (!upData.success || !upData.user) {
      throw new Error('Error al actualizar plan a Corporate');
    }

    if (upData.user.plan !== 'corporate') {
      throw new Error(`Plan esperado corporate, recibido: ${upData.user.plan}`);
    }
    // Debe conservar los 12 créditos y 3 generaciones previas
    if (upData.user.creditsUsed !== 12) {
      throw new Error(`Al pasar de PRO a Corporate, los créditos consumidos debían conservarse (esperado 12), recibido: ${upData.user.creditsUsed}`);
    }
    if (upData.user.generationsCount !== 3) {
      throw new Error(`Al pasar de PRO a Corporate, los códigos generados debían conservarse (esperado 3), recibido: ${upData.user.generationsCount}`);
    }
    if (upData.user.maxCredits !== 10000) {
      throw new Error(`Límite maxCredits esperado 10000, recibido: ${upData.user.maxCredits}`);
    }
    if (upData.user.maxDownloads !== 2000) {
      throw new Error(`Límite maxDownloads esperado 2000, recibido: ${upData.user.maxDownloads}`);
    }
  });

  // PRUEBA 23: Reglas de Venta de Planes: PRO/ENTERPRISE -> GRATIS asigna límites de Free y reinicia créditos y QRs a 0
  await test('Reglas de Venta: PRO/ENTERPRISE ➔ GRATIS asigna límites del plan Gratis y reinicia créditos y códigos a 0', async () => {
    const testUserEmail = `downgrade_to_free_${Date.now()}@qrbey.com`;
    
    // 1. Crear usuario y asignarle Corporate
    await makeRequest('/api/auth/oauth-login', 'POST', {
      email: testUserEmail,
      name: 'Downgrade Tester',
      provider: 'Google'
    });
    await makeRequest('/api/user/upgrade-plan', 'POST', {
      userEmail: testUserEmail,
      plan: 'corporate',
      months: 1
    });

    // 2. Consumir créditos y generar códigos
    for (let i = 0; i < 8; i++) {
      await makeRequest('/api/user/consume-credit', 'POST', { userEmail: testUserEmail });
    }
    await makeRequest('/api/generate', 'POST', {
      url: 'https://qrbey.com/corp-to-free',
      title: 'QR Corp To Free',
      userEmail: testUserEmail,
      isExplicitGenerate: true
    });

    // 3. Volver a Plan GRATIS
    const toFreeRes = await makeRequest('/api/user/upgrade-plan', 'POST', {
      userEmail: testUserEmail,
      plan: 'free',
      months: 1
    });
    const freeData = toFreeRes.json();
    if (!freeData.success || !freeData.user) {
      throw new Error('Error al volver al plan Free');
    }

    if (freeData.user.plan !== 'free') {
      throw new Error(`Plan esperado free, recibido: ${freeData.user.plan}`);
    }
    if (freeData.user.creditsUsed !== 0) {
      throw new Error(`Al volver a Gratis, los créditos consumidos deben ser 0, recibido: ${freeData.user.creditsUsed}`);
    }
    if (freeData.user.generationsCount !== 0) {
      throw new Error(`Al volver a Gratis, los códigos generados deben ser 0, recibido: ${freeData.user.generationsCount}`);
    }
    if (freeData.user.maxCredits !== 50) {
      throw new Error(`Límite maxCredits para Gratis esperado 50, recibido: ${freeData.user.maxCredits}`);
    }
    if (freeData.user.maxDownloads !== 15) {
      throw new Error(`Límite maxDownloads para Gratis esperado 15, recibido: ${freeData.user.maxDownloads}`);
    }
    if (freeData.user.expirationDate !== null) {
      throw new Error(`La fecha de vencimiento en Gratis debe ser null, recibido: ${freeData.user.expirationDate}`);
    }
  });

  // PRUEBA 24: Confirmación Modal al Cerrar Sesión
  await test('Confirmación Modal al Cerrar Sesión: Integración de ModalService.confirm en Navbar y Perfil', async () => {
    const fs = require('fs');
    const userModalCode = fs.readFileSync('public/js/components/UserModal.js', 'utf8');
    const profileModalCode = fs.readFileSync('public/js/components/ProfileModal.js', 'utf8');

    if (!userModalCode.includes('ModalService.confirm') || !userModalCode.includes('¿Cerrar Sesión?')) {
      throw new Error('UserModal.js no solicita confirmación modal antes de cerrar sesión.');
    }
    if (!profileModalCode.includes('ModalService.confirm') || !profileModalCode.includes('¿Cerrar Sesión?')) {
      throw new Error('ProfileModal.js no solicita confirmación modal antes de cerrar sesión.');
    }
  });

  // PRUEBA 25: Icono Innovador de Código QR (Favicon SVG & Apple Touch Icon)
  await test('Icono Innovador: Existencia y estructura de favicon.svg y apple-touch-icon.svg', async () => {
    const fs = require('fs');
    if (!fs.existsSync('public/favicon.svg')) {
      throw new Error('No se encontró el archivo public/favicon.svg');
    }
    if (!fs.existsSync('public/apple-touch-icon.svg')) {
      throw new Error('No se encontró el archivo public/apple-touch-icon.svg');
    }

    const faviconSvg = fs.readFileSync('public/favicon.svg', 'utf8');
    if (!faviconSvg.includes('<svg') || !faviconSvg.includes('qrbey-bg') || !faviconSvg.includes('Finder Pattern')) {
      throw new Error('El favicon SVG no cuenta con la estructura geométrica innovadora esperada.');
    }
  });

  // PRUEBA 26: Control de Rastreadores: Endpoint /robots.txt y /sitemap.xml
  await test('Control de Rastreadores SEO: /robots.txt y /sitemap.xml responden HTTP 200 con formato válido', async () => {
    const robotsRes = await makeRequest('/robots.txt', 'GET');
    if (robotsRes.statusCode !== 200) {
      throw new Error(`robots.txt respondió con código HTTP ${robotsRes.statusCode}`);
    }
    const robotsBody = robotsRes.text;
    if (!robotsBody.includes('User-agent: *') || !robotsBody.includes('Sitemap: https://qr-studio-pro.onrender.com/sitemap.xml')) {
      throw new Error('robots.txt no contiene las directivas esenciales o la referencia al Sitemap oficial.');
    }

    const sitemapRes = await makeRequest('/sitemap.xml', 'GET');
    if (sitemapRes.statusCode !== 200) {
      throw new Error(`sitemap.xml respondió con código HTTP ${sitemapRes.statusCode}`);
    }
    const sitemapBody = sitemapRes.text;
    if (!sitemapBody.includes('<urlset') || !sitemapBody.includes('https://qr-studio-pro.onrender.com/')) {
      throw new Error('sitemap.xml no contiene la estructura XML estándar o la URL canónica del proyecto.');
    }
  });

  // PRUEBA 27: Metadatos SEO On-Page y Datos Estructurados Schema.org
  await test('Metadatos SEO & Schema.org JSON-LD: Verificación en index.html', async () => {
    const fs = require('fs');
    const indexHtml = fs.readFileSync('public/index.html', 'utf8');

    // Canonical oficial
    if (!indexHtml.includes('<link rel="canonical" href="https://qr-studio-pro.onrender.com/">')) {
      throw new Error('index.html no contiene el canonical canónico oficial hacia https://qr-studio-pro.onrender.com/');
    }

    // Googlebot y Bingbot
    if (!indexHtml.includes('name="googlebot"') || !indexHtml.includes('name="bingbot"')) {
      throw new Error('index.html no contiene directivas explícitas para Googlebot y Bingbot.');
    }

    // Open Graph y Twitter Cards
    if (!indexHtml.includes('property="og:image"') || !indexHtml.includes('name="twitter:card"')) {
      throw new Error('index.html no contiene etiquetas completas de Open Graph o Twitter Cards.');
    }

    // Schema.org JSON-LD
    if (!indexHtml.includes('WebApplication') || !indexHtml.includes('FAQPage') || !indexHtml.includes('Organization')) {
      throw new Error('index.html no contiene los esquemas Schema.org requeridos (WebApplication, FAQPage, Organization).');
    }
  });

  // PRUEBA 28: Integración de Google Analytics 4 (GA4 / GTM)
  await test('Telemetría Google Analytics 4 (GA4 / GTM): Integración desacoplada y servicio cliente', async () => {
    const fs = require('fs');
    const indexHtml = fs.readFileSync('public/index.html', 'utf8');
    if (!indexHtml.includes('googletagmanager.com/gtag/js') || !indexHtml.includes('window.dataLayer')) {
      throw new Error('index.html no inicializa el script o dataLayer de Google Analytics.');
    }

    if (!fs.existsSync('public/js/services/AnalyticsService.js')) {
      throw new Error('No se encontró el servicio client-side public/js/services/AnalyticsService.js');
    }

    const analyticsCode = fs.readFileSync('public/js/services/AnalyticsService.js', 'utf8');
    if (!analyticsCode.includes('trackQrGeneration') || !analyticsCode.includes('trackQrDownload')) {
      throw new Error('AnalyticsService no cuenta con los métodos de seguimiento requeridos.');
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
