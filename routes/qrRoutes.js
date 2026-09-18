const express = require('express');
const qrController = require('../controllers/QRController');

const router = express.Router();

router.get('/designs', (req, res) => qrController.getDesigns(req, res));
router.post('/generate', (req, res) => qrController.generate(req, res));
router.post('/track-download', (req, res) => qrController.trackDownload(req, res));

module.exports = router;
