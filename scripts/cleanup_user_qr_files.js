const gcs = require('../services/GCSService');
const { connect } = require('@tidbcloud/serverless');
const config = require('../config/env');

async function cleanupUserQR(email) {
  const emailKey = email.toLowerCase().trim();
  console.log(`🧹 Iniciando eliminación de archivos QR e historial para: ${emailKey}`);

  // 1. ELIMINACIÓN EN GOOGLE CLOUD STORAGE (DEV & PROD)
  if (gcs.isConfigured()) {
    const [allFiles] = await gcs.bucket.getFiles();
    const targetFiles = allFiles.filter(f => f.name.toLowerCase().includes(emailKey));
    console.log(`📦 Encontrados ${targetFiles.length} archivos en GCS para eliminar.`);

    for (const file of targetFiles) {
      try {
        await file.delete();
        console.log(`  🗑️ Eliminado de GCS: ${file.name}`);
      } catch (err) {
        console.warn(`  ⚠️ Error eliminando ${file.name}:`, err.message);
      }
    }

    // Reset de contadores en dev/Users/users.json y prod/Users/users.json
    for (const envFolder of ['dev', 'prod']) {
      try {
        const usersFile = gcs.bucket.file(`${envFolder}/Users/users.json`);
        const [exists] = await usersFile.exists();
        if (exists) {
          const [buf] = await usersFile.download();
          const usersObj = JSON.parse(buf.toString('utf8'));
          if (usersObj[emailKey]) {
            usersObj[emailKey].downloadsCount = 0;
            usersObj[emailKey].generationsCount = 0;
            usersObj[emailKey].totalGenerationsCount = 0;
            await usersFile.save(JSON.stringify(usersObj, null, 2), { contentType: 'application/json' });
            console.log(`  ✅ Contadores de QR reseteados a 0 en ${envFolder}/Users/users.json`);
          }
        }
      } catch (e) {
        console.warn(`  ⚠️ Error actualizando ${envFolder}/Users/users.json:`, e.message);
      }
    }
  }

  // 2. ELIMINACIÓN EN BASES DE DATOS TIDB CLOUD (DEV & PROD)
  if (config.databaseUrl && config.databaseUrl.includes('tidbcloud.com')) {
    for (const dbName of ['qrbey_dev', 'qrbey_prod']) {
      try {
        let dbUrl = config.databaseUrl;
        if (dbUrl.includes('/qrbey_dev')) {
          dbUrl = dbUrl.replace('/qrbey_dev', `/${dbName}`);
        } else if (dbUrl.includes('/qrbey_prod')) {
          dbUrl = dbUrl.replace('/qrbey_prod', `/${dbName}`);
        }
        const conn = connect({ url: dbUrl });
        const delResult = await conn.execute(
          'DELETE FROM qr_generations WHERE user_email = ?',
          [emailKey]
        );
        console.log(`  ✅ Registros eliminados de tabla qr_generations en ${dbName}.`);

        await conn.execute(
          'UPDATE users SET downloads_count = 0, monthly_generations_count = 0, total_generations_count = 0 WHERE email = ?',
          [emailKey]
        );
        console.log(`  ✅ Contadores reseteados en tabla users en ${dbName}.`);
      } catch (err) {
        console.warn(`  ⚠️ Error en TiDB ${dbName}:`, err.message);
      }
    }
  }

  console.log(`🎉 ¡Eliminación completada con éxito para ${emailKey} en DEV y PROD!`);
}

const targetEmail = process.argv[2] || 'paolapaz202504@gmail.com';
cleanupUserQR(targetEmail).then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
