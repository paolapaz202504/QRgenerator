const config = require('../config/env');

class ConfigController {
  getConfig(req, res) {
    // Cache headers for configuration (1 hour, stale while revalidate)
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=600');
    res.json({
      success: true,
      googleClientId: config.googleClientId,
      plans: config.getAllPlans(),
      payment: {
        gateway: 'recurrente',
        environment: config.recurrente.environment,
        publicKey: config.recurrente.publicKey,
        currency: config.recurrente.currency
      },
      social: {
        instagram: config.social.instagram,
        facebook: config.social.facebook
      }
    });
  }
}

module.exports = new ConfigController();
