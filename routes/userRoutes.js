const express = require('express');
const userController = require('../controllers/UserController');

const router = express.Router();

router.get('/history', (req, res) => userController.getHistory(req, res));
router.get('/stats', (req, res) => userController.getStats(req, res));

module.exports = router;
