const gcsService = require('../services/GCSService');

class HistoryRepository {
  constructor() {
    this.historyMap = {}; // Key: emailKey (e.g. paolapaz202504@gmail.com), Value: Array of history objects
  }

  async initSync() {
    if (!gcsService.isConfigured()) return;
    // Carga bajo demanda ultrarrápida: el historial de cada usuario se recupera instantáneamente
    // en memoria mediante getUserHistory() al momento de ser consultado, evitando bloqueos de inicio.
    console.log('[HistoryRepository ⚡] Repositorio de historial inicializado (carga bajo demanda activa).');
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
