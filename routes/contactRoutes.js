const express = require('express');
const router = express.Router();
const contactController = require('../controllers/ContactController');

router.post('/contact', (req, res) => contactController.submitContact(req, res));

module.exports = router;
