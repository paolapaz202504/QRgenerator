const userRepository = require('../repositories/UserRepository');
const historyRepository = require('../repositories/HistoryRepository');
const statsRepository = require('../repositories/StatsRepository');
const auditRepository = require('../repositories/AuditRepository');
const config = require('../config/env');

class UserController {
  async getHistory(req, res) {
    const userEmail = req.query.email ? req.query.email.toLowerCase().trim() : null;

    // Regla de Seguridad estricta (securityAgent & filesAgent):
    // Usuarios anónimos o no autenticados NUNCA deben ver el historial de otros usuarios.
    if (!userEmail) {
      return res.json({
        success: true,
        history: []
      });
    }

    const userHistory = await historyRepository.getUserHistory(userEmail);
    return res.json({
      success: true,
      history: userHistory
    });
  }

  async getStats(req, res) {
    const userEmail = req.query.email ? req.query.email.toLowerCase().trim() : null;
    const globalStats = statsRepository.getStats();

    if (userEmail) {
      const user = userRepository.findByEmail(userEmail);
      if (user) {
        const includeHistory = req.query.includeHistory === 'true';
        const userHistory = includeHistory ? await historyRepository.getUserHistory(userEmail) : undefined;
        const planConfig = config.getPlanConfig(user.plan || 'free');
        user.maxCredits = planConfig.maxCredits;
        user.maxDownloads = planConfig.maxDownloads;
        const responseData = {
          success: true,
          userStats: {
            email: user.email,
            name: user.name,
            plan: user.plan || 'free',
            isMonthly: planConfig.isMonthly !== false,
            currentPeriod: user.currentPeriod || new Date().toISOString().substring(0, 7),
            maxDownloads: planConfig.maxDownloads,
            downloadsCount: user.downloadsCount || 0,
            maxCredits: planConfig.maxCredits,
            creditsUsed: user.creditsUsed || 0,
            generationsCount: user.generationsCount || 0,
            remainingCredits: Math.max(0, planConfig.maxCredits - (user.creditsUsed || 0)),
            remainingDownloads: Math.max(0, planConfig.maxDownloads - (user.generationsCount || 0)),
            planDurationMonths: user.planDurationMonths || 1,
            expirationDate: user.expirationDate || null
          },
          globalStats
        };
        if (includeHistory) {
          responseData.history = userHistory;
        }
        return res.json(responseData);
      }
    }

    const includeHistory = req.query.includeHistory === 'true';
    const allHistory = includeHistory ? historyRepository.getAllHistories() : undefined;
    const anonymousResponse = {
      success: true,
      userStats: null,
      globalStats
    };
    if (includeHistory) {
      anonymousResponse.history = allHistory;
    }
    res.json(anonymousResponse);
  }

