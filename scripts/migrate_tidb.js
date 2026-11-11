const { connect } = require('@tidbcloud/serverless');

const devUrl = 'mysql://4JbNc31HaqCLXXQ.root:bEClGOnmyXyDjc52@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/sys';
const prodUrl = 'mysql://3Lc9jgC5E35AF7h.root:UAi3JxyWP8Ilpf1F@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/sys';

function getDDL(dbName) {
  return [
    `CREATE DATABASE IF NOT EXISTS ${dbName};`,
    `CREATE TABLE IF NOT EXISTS ${dbName}.users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(191) NOT NULL UNIQUE,
      name VARCHAR(191),
      provider VARCHAR(64) DEFAULT 'Registered',
      avatar TEXT,
      plan VARCHAR(32) NOT NULL DEFAULT 'free',
      plan_duration_months INT NOT NULL DEFAULT 1,
      current_period VARCHAR(7) NOT NULL,
      monthly_generations_count INT NOT NULL DEFAULT 0,
      monthly_credits_used INT NOT NULL DEFAULT 0,
      total_generations_count INT NOT NULL DEFAULT 0,
      total_credits_used INT NOT NULL DEFAULT 0,
      downloads_count INT NOT NULL DEFAULT 0,
      max_downloads INT NOT NULL DEFAULT 15,
      max_credits INT NOT NULL DEFAULT 50,
      expiration_date DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_active DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_email (email),
      INDEX idx_user_plan (plan)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS ${dbName}.qr_generations (
      id VARCHAR(64) PRIMARY KEY,
      user_email VARCHAR(191) NOT NULL,
      title VARCHAR(191),
      url TEXT NOT NULL,
      format VARCHAR(16) NOT NULL DEFAULT 'png',
      resolution INT NOT NULL DEFAULT 600,
      image_path TEXT,
      credits_used_at_generation INT NOT NULL DEFAULT 0,
      remaining_credits_at_generation INT NOT NULL DEFAULT 0,
      plan_at_generation VARCHAR(32) NOT NULL DEFAULT 'free',
      period VARCHAR(7) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_qr_user_email (user_email),
      INDEX idx_qr_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS ${dbName}.audit_logs (
      id VARCHAR(64) PRIMARY KEY,
      user_email VARCHAR(191) NOT NULL,
      action VARCHAR(64) NOT NULL,
      credits_at_action INT NOT NULL DEFAULT 0,
      remaining_credits INT NOT NULL DEFAULT 0,
      generations_at_action INT NOT NULL DEFAULT 0,
      plan VARCHAR(32) NOT NULL DEFAULT 'free',
      period VARCHAR(7) NOT NULL,
      metadata JSON NULL,
      ip_address VARCHAR(45) DEFAULT '127.0.0.1',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_email (user_email),
      INDEX idx_audit_action (action),
      INDEX idx_audit_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  ];
}

async function migrate(envName, url, dbName) {
  console.log(`\n==============================================================`);
  console.log(`🔄 Migrando Entorno TiDB Cloud: ${envName} (${dbName})`);
  console.log(`==============================================================`);
  try {
    const conn = connect({ url });
    const ddlStatements = getDDL(dbName);
    for (const stmt of ddlStatements) {
      await conn.execute(stmt);
    }
    const tables = await conn.execute(`SHOW TABLES FROM ${dbName};`);
    console.log(`✅ [${envName}] Tablas creadas con éxito:`, tables);
  } catch (err) {
    console.error(`❌ [${envName}] Error en migración:`, err.message);
  }
}

async function main() {
  await migrate('DEV', devUrl, 'qrbey_dev');
  await migrate('PROD', prodUrl, 'qrbey_prod');
  console.log('\n🎉 Migraciones completadas en ambos entornos de TiDB Cloud.');
}

main();
