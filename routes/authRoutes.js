const express = require('express');
const authController = require('../controllers/AuthController');

const router = express.Router();

router.post('/oauth-login', (req, res) => authController.oauthLogin(req, res));

module.exports = router;