  async upgradePlan(req, res) {
    try {
      const { userEmail, plan, months = 1 } = req.body;
      if (!userEmail || !plan) {
        return res.status(400).json({ success: false, error: 'Correo de usuario y plan son obligatorios' });
      }

      const emailKey = userEmail.toLowerCase().trim();
      let user = userRepository.findByEmail(emailKey);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      const previousPlan = (user.plan || 'free').toLowerCase();
      let planKey = plan.toLowerCase();
      if (planKey === 'enterprise') planKey = 'corporate';
      const planConfig = config.getPlanConfig(planKey);
      const numMonths = Math.max(1, parseInt(months, 10) || 1);

      user.plan = planKey;
      user.maxDownloads = planConfig.maxDownloads;
      user.maxCredits = planConfig.maxCredits;
      user.planDurationMonths = numMonths;

      // Reglas de Negocio en la Compra/Cambio de Planes:
      // 1) De GRATIS a PRO/ENTERPRISE: Asigna límites del plan, créditos consumidos 0 y QRs consumidos 0.
      if (previousPlan === 'free' && planKey !== 'free') {
        user.creditsUsed = 0;
        user.generationsCount = 0;
        user.downloadsCount = 0;
      }
      // 2) De PRO a ENTERPRISE (corporate): Asigna límites de ENTERPRISE y deja como están los créditos y QRs consumidos.
      else if (previousPlan === 'pro' && (planKey === 'corporate' || planKey === 'enterprise')) {
        // Se dejan como están creditsUsed, generationsCount y downloadsCount
      }
      // 3) De PRO/ENTERPRISE a GRATIS: Asigna límites del plan GRATIS, créditos consumidos 0 y QRs consumidos 0.
      else if (previousPlan !== 'free' && planKey === 'free') {
        user.creditsUsed = 0;
        user.generationsCount = 0;
        user.downloadsCount = 0;
      }

      if (planKey === 'free') {
        user.expirationDate = null;
      } else {
        const now = new Date();
        const currentExp = user.expirationDate ? new Date(user.expirationDate) : null;
        const baseDate = (currentExp && !isNaN(currentExp.getTime()) && currentExp > now)
          ? currentExp
          : now;
        const expDate = new Date(baseDate);
        expDate.setMonth(expDate.getMonth() + numMonths);
        user.expirationDate = expDate.toISOString();
      }

      await userRepository.saveUser(user);

      const formattedExp = user.expirationDate 
        ? new Date(user.expirationDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'Permanente';

      res.json({
        success: true,
        message: planKey === 'free'
          ? `Tu cuenta ha vuelto al ${planConfig.name}.`
          : `¡Felicidades! Has adquirido el ${planConfig.name} por ${numMonths} mes(es). Vence el ${formattedExp}.`,
        user: {
          email: user.email,
          name: user.name,
          plan: user.plan,
          maxDownloads: user.maxDownloads,
          downloadsCount: user.downloadsCount || 0,
          maxCredits: user.maxCredits,
          creditsUsed: user.creditsUsed || 0,
          generationsCount: user.generationsCount || 0,
          planDurationMonths: user.planDurationMonths,
          expirationDate: user.expirationDate
        }
      });
    } catch (err) {
      console.error('[Upgrade Plan Error]:', err);
      res.status(500).json({ success: false, error: 'Error al actualizar el plan' });
    }
  }

  async cancelPlan(req, res) {
    try {
      const { userEmail } = req.body;
      if (!userEmail) {
        return res.status(400).json({ success: false, error: 'Correo de usuario es obligatorio' });
      }

      const emailKey = userEmail.toLowerCase().trim();
      let user = userRepository.findByEmail(emailKey);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      const planConfig = config.getPlanConfig('free');

      user.plan = 'free';
      user.maxDownloads = planConfig.maxDownloads;
      user.maxCredits = planConfig.maxCredits;
      user.planDurationMonths = 1;
      user.expirationDate = null;
      user.creditsUsed = 0;
      user.generationsCount = 0;
      user.downloadsCount = 0;

      await userRepository.saveUser(user);

      res.json({
        success: true,
        message: 'Tu suscripción ha sido cancelada exitosamente. Se ha asignado automáticamente el Plan Gratuito.',
        user: {
          email: user.email,
          name: user.name,
          plan: user.plan,
          maxDownloads: user.maxDownloads,
          downloadsCount: user.downloadsCount || 0,
          maxCredits: user.maxCredits,
          creditsUsed: user.creditsUsed || 0,
          generationsCount: user.generationsCount || 0,
          planDurationMonths: 1,
          expirationDate: null
        }
      });
    } catch (err) {
      console.error('[Cancel Plan Error]:', err);
      res.status(500).json({ success: false, error: 'Error al cancelar la suscripción' });
    }
  }

  async consumeCredit(req, res) {
    try {
      const { userEmail } = req.body;
      if (!userEmail) {
        return res.json({ success: true, message: 'Modo anónimo' });
      }
      const emailKey = userEmail.toLowerCase().trim();
      let user = userRepository.findByEmail(emailKey);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      const planConfig = config.getPlanConfig(user.plan || 'free');
      const maxCredits = planConfig.maxCredits;
      const currentCredits = user.creditsUsed || 0;

      if (currentCredits >= maxCredits) {
        return res.status(403).json({
          success: false,
          limitReached: true,
          message: `Has alcanzado el límite de ${maxCredits} créditos de configuración de tu ${planConfig.name}.`
        });
      }

      user.creditsUsed = currentCredits + 1;
      await userRepository.saveUser(user);

      // Auditoría en tiempo real del consumo de crédito
      await auditRepository.logAction({
        userEmail: emailKey,
        action: 'CONSUME_CREDIT',
        creditsAtAction: user.creditsUsed,
        remainingCredits: Math.max(0, maxCredits - user.creditsUsed),
        generationsAtAction: user.generationsCount || 0,
        plan: user.plan || 'free',
        period: user.currentPeriod || new Date().toISOString().substring(0, 7),
        metadata: { client: 'QR Customizer Web' },
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      });

      res.json({
        success: true,
        creditsUsed: user.creditsUsed,
        remainingCredits: Math.max(0, maxCredits - user.creditsUsed)
      });
    } catch (err) {
      console.error('[Consume Credit Error]:', err);
      res.status(500).json({ success: false, error: 'Error al registrar consumo de crédito' });
    }
  }
}

module.exports = new UserController();
