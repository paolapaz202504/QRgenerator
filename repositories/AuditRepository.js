const gcsService = require('../services/GCSService');

class AuditRepository {
  constructor() {
    this.logs = [];
  }

  async initSync() {
    if (gcsService.isConfigured()) {
      const cloudLogs = await gcsService.readJsonFromCloud('Audit/audit_logs.json', []);
      if (Array.isArray(cloudLogs)) {
        this.logs = cloudLogs;
      }
    }
  }

  async logAction(entry) {
    const auditRecord = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userEmail: entry.userEmail ? entry.userEmail.toLowerCase().trim() : 'anonimo',
      action: entry.action || 'GENERATE_QR',
      creditsAtAction: entry.creditsAtAction !== undefined ? entry.creditsAtAction : 0,
      remainingCredits: entry.remainingCredits !== undefined ? entry.remainingCredits : 0,
      generationsAtAction: entry.generationsAtAction !== undefined ? entry.generationsAtAction : 0,
      plan: entry.plan || 'free',
      period: entry.period || new Date().toISOString().substring(0, 7),
      metadata: entry.metadata || {},
      ipAddress: entry.ipAddress || '127.0.0.1',
      createdAt: new Date().toISOString()
    };

    this.logs.unshift(auditRecord);

    // Limitar logs en memoria/JSON a los últimos 2000 para optimizar rendimiento de bajo presupuesto
    if (this.logs.length > 2000) {
      this.logs = this.logs.slice(0, 2000);
    }

    if (gcsService.isConfigured()) {
      await gcsService.saveJsonToCloud('Audit/audit_logs.json', this.logs);
    }

    // Si la base de datos TiDB Cloud está conectada, guardar también en tabla audit_logs
    try {
      const dbService = require('../services/DatabaseService');
      if (dbService.isConnected()) {
        await dbService.insertAuditLog(auditRecord);
      }
    } catch (e) {
      // No bloquear la app si hay error secundario en BD
    }

    return auditRecord;
  }

  getUserLogs(userEmail) {
    if (!userEmail) return [];
    const key = userEmail.toLowerCase().trim();
    return this.logs.filter(l => l.userEmail === key);
  }

  getAllLogs() {
    return this.logs;
  }
}

module.exports = new AuditRepository();
