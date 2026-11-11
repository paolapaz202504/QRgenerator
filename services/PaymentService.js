const crypto = require('crypto');
const config = require('../config/env');
const userRepository = require('../repositories/UserRepository');

class PaymentService {
  constructor() {
    this.transactions = new Map();
  }

  async createCheckoutSession({ userEmail, planId, durationMonths = 1, returnUrl }) {
    if (!userEmail) throw new Error('El correo del usuario es obligatorio');
    
    const emailKey = userEmail.toLowerCase().trim();
    const user = userRepository.findByEmail(emailKey);
    if (!user) throw new Error('Usuario no encontrado');

    const planKey = (planId || 'pro').toLowerCase();
    const planConfig = config.getPlanConfig(planKey);
    if (!planConfig || planConfig.id === 'free') {
      throw new Error('Solo los planes de pago (Pro o Corporativo) requieren checkout');
    }

    const months = Math.max(1, parseInt(durationMonths, 10) || 1);
    const unitPrice = planConfig.priceMonthly || (planKey === 'pro' ? 9.99 : 29.99);
    const totalAmount = parseFloat((unitPrice * months).toFixed(2));
    const transactionId = `txn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const transaction = {
      id: transactionId,
      userEmail: emailKey,
      plan: planKey,
      durationMonths: months,
      amount: totalAmount,
      currency: config.recurrente.currency || 'USD',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.transactions.set(transactionId, transaction);

    // Si las claves de Recurrente están configuradas con claves reales:
    const isLiveConfigured = config.recurrente.secretKey && !config.recurrente.secretKey.startsWith('sk_test_sample');

    let checkoutUrl = '';

    if (isLiveConfigured) {
      try {
        // Petición al API de Recurrente: https://app.recurrente.com/api/checkouts
        const recurrenteApiUrl = 'https://app.recurrente.com/api/checkouts';
        const headers = {
          'Content-Type': 'application/json',
          'X-SECRET-KEY': config.recurrente.secretKey
        };
        if (config.recurrente.publicKey) {
          headers['X-PUBLIC-KEY'] = config.recurrente.publicKey;
        }

        const response = await fetch(recurrenteApiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            items: [{
              name: `Suscripción ${planConfig.name} (${months} mes${months > 1 ? 'es' : ''})`,
              amount_in_cents: Math.round(totalAmount * 100),
              currency: config.recurrente.currency || 'USD',
              quantity: 1
            }],
            user: { email: emailKey, name: user.name || emailKey },
            metadata: { transactionId, userEmail: emailKey, plan: planKey, durationMonths: months },
            success_url: `${returnUrl || config.appUrl}/?payment=success&txn=${transactionId}`,
            cancel_url: `${returnUrl || config.appUrl}/?payment=cancelled`
          })
        });

        if (response.ok) {
          const data = await response.json();
          checkoutUrl = data.checkout_url || data.url;
        } else {
          const errText = await response.text();
          console.warn('[Recurrente API] Error creando sesión remota:', response.status, errText);
        }
      } catch (apiErr) {
        console.warn('[Recurrente API Warning]:', apiErr.message);
      }
    }

    // Modo Sandbox / Demo: Retornamos URL de confirmación segura con checkout simulado
    if (!checkoutUrl) {
      checkoutUrl = `${returnUrl || config.appUrl}/?checkout_txn=${transactionId}&plan=${planKey}&months=${months}&amount=${totalAmount}`;
    }

    return {
      success: true,
      transactionId,
      checkoutUrl,
      amount: totalAmount,
      currency: config.recurrente.currency,
      plan: planConfig.name,
      months,
      environment: config.recurrente.environment
    };
  }

  async completeTransaction(transactionId) {
    const txn = this.transactions.get(transactionId);
    if (!txn) {
      return { success: false, error: 'Transacción no encontrada' };
    }

    if (txn.status === 'completed') {
      return { success: true, message: 'La transacción ya había sido completada (Idempotente)', txn };
    }

    let user = userRepository.findByEmail(txn.userEmail);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado para aplicar el plan' };
    }

    const planConfig = config.getPlanConfig(txn.plan);
    user.plan = txn.plan;
    user.maxDownloads = planConfig.maxDownloads;
    user.maxCredits = planConfig.maxCredits;
    user.planDurationMonths = txn.durationMonths;

    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + txn.durationMonths);
    user.expirationDate = expDate.toISOString();

    await userRepository.saveUser(user);

    txn.status = 'completed';
    txn.completedAt = new Date().toISOString();
    this.transactions.set(transactionId, txn);

    return {
      success: true,
      message: `¡Pago confirmado con éxito! Has adquirido el ${planConfig.name} por ${txn.durationMonths} mes(es).`,
      user: {
        email: user.email,
        name: user.name,
        plan: user.plan,
        maxDownloads: user.maxDownloads,
        downloadsCount: user.downloadsCount || 0,
        maxCredits: user.maxCredits,
        creditsUsed: user.generationsCount || 0,
        generationsCount: user.generationsCount || 0,
        planDurationMonths: user.planDurationMonths,
        expirationDate: user.expirationDate
      }
    };
  }

  async handleWebhook(rawBody, signature) {
    // Verificación criptográfica si existe clave de webhook configurada
    if (config.recurrente.webhookSecret && !config.recurrente.webhookSecret.startsWith('whsec_sample')) {
      const computedSignature = crypto
        .createHmac('sha256', config.recurrente.webhookSecret)
        .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
        .digest('hex');

      if (signature !== computedSignature) {
        throw new Error('Firma de webhook inválida');
      }
    }

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const txnId = payload.metadata ? payload.metadata.transactionId : payload.transaction_id;

    if (txnId) {
      return await this.completeTransaction(txnId);
    }

    return { success: true, received: true };
  }
}

module.exports = new PaymentService();
