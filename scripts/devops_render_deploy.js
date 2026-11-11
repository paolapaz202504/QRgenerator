/**
 * DevTeam devOpsAgent: Script de Despliegue Automatizado en OnRender
 * Utiliza el Deploy Hook oficial del Web Service para compilar y desplegar
 * de forma incondicional el último commit de GitHub en producción.
 */
require('dotenv').config();

const DEPLOY_HOOK = process.env.RENDER_DEPLOY_HOOK_URL || 'https://api.render.com/deploy/srv-dam6d4gu01pc73egvae0?key=tXtoboMPY_8';
const HEALTH_URL = 'https://qr-studio-pro.onrender.com/api/health';

async function triggerDeploy() {
  console.log('🚀 [devOpsAgent] Disparando Despliegue en OnRender...');
  console.log(`🔗 Deploy Hook: ${DEPLOY_HOOK.replace(/key=.+/, 'key=••••••••')}`);

  try {
    const res = await fetch(DEPLOY_HOOK, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json().catch(() => ({}));
    console.log(`✅ Respuesta de Render HTTP ${res.status}:`, data);

    if (res.ok) {
      console.log('\n⏳ Despliegue iniciado correctamente en Render.');
      console.log('📡 Esperando a que el nuevo contenedor termine de compilar y responder en /api/health...');
      
      let attempts = 0;
      const maxAttempts = 24; // ~4 minutos
      const delay = 10000; // 10 segundos

      const checkHealth = async () => {
        attempts++;
        try {
          const hRes = await fetch(HEALTH_URL);
          if (hRes.ok) {
            const hData = await hRes.json();
            console.log(`[Intento ${attempts}/${maxAttempts}] Estado: ${hData.status} | Versión: ${hData.version} | Uptime: ${Math.round(hData.uptime)}s`);
            if (hData.version === '1.3.7' && hData.uptime < 180) {
              console.log('\n🎉 ¡DESPLIEGUE CONFIRMADO EN PRODUCCIÓN!');
              console.log(`🟢 Servicio actualizado con éxito a v${hData.version} en OnRender.`);
              return true;
            }
          }
        } catch (e) {
          console.log(`[Intento ${attempts}/${maxAttempts}] El servicio está reiniciando...`);
        }

        if (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, delay));
          return checkHealth();
        } else {
          console.log('⚠️ Tiempo de espera agotado. Verifica el log de despliegue en dashboard.render.com');
          return false;
        }
      };

      await checkHealth();
    } else {
      console.error('❌ Error al invocar Deploy Hook de Render:', res.status, data);
    }
  } catch (error) {
    console.error('❌ Excepción al invocar Deploy Hook:', error.message);
  }
}

triggerDeploy();
