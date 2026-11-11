const { connect } = require('@tidbcloud/serverless');
const mysql = require('mysql2/promise');
const config = require('../config/env');

class DatabaseService {
  constructor() {
    this.driver = null; // 'serverless' o 'mysql2'
    this.client = null;
    this.connected = false;
    this.dbName = config.isProduction ? 'qrbey_prod' : 'qrbey_dev';
  }

  async initialize() {
    let dbUrl = config.databaseUrl;
    if (!dbUrl || dbUrl.trim() === '') {
      console.log('[DatabaseService ℹ️] No se detectó DATABASE_URL. Operando en modo híbrido de bajo presupuesto (Google Cloud Storage + Caché Estática en Memoria).');
      return;
    }

    try {
      console.log(`[DatabaseService 🔌] Conectando a Base de Datos TiDB Cloud (${this.dbName})...`);

      // Si apunta a /sys, ajustar para apuntar a la base de datos de entorno correspondiente
      if (dbUrl.endsWith('/sys')) {
        dbUrl = dbUrl.replace(/\/sys$/, `/${this.dbName}`);
      }

      if (dbUrl.includes('tidbcloud.com')) {
        // Modo Oficial TiDB Cloud Serverless (Conexión segura vía HTTPS / TLS 1.2+ puerto 443)
        this.client = connect({ url: dbUrl });
        this.driver = 'serverless';
        // Test rápido de conexión
        const res = await this.client.execute('SELECT 1 as ping;');
        if (res) {
          this.connected = true;
          console.log(`✅ [DatabaseService] Conexión HTTP/TLS establecida exitosamente con TiDB Cloud Serverless (${this.dbName}).`);
        }
      } else {
        // Modo MySQL tradicional (mysql2)
        this.client = mysql.createPool({
          uri: dbUrl,
          waitForConnections: true,
          connectionLimit: 10,
          ssl: { rejectUnauthorized: true }
        });
        this.driver = 'mysql2';
        const conn = await this.client.getConnection();
        conn.release();
        this.connected = true;
        console.log(`✅ [DatabaseService] Conexión MySQL Pool establecida con ${this.dbName}.`);
      }

      await this.runMigrations();
    } catch (err) {
      console.warn('⚠️ [DatabaseService] Advertencia al conectar con TiDB Cloud:', err.message);
      console.warn('🔄 Fallback activo: Operando con Google Cloud Storage y Memoria sin interrupción del servicio.');
      this.connected = false;
      this.client = null;
    }
  }

  isConnected() {
    return this.connected && this.client !== null;
  }

  async execute(sql, params = []) {
    if (!this.isConnected()) return null;
    if (this.driver === 'serverless') {
      return await this.client.execute(sql, params);
    } else {
      const [rows] = await this.client.query(sql, params);
      return rows;
    }
  }

  async runMigrations() {
    if (!this.isConnected()) return;

    try {
      // 1. Tabla de Usuarios
      await this.execute(`
        CREATE TABLE IF NOT EXISTS users (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 2. Tabla de Generación y Guardado de Códigos QR
      await this.execute(`
        CREATE TABLE IF NOT EXISTS qr_generations (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 3. Tabla de Bitácora de Auditoría
      await this.execute(`
        CREATE TABLE IF NOT EXISTS audit_logs (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log(`✅ [DatabaseService] Migraciones de tablas en ${this.dbName} verificadas.`);
    } catch (err) {
      console.error('[DatabaseService Migrations Error]:', err.message);
    }
  }

  async saveUser(user) {
    if (!this.isConnected() || !user || !user.email) return;
    try {
      const sql = `
        INSERT INTO users (
          id, email, name, provider, avatar, plan, plan_duration_months,
          current_period, monthly_generations_count, monthly_credits_used,
          total_generations_count, total_credits_used, downloads_count,
          max_downloads, max_credits, expiration_date, created_at, last_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          plan = VALUES(plan),
          plan_duration_months = VALUES(plan_duration_months),
          current_period = VALUES(current_period),
          monthly_generations_count = VALUES(monthly_generations_count),
          monthly_credits_used = VALUES(monthly_credits_used),
          total_generations_count = VALUES(total_generations_count),
          total_credits_used = VALUES(total_credits_used),
          downloads_count = VALUES(downloads_count),
          max_downloads = VALUES(max_downloads),
          max_credits = VALUES(max_credits),
          expiration_date = VALUES(expiration_date),
          last_active = CURRENT_TIMESTAMP;
      `;

      const values = [
        user.id || 'user_' + Date.now(),
        user.email.toLowerCase().trim(),
        user.name || '',
        user.provider || 'Registered',
        user.avatar || '',
        user.plan || 'free',
        user.planDurationMonths || 1,
        user.currentPeriod || new Date().toISOString().substring(0, 7),
        user.generationsCount || 0,
        user.creditsUsed || 0,
        user.totalGenerationsCount || user.generationsCount || 0,
        user.totalCreditsUsed || user.creditsUsed || 0,
        user.downloadsCount || 0,
        user.maxDownloads || 15,
        user.maxCredits || 50,
        user.expirationDate ? new Date(user.expirationDate) : null,
        new Date(user.createdAt || Date.now()),
        new Date(user.lastActive || Date.now())
      ];

      await this.execute(sql, values);
    } catch (err) {
      console.warn('[DatabaseService saveUser Error]:', err.message);
    }
  }

  async insertQrGeneration(entry) {
    if (!this.isConnected()) return null;
    try {
      const sql = `
        INSERT INTO qr_generations (
          id, user_email, title, url, format, resolution, image_path,
          credits_used_at_generation, remaining_credits_at_generation,
          plan_at_generation, period, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        entry.id,
        entry.userEmail,
        entry.title || 'Código QR',
        entry.url || '',
        entry.format || 'png',
        entry.resolution || 600,
        entry.imagePath || null,
        entry.creditsUsedAtGeneration || 0,
        entry.remainingCreditsAtGeneration || 0,
        entry.planAtGeneration || 'free',
        entry.period || new Date().toISOString().substring(0, 7),
        new Date(entry.createdAt || Date.now())
      ];
      await this.execute(sql, values);
    } catch (err) {
      console.warn('[DatabaseService insertQrGeneration Error]:', err.message);
    }
  }

  async insertAuditLog(log) {
    if (!this.isConnected()) return null;
    try {
      const sql = `
        INSERT INTO audit_logs (
          id, user_email, action, credits_at_action, remaining_credits,
          generations_at_action, plan, period, metadata, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        log.id,
        log.userEmail,
        log.action,
        log.creditsAtAction,
        log.remainingCredits,
        log.generationsAtAction,
        log.plan,
        log.period,
        JSON.stringify(log.metadata || {}),
        log.ipAddress || '127.0.0.1',
        new Date(log.createdAt || Date.now())
      ];
      await this.execute(sql, values);
    } catch (err) {
      console.warn('[DatabaseService insertAuditLog Error]:', err.message);
    }
  }
}

module.exports = new DatabaseService();
