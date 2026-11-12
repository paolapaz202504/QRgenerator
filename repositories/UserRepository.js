const gcsService = require('../services/GCSService');

class UserRepository {
  constructor() {
    this.usersStore = {};
  }

  async initSync() {
    if (gcsService.isConfigured()) {
      const cloudUsers = await gcsService.readJsonFromCloud('Users/users.json', null);
      if (cloudUsers && Object.keys(cloudUsers).length > 0) {
        this.usersStore = cloudUsers;
      } else {
        // Fallback migration from legacy usuario/users.json
        const legacyUsers = await gcsService.readJsonFromCloud('usuario/users.json', {});
        if (legacyUsers && Object.keys(legacyUsers).length > 0) {
          console.log('[GCS Migration 🔄] Migrando usuarios de usuario/users.json a Users/users.json...');
          this.usersStore = legacyUsers;
          await this.saveAll(this.usersStore);
        } else {
          this.usersStore = {};
        }
      }
    }
  }

  findByEmail(email) {
    if (!email) return null;
    const key = email.toLowerCase().trim();
    const user = this.usersStore[key] || null;
    if (user) {
      const config = require('../config/env');
      const planConfig = config.getPlanConfig(user.plan || 'free');
      user.maxCredits = planConfig.maxCredits;
      user.maxDownloads = planConfig.maxDownloads;
      user.isMonthly = planConfig.isMonthly !== false;

      // Garantizar que planes de pago tengan siempre su fecha de vencimiento calculada a partir de la fecha activa
      if ((user.plan || 'free').toLowerCase() !== 'free') {
        const now = new Date();
        const currentExp = user.expirationDate ? new Date(user.expirationDate) : null;
        if (!currentExp || isNaN(currentExp.getTime()) || currentExp <= now) {
          const months = parseInt(user.planDurationMonths || 1, 10);
          const validMonths = isNaN(months) || months < 1 ? 1 : months;
          const exp = new Date(now);
          exp.setMonth(exp.getMonth() + validMonths);
          user.expirationDate = exp.toISOString();
          this.saveUser(user);
        }
      }

      // Control y ciclo mensual estricto para planes de pago (Pro / Corporate)
      this.checkAndResetMonthlyPeriod(user, planConfig);
    }
    return user;
  }

  checkAndResetMonthlyPeriod(user, planConfig) {
    const currentPeriod = new Date().toISOString().substring(0, 7); // ej. '2026-11'

    if (!user.currentPeriod) {
      user.currentPeriod = currentPeriod;
      user.totalGenerationsCount = user.generationsCount || 0;
      user.totalCreditsUsed = user.creditsUsed || 0;
    }

    // Regla de Negocio: El plan Free NO se reinicia mensualmente (límite vitalicio)
    if (!planConfig.isMonthly || (user.plan || 'free').toLowerCase() === 'free') {
      return;
    }

    // Para planes Pro y Corporate: Las cuotas son mensuales
    if (user.currentPeriod !== currentPeriod) {
      console.log(`[Billing Cycle 🗓️] Reiniciando cuota mensual para usuario ${user.email} (${user.currentPeriod} ➔ ${currentPeriod})`);
      user.totalGenerationsCount = (user.totalGenerationsCount || 0) + (user.generationsCount || 0);
      user.totalCreditsUsed = (user.totalCreditsUsed || 0) + (user.creditsUsed || 0);
      user.currentPeriod = currentPeriod;
      user.generationsCount = 0; // Reinicio a 0 para el nuevo mes
      user.creditsUsed = 0;     // Reinicio a 0 para el nuevo mes
      user.downloadsCount = 0;  // Reinicio a 0 para el nuevo mes
      user.lastPeriodReset = new Date().toISOString();
      this.saveUser(user);
    }
  }

  async saveUser(user) {
    if (!user || !user.email) return null;
    const key = user.email.toLowerCase().trim();
    this.usersStore[key] = user;
    await gcsService.saveJsonToCloud('Users/users.json', this.usersStore);

    try {
      const databaseService = require('../services/DatabaseService');
      if (databaseService.isConnected()) {
        await databaseService.saveUser(user);
      }
    } catch (e) {}

    return user;
  }

  async saveAll(users) {
    this.usersStore = users;
    await gcsService.saveJsonToCloud('Users/users.json', this.usersStore);
  }

  getAll() {
    return this.usersStore;
  }
}

module.exports = new UserRepository();
