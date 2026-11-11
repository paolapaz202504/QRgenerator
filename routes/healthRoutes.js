const express = require('express');
const healthController = require('../controllers/HealthController');

const router = express.Router();

router.get('/health', (req, res) => healthController.getHealth(req, res));
router.head('/health', (req, res) => healthController.headHealth(req, res));
router.get('/ready', (req, res) => healthController.getHealth(req, res));

module.exports = router;
