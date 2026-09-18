const userRepository = require('../repositories/UserRepository');
const historyRepository = require('../repositories/HistoryRepository');
const statsRepository = require('../repositories/StatsRepository');

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
            generationsCount: user.generationsCount || 0,
            remainingDownloads: Math.max(0, (user.maxDownloads || 20) - (user.downloadsCount || 0))
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
}

module.exports = new UserController();
