const express = require('express');
const router = express.Router();
const appointmentCtrl = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/auth');
const requirePetAccess = require('../middlewares/petAccessMiddleware');

// إضافة موعد لحيوان معين (يتطلب تسجيل دخول)
router.post('/:id/appointments', authMiddleware, appointmentCtrl.addAppointment);


// عرض / تعديل / حذف
router.get('/:id/appointments', authMiddleware, requirePetAccess, appointmentCtrl.getAppointments);
router.patch('/:id/appointments/:appointmentId', authMiddleware, requirePetAccess, appointmentCtrl.updateAppointment);
router.delete('/:id/appointments/:appointmentId', authMiddleware, requirePetAccess, appointmentCtrl.deleteAppointment);

module.exports = router;