const config = require('../config/env');

class ConfigController {
  getConfig(req, res) {
    res.json({
      success: true,
      googleClientId: config.googleClientId
    });
  }
}

module.exports = new ConfigController();
