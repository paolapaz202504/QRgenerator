const paymentService = require('../services/PaymentService');

class PaymentController {
  async createCheckout(req, res) {
    try {
      const { userEmail, plan, months = 1, returnUrl } = req.body;
      if (!userEmail || !plan) {
        return res.status(400).json({ success: false, error: 'Correo de usuario y plan son requeridos' });
      }

      const result = await paymentService.createCheckoutSession({
        userEmail,
        planId: plan,
        durationMonths: months,
        returnUrl
      });

      res.json(result);
    } catch (err) {
      console.error('[Payment Controller Create Checkout Error]:', err.message);
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async confirmTransaction(req, res) {
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ success: false, error: 'ID de transacción requerido' });
      }

      const result = await paymentService.completeTransaction(transactionId);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err) {
      console.error('[Payment Controller Confirm Error]:', err.message);
      res.status(500).json({ success: false, error: 'Error al confirmar transacción' });
    }
  }

  async webhook(req, res) {
    try {
      const signature = req.headers['x-recurrente-signature'] || req.headers['x-signature'] || '';
      const result = await paymentService.handleWebhook(req.body, signature);
      res.json(result);
    } catch (err) {
      console.error('[Payment Webhook Error]:', err.message);
      res.status(401).json({ success: false, error: err.message });
    }
  }
}

module.exports = new PaymentController();
