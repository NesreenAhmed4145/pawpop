const express = require('express');
const router = express.Router();
const appointmentCtrl = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/auth');

// إضافة موعد لحيوان معين (يتطلب تسجيل دخول)
router.post('/:id/appointments', authMiddleware, appointmentCtrl.addAppointment);

module.exports = router;