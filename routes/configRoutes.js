const express = require('express');
const configController = require('../controllers/ConfigController');

const router = express.Router();

router.get('/', (req, res) => configController.getConfig(req, res));

module.exports = router;
