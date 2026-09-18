const userRepository = require('../repositories/UserRepository');
const config = require('../config/env');

class AuthService {
  constructor() {
    this.oauthSessions = new Map();
  }

  async loginWithOAuth({ provider, email, name }) {
    if (!email || !provider) {
      throw new Error('Faltan parámetros OAuth 2.0');
    }

    const userKey = email.toLowerCase().trim();
    const token = 'oauth2_token_' + Math.random().toString(36).substring(2, 15);
    const planConfig = config.getPlanConfig('free');

    let existingUser = userRepository.findByEmail(userKey);
    if (!existingUser) {
      existingUser = {
        id: 'user_' + Date.now(),
        name: name || email.split('@')[0],
        email: userKey,
        provider: provider,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userKey)}`,
        plan: 'free',
        maxDownloads: planConfig.maxDownloads,
        maxCredits: planConfig.maxCredits,
        generationsCount: 0,
        downloadsCount: 0,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
    } else {
      existingUser.lastActive = new Date().toISOString();
      if (name) existingUser.name = name;
      if (provider) existingUser.provider = provider;
      if (!existingUser.maxCredits) existingUser.maxCredits = planConfig.maxCredits;
      if (!existingUser.maxDownloads) existingUser.maxDownloads = planConfig.maxDownloads;
    }

    await userRepository.saveUser(existingUser);
    this.oauthSessions.set(token, existingUser);

    return { token, user: existingUser };
  }

  getSession(token) {
    return this.oauthSessions.get(token) || null;
  }
}

module.exports = new AuthService();
