const gcsService = require('../services/GCSService');

class HistoryRepository {
  constructor() {
    this.historyMap = {}; // Key: emailKey (e.g. paolapaz202504@gmail.com), Value: Array of history objects
  }

  async initSync() {
    if (!gcsService.isConfigured()) return;

    // Load per-user history files in History/
    const historyFiles = await gcsService.listFilesInCloud('History/');
    for (const fileRelativePath of historyFiles) {
      const fileName = fileRelativePath.replace(/^History\//, '');
      if (fileName.endsWith('.json') && fileName !== 'stats.json') {
        const userEmailKey = fileName.replace(/\.json$/, '').toLowerCase().trim();
        const userHist = await gcsService.readJsonFromCloud(`History/${fileName}`, []);
        if (Array.isArray(userHist)) {
          this.historyMap[userEmailKey] = userHist;
        }
      }
    }

    // Migration from legacy history/qr_history.json if present
    const legacyHistory = await gcsService.readJsonFromCloud('history/qr_history.json', null);
    if (Array.isArray(legacyHistory) && legacyHistory.length > 0) {
      console.log(`[GCS Migration 🔄] Migrando ${legacyHistory.length} registros desde history/qr_history.json a History/<email>.json...`);
      const migratedKeys = new Set();
      for (const item of legacyHistory) {
        const uEmail = item.userEmail ? item.userEmail.toLowerCase().trim() : 'invitado@anonimo';
        if (!this.historyMap[uEmail]) {
          this.historyMap[uEmail] = [];
        }
        if (!this.historyMap[uEmail].some(h => h.id === item.id)) {
          this.historyMap[uEmail].push(item);
          migratedKeys.add(uEmail);
        }
      }
      for (const uEmail of migratedKeys) {
        await this.saveUserHistory(uEmail, this.historyMap[uEmail]);
      }
    }
  }

  async getUserHistory(emailKey) {
    if (!emailKey) return [];
    const key = emailKey.toLowerCase().trim();
    if (this.historyMap[key]) {
      return this.historyMap[key];
    }
    const loaded = await gcsService.readJsonFromCloud(`History/${key}.json`, []);
    this.historyMap[key] = Array.isArray(loaded) ? loaded : [];
    return this.historyMap[key];
  }

  async saveUserHistory(emailKey, userHistoryArr) {
    if (!emailKey) return;
    const key = emailKey.toLowerCase().trim();
    this.historyMap[key] = userHistoryArr;
    await gcsService.saveJsonToCloud(`History/${key}.json`, userHistoryArr);
  }

  async addHistoryEntry(emailKey, historyEntry) {
    const userHist = await this.getUserHistory(emailKey);
    userHist.unshift(historyEntry);
    await this.saveUserHistory(emailKey, userHist);
    return historyEntry;
  }

  getAllHistories() {
    let allHistory = [];
    for (const emailKey of Object.keys(this.historyMap)) {
      allHistory = allHistory.concat(this.historyMap[emailKey]);
    }
    allHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return allHistory;
  }
}

module.exports = new HistoryRepository();
