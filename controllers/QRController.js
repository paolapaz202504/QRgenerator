const qrGeneratorService = require('../services/QRGeneratorService');

class QRController {
  getDesigns(req, res) {
    res.json({
      success: true,
      categories: qrGeneratorService.getCategories(),
      designs: qrGeneratorService.getDesigns(),
      patterns: qrGeneratorService.getPatterns()
    });
  }

  async generate(req, res) {
    try {
      const buffer = await qrGeneratorService.generateCanvas(req.body);
      res.setHeader('Content-Type', 'image/png');
      res.send(buffer);
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
