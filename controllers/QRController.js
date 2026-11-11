const qrGeneratorService = require('../services/QRGeneratorService');

class QRController {
  getDesigns(req, res) {
    // Dynamic cache header (60s with revalidation) to ensure clients receive fresh patterns
    res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate');
    res.json({
      success: true,
      categories: qrGeneratorService.getCategories(),
      designs: qrGeneratorService.getDesigns(),
      patterns: qrGeneratorService.getPatterns()
    });
  }

  async generate(req, res) {
    try {
      const result = await qrGeneratorService.generateCanvas(req.body);
      if (result && typeof result === 'object' && result.success === false) {
        const statusCode = result.authRequired ? 401 : (result.limitReached ? 403 : 400);
        return res.status(statusCode).json(result);
      }
      
      if (result && result.isSvg) {
        res.setHeader('Content-Type', 'image/svg+xml');
        return res.send(result.data);
      }

      res.setHeader('Content-Type', 'image/png');
      res.send(result);
    } catch (err) {
      console.error('[QR Generation Error]:', err);
      res.status(500).json({ success: false, error: 'Error al generar código QR' });
    }
  }

  async trackDownload(req, res) {
    try {
      const result = await qrGeneratorService.trackDownload(req.body);
      if (!result.success) {
        const statusCode = result.authRequired ? 401 : (result.limitReached ? 403 : 400);
        return res.status(statusCode).json(result);
      }
      res.json(result);
    } catch (err) {
      console.error('[Track Download Error]:', err);
      res.status(500).json({ success: false, error: 'Error interno al guardar descarga' });
    }
  }
}

module.exports = new QRController();
