const gcsService = require('../services/GCSService');

class StatsRepository {
  constructor() {
    this.statsStore = { totalGenerations: 0, totalDownloads: 0 };
  }

  async initSync() {
    if (!gcsService.isConfigured()) return;

    this.statsStore = await gcsService.readJsonFromCloud('History/stats.json', null);
    if (!this.statsStore) {
      this.statsStore = await gcsService.readJsonFromCloud('history/stats.json', { totalGenerations: 0, totalDownloads: 0 });
      await this.saveStats(this.statsStore);
    }
  }

  getStats() {
    return this.statsStore;
  }

  async incrementGenerations() {
    this.statsStore.totalGenerations = (this.statsStore.totalGenerations || 0) + 1;
    await this.saveStats(this.statsStore);
  }

  async incrementDownloads() {
    this.statsStore.totalDownloads = (this.statsStore.totalDownloads || 0) + 1;
    await this.saveStats(this.statsStore);
  }

  async saveStats(newStats) {
    this.statsStore = newStats;
    await gcsService.saveJsonToCloud('History/stats.json', this.statsStore);
  }
}

module.exports = new StatsRepository();
