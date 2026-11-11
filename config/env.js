require('dotenv').config();

class Config {
  constructor() {
    this.port = process.env.PORT || 3030;
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.isProduction = (process.env.NODE_ENV === 'production') || (process.env.RENDER === 'true');
    this.envFolder = this.isProduction ? 'prod' : 'dev';
    this.gcsBucketName = process.env.GCS_BUCKET_NAME || 'qr-studio-pro-bucket';
    this.googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    this.appUrl = process.env.APP_URL || `http://localhost:${this.port}`;

    // Centralized Plan Limits and Pricing from .env
    const defaultPlans = {
      free: {
        id: 'free',
        name: 'Plan Gratuito',
        priceMonthly: 0,
        maxDownloads: parseInt(process.env.PLAN_FREE_MAX_DOWNLOADS || '15', 10),
        maxCredits: parseInt(process.env.PLAN_FREE_MAX_CREDITS || '50', 10)
      },
      pro: {
        id: 'pro',
        name: 'Plan Profesional',
        priceMonthly: parseFloat(process.env.PLAN_PRO_PRICE_MONTHLY || '9.99'),
        maxDownloads: parseInt(process.env.PLAN_PRO_MAX_DOWNLOADS || '500', 10),
        maxCredits: parseInt(process.env.PLAN_PRO_MAX_CREDITS || '2000', 10)
      },
      corporate: {
        id: 'corporate',
        name: 'Plan Corporativo',
        priceMonthly: parseFloat(process.env.PLAN_CORP_PRICE_MONTHLY || '29.99'),
        maxDownloads: parseInt(process.env.PLAN_CORP_MAX_DOWNLOADS || '999999', 10),
        maxCredits: parseInt(process.env.PLAN_CORP_MAX_CREDITS || '999999', 10)
      }
    };

    let customPlans = null;
    if (process.env.PLANS_CONFIG) {
      try {
        customPlans = JSON.parse(process.env.PLANS_CONFIG);
      } catch (e) {
        console.warn('[Config Warning] Error al parsear PLANS_CONFIG JSON:', e.message);
      }
    }

    this.plans = customPlans || defaultPlans;
    this.defaultPlanId = process.env.PLAN || 'free';

    // Recurrente Payment Gateway Configuration
    this.recurrente = {
      environment: process.env.RECURRENTE_ENVIRONMENT || 'sandbox',
      publicKey: process.env.RECURRENTE_PUBLIC_KEY || '',
      secretKey: process.env.RECURRENTE_SECRET_KEY || '',
      webhookSecret: process.env.RECURRENTE_WEBHOOK_SECRET || '',
      currency: process.env.RECURRENTE_CURRENCY || 'USD'
    };
  }

  getPlanConfig(planId = 'free') {
    const key = (planId || this.defaultPlanId).toLowerCase();
    return this.plans[key] || this.plans.free;
  }

  getAllPlans() {
    return this.plans;
  }
}

module.exports = new Config();
