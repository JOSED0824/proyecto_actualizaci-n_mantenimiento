const express = require('express');
const router  = express.Router();
const medicalHistoryController = require('../controllers/medicalHistoryController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/history',          isAuthenticated, medicalHistoryController.getPetList);
router.get('/history/:pet_id',  isAuthenticated, medicalHistoryController.getPetHistory);

module.exports = router;
