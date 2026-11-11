const pkg = require('../package.json');

class HealthController {
  getHealth(req, res) {
    const memoryUsage = process.memoryUsage();
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json({
      status: 'ok',
      service: 'QRbey Generator API',
      version: pkg.version || '1.3.7',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      memory: {
        rssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024))
      }
    });
  }

  // HEAD request handler specifically optimized for UptimeRobot pings
  headHealth(req, res) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).end();
  }
}

module.exports = new HealthController();
