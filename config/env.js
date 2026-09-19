require('dotenv').config();

class Config {
  constructor() {
    this.port = process.env.PORT || 3030;
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.isProduction = (process.env.NODE_ENV === 'production') || (process.env.RENDER === 'true');
    this.envFolder = this.isProduction ? 'prod' : 'dev';
    this.gcsBucketName = process.env.GCS_BUCKET_NAME || 'qr-studio-pro-bucket';
    this.googleClientId = process.env.GOOGLE_CLIENT_ID || '';

    // Plan Configuration & Limits
    const defaultPlans = {
      free: {
        id: 'free',
        name: 'Plan Gratuito',
        maxDownloads: parseInt(process.env.PLAN_FREE_MAX_DOWNLOADS || '20', 10),
        maxCredits: parseInt(process.env.PLAN_FREE_MAX_CREDITS || '200', 10)
      },
      pro: {
        id: 'pro',
        name: 'Plan Profesional',
        maxDownloads: parseInt(process.env.PLAN_PRO_MAX_DOWNLOADS || '500', 10),
        maxCredits: parseInt(process.env.PLAN_PRO_MAX_CREDITS || '999999', 10)
      },
      corporate: {
        id: 'corporate',
        name: 'Plan Corporativo',
        maxDownloads: parseInt(process.env.PLAN_CORP_MAX_DOWNLOADS || '999999', 10),
        maxCredits: parseInt(process.env.PLAN_CORP_MAX_CREDITS || '999999', 10)
      }
    };

    let customPlans = null;
    if (process.env.PLANS_CONFIG) {
      try {
        customPlans = JSON.parse(process.env.PLANS_CONFIG);
      } catch (e) {
        console.warn('[Config Warning] Failed to parse PLANS_CONFIG JSON:', e.message);
      }
    }

    this.plans = customPlans || defaultPlans;
    this.defaultPlanId = process.env.PLAN || 'free';
  }

  getPlanConfig(planId = 'free') {
    const key = (planId || this.defaultPlanId).toLowerCase();
    return this.plans[key] || this.plans.free;
  }
}

module.exports = new Config();
