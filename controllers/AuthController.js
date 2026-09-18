const authService = require('../services/AuthService');

class AuthController {
  async oauthLogin(req, res) {
    try {
      const result = await authService.loginWithOAuth(req.body);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

module.exports = new AuthController();
