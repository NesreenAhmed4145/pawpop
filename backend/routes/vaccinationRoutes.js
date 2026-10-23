const express = require('express');
const router = express.Router();
const vaccinationCtrl = require('../controllers/vaccinationController');
const authMiddleware = require('../middlewares/auth');

// إضافة تطعيم لحيوان معين (يتطلب تسجيل دخول)
router.post('/:id/vaccinations', authMiddleware, vaccinationCtrl.addVaccination);

module.exports = router;