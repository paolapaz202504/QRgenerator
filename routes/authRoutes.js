const express = require('express');
const authController = require('../controllers/AuthController');

const router = express.Router();

router.post('/oauth-login', (req, res) => authController.oauthLogin(req, res));
router.get('/:provider', (req, res) => authController.authorize(req, res));
router.get('/:provider/callback', (req, res) => authController.callback(req, res));

module.exports = router;
