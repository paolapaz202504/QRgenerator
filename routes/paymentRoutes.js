const express = require('express');
const paymentController = require('../controllers/PaymentController');

const router = express.Router();

router.post('/checkout', (req, res) => paymentController.createCheckout(req, res));
router.post('/confirm', (req, res) => paymentController.confirmTransaction(req, res));
router.post('/webhook', (req, res) => paymentController.webhook(req, res));

module.exports = router;
