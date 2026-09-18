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
    return this.usersStore[key] || null;
  }

  async saveUser(user) {
    if (!user || !user.email) return null;
    const key = user.email.toLowerCase().trim();
    this.usersStore[key] = user;
    await gcsService.saveJsonToCloud('Users/users.json', this.usersStore);
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
