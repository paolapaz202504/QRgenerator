/**
 * devOpsAgent - UptimeRobot Automated Management Script
 * Part of DevTeam DevOps Infrastructure Suite
 */

const https = require('https');
const querystring = require('querystring');
require('dotenv').config();

const API_KEY = process.env.UPTIMEROBOT_API_KEY || 'u3911782-30092135acfd581256c4c662';

function uptimerobotRequest(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      api_key: API_KEY,
      format: 'json',
      ...params
    });

    const options = {
      hostname: 'api.uptimerobot.com',
      port: 443,
      path: `/v2/${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ stat: 'fail', error: { message: data } });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

async function main() {
  const [,, command, arg1, arg2] = process.argv;

  if (command === 'list') {
    const res = await uptimerobotRequest('getMonitors');
    if (res.stat === 'ok') {
      console.log(`\n📋 Monitores Activos en UptimeRobot (${res.pagination.total}):`);
      res.monitors.forEach(m => {
        const statusMap = { 0: '⏸️ Pausado', 1: '⏳ No chequeado', 2: '🟢 UP (En línea)', 8: '🟡 Seems Down', 9: '🔴 DOWN' };
        console.log(` - [ID: ${m.id}] ${m.friendly_name} -> ${m.url} | Estado: ${statusMap[m.status] || m.status} | Intervalo: ${m.interval / 60} min`);
      });
    } else {
      console.error('Error obteniendo monitores:', res);
    }
  } else if (command === 'create') {
    const url = arg1;
    const name = arg2 || 'QRbey KeepAlive /api/health';
    if (!url) {
      console.error('Uso: node scripts/devops_uptimerobot.js create <url> [friendly_name]');
      process.exit(1);
    }

    console.log(`🚀 Creando monitor en UptimeRobot para: ${url} ...`);
    const res = await uptimerobotRequest('newMonitor', {
      friendly_name: name,
      url: url,
      type: 1, // HTTP(s)
      interval: 300, // 5 minutos (evita que Render duerma a los 15 min)
      http_method: 2 // HEAD method (óptimo y ligero)
    });

    if (res.stat === 'ok') {
      console.log(`✅ Monitor creado exitosamente con ID: ${res.monitor.id}`);
    } else {
      console.error('❌ Error creando monitor:', res.error ? res.error.message : res);
    }
  } else {
    // Default: Check account and show status
    const acc = await uptimerobotRequest('getAccountDetails');
    if (acc.stat === 'ok') {
      console.log(`✅ UptimeRobot Conectado: ${acc.account.firstname} (${acc.account.email})`);
      console.log(`📊 Monitores: ${acc.account.up_monitors} UP / ${acc.account.total_monitors_count} Total (Límite: ${acc.account.monitor_limit})`);
    } else {
      console.error('❌ Error de autenticación:', acc);
    }
  }
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
