const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const supportController = require('../controllers/SupportController');

// Rate limiting específico para chat con IA (15 mensajes por minuto por IP)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 15, // 15 mensajes por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Has enviado demasiados mensajes seguidos. Por favor, espera unos segundos antes de continuar.'
  }
});

router.post('/support/chat', chatLimiter, (req, res) => supportController.chat(req, res));
router.get('/support/faqs', (req, res) => supportController.getFaqs(req, res));
router.get('/support/config', (req, res) => supportController.getConfig(req, res));

// Endpoints de Webhook para Meta (Messenger / Instagram)
router.get('/support/webhook/meta', (req, res) => supportController.verifyMetaWebhook(req, res));
router.post('/support/webhook/meta', (req, res) => supportController.handleMetaWebhook(req, res));
router.get('/webhooks/meta', (req, res) => supportController.verifyMetaWebhook(req, res));
router.post('/webhooks/meta', (req, res) => supportController.handleMetaWebhook(req, res));

module.exports = router;
