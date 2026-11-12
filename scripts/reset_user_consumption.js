const { connect } = require('@tidbcloud/serverless');
const gcs = require('../services/GCSService');

async function resetConsumption(email) {
  const targetEmail = (email || 'paolapaz202504@gmail.com').toLowerCase().trim();
  console.log(`🔄 Reiniciando consumo para la cuenta: ${targetEmail} en DEV y PROD...`);

  // 1. REINICIO EN TIDB CLOUD (DEV & PROD)
  const devUrl = 'mysql://4JbNc31HaqCLXXQ.root:bEClGOnmyXyDjc52@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/qrbey_dev';
  const prodUrl = 'mysql://3Lc9jgC5E35AF7h.root:UAi3JxyWP8Ilpf1F@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/qrbey_prod';

  for (const [envName, url] of [['DEV (qrbey_dev)', devUrl], ['PROD (qrbey_prod)', prodUrl]]) {
    try {
      const conn = connect({ url });
      const res = await conn.execute(
        `UPDATE users 
         SET monthly_credits_used = 0, 
             downloads_count = 0, 
             monthly_generations_count = 0, 
             total_credits_used = 0, 
             total_generations_count = 0 
         WHERE email = ?`,
        [targetEmail]
      );
      console.log(`  ✅ TiDB Cloud ${envName}: Consumo reiniciado a 0.`);
    } catch (e) {
      console.error(`  ❌ Error en TiDB Cloud ${envName}:`, e.message);
    }
  }

  // 2. REINICIO EN GOOGLE CLOUD STORAGE (DEV & PROD)
  if (gcs.isConfigured()) {
    for (const envFolder of ['dev', 'prod']) {
      try {
        const file = gcs.bucket.file(`${envFolder}/Users/users.json`);
        const [exists] = await file.exists();
        if (exists) {
          const [buf] = await file.download();
          const usersMap = JSON.parse(buf.toString('utf8'));
          if (usersMap[targetEmail]) {
            usersMap[targetEmail].creditsUsed = 0;
            usersMap[targetEmail].downloadsCount = 0;
            usersMap[targetEmail].generationsCount = 0;
            usersMap[targetEmail].totalCreditsUsed = 0;
            usersMap[targetEmail].totalGenerationsCount = 0;
            await file.save(JSON.stringify(usersMap, null, 2), {
              contentType: 'application/json'
            });
            console.log(`  ✅ GCS ${envFolder}/Users/users.json: Consumo reiniciado a 0.`);
          } else {
            console.log(`  ℹ️ Usuario ${targetEmail} no encontrado en GCS ${envFolder}/Users/users.json`);
          }
        }
      } catch (e) {
        console.error(`  ❌ Error en GCS ${envFolder}:`, e.message);
      }
    }
  }

  // 3. VERIFICACIÓN FINAL
  console.log('\n📊 Verificación de consumo tras reinicio:');
  for (const [envName, url] of [['TiDB DEV', devUrl], ['TiDB PROD', prodUrl]]) {
    try {
      const conn = connect({ url });
      const rows = await conn.execute(
        'SELECT email, plan, monthly_credits_used, downloads_count, monthly_generations_count, max_credits FROM users WHERE email = ?',
        [targetEmail]
      );
      console.log(`  ${envName}:`, JSON.stringify(rows[0] || 'No encontrado'));
    } catch (e) {
      console.error(`  Error verificando ${envName}:`, e.message);
    }
  }

  console.log(`\n🎉 ¡Consumo de ${targetEmail} reiniciado exitosamente en DEV y PROD!`);
}

const emailArg = process.argv[2] || 'paolapaz202504@gmail.com';
resetConsumption(emailArg).then(() => process.exit(0)).catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
