const userRepository = require('../repositories/UserRepository');
const historyRepository = require('../repositories/HistoryRepository');
const statsRepository = require('../repositories/StatsRepository');
const config = require('../config/env');

class UserController {
  async getHistory(req, res) {
    const userEmail = req.query.email ? req.query.email.toLowerCase().trim() : null;

    if (userEmail) {
      const userHistory = await historyRepository.getUserHistory(userEmail);
      return res.json({
        success: true,
        history: userHistory
      });
    }

    const allHistory = historyRepository.getAllHistories();
    res.json({
      success: true,
      history: allHistory
    });
  }

  async getStats(req, res) {
    const userEmail = req.query.email ? req.query.email.toLowerCase().trim() : null;
    const globalStats = statsRepository.getStats();

    if (userEmail) {
      const user = userRepository.findByEmail(userEmail);
      if (user) {
        const userHistory = await historyRepository.getUserHistory(userEmail);
        return res.json({
          success: true,
          userStats: {
            email: user.email,
            name: user.name,
            plan: user.plan || 'free',
            maxDownloads: user.maxDownloads || 20,
            downloadsCount: user.downloadsCount || 0,
            maxCredits: user.maxCredits || 200,
            creditsUsed: user.generationsCount || 0,
            generationsCount: user.generationsCount || 0,
            remainingCredits: Math.max(0, (user.maxCredits || 200) - (user.generationsCount || 0)),
            remainingDownloads: Math.max(0, (user.maxDownloads || 20) - (user.downloadsCount || 0)),
            planDurationMonths: user.planDurationMonths || 1,
            expirationDate: user.expirationDate || null
          },
          history: userHistory,
          globalStats
        });
      }
    }

    const allHistory = historyRepository.getAllHistories();
    res.json({
      success: true,
      userStats: null,
      history: allHistory,
      globalStats
    });
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

      const planKey = plan.toLowerCase();
      const planConfig = config.getPlanConfig(planKey);
      const numMonths = Math.max(1, parseInt(months, 10) || 1);

      user.plan = planKey;
      user.maxDownloads = planConfig.maxDownloads;
      user.maxCredits = planConfig.maxCredits;
      user.planDurationMonths = numMonths;

      if (planKey === 'free') {
        user.expirationDate = null;
      } else {
        const expDate = new Date();
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
          creditsUsed: user.generationsCount || 0,
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
          creditsUsed: user.generationsCount || 0,
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
}

module.exports = new UserController();
