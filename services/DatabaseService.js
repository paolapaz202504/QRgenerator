const mysql = require('mysql2/promise');
const config = require('../config/env');

class DatabaseService {
  constructor() {
    this.pool = null;
    this.connected = false;
  }

  async initialize() {
    const dbUrl = config.databaseUrl;
    if (!dbUrl || dbUrl.trim() === '') {
      console.log('[DatabaseService ℹ️] No se detectó DATABASE_URL. Operando en modo híbrido de bajo presupuesto (Google Cloud Storage + Caché Estática en Memoria).');
      return;
    }

    try {
      console.log('[DatabaseService 🔌] Conectando a Base de Datos TiDB Cloud (MySQL Serverless)...');
      
      // Parsear URL o pasar cadena con SSL obligatorio para TiDB Cloud
      const isTiDB = dbUrl.includes('tidbcloud.com');
      const poolOptions = {
        uri: dbUrl,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
      };

      if (isTiDB || !dbUrl.includes('ssl=')) {
        poolOptions.ssl = {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true
        };
      }

      this.pool = mysql.createPool(poolOptions);

      // Test de conexión rápida
      const connection = await this.pool.getConnection();
      console.log('✅ [DatabaseService] Conexión establecida exitosamente con TiDB Cloud / MySQL Serverless.');
      connection.release();
      this.connected = true;

      // Inicialización de Esquema Relacional (DDL)
      await this.runMigrations();
    } catch (err) {
      console.warn('⚠️ [DatabaseService] Error al conectar con TiDB Cloud / MySQL:', err.message);
      console.warn('🔄 Fallback automático activo: El sistema continuará operando normalmente con Google Cloud Storage.');
      this.connected = false;
      this.pool = null;
    }
  }

  isConnected() {
    return this.connected && this.pool !== null;
  }

  async runMigrations() {
    if (!this.isConnected()) return;

    try {
      // 1. Tabla de Usuarios con Cuotas Mensuales y Ciclo
      await this.pool.query(`
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

      // 2. Tabla de Generación y Guardado de Códigos QR (Trazabilidad y Auditoría)
      await this.pool.query(`
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

      // 3. Tabla de Bitácora de Auditoría del Sistema (AuditLog)
      await this.pool.query(`
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

      console.log('✅ [DatabaseService] Migraciones de tablas relacionales (users, qr_generations, audit_logs) aplicadas con éxito.');
    } catch (err) {
      console.error('[DatabaseService Migrations Error]:', err.message);
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
      await this.pool.query(sql, values);
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
      await this.pool.query(sql, values);
    } catch (err) {
      console.warn('[DatabaseService insertAuditLog Error]:', err.message);
    }
  }
}

module.exports = new DatabaseService();
