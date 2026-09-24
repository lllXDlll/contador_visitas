const express = require('express');
const router = express.Router();
const visitsController = require('../controllers/visitsController');

router.post('/', visitsController.handleRegisterVisit);
router.get('/', visitsController.handleGetTotalVisits);

module.exports = router;
