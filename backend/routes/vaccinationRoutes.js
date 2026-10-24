const express = require('express');
const router = express.Router();
const vaccinationCtrl = require('../controllers/vaccinationController');
const authMiddleware = require('../middlewares/auth');
const requirePetAccess = require('../middlewares/petAccessMiddleware');

// إضافة تطعيم لحيوان معين (يتطلب تسجيل دخول)
router.post('/:id/vaccinations', authMiddleware, vaccinationCtrl.addVaccination);

router.get('/:id/vaccinations', authMiddleware, requirePetAccess, vaccinationCtrl.getVaccinations);
router.patch('/:id/vaccinations/:vaccinationId', authMiddleware, requirePetAccess, vaccinationCtrl.updateVaccination);
router.delete('/:id/vaccinations/:vaccinationId', authMiddleware, requirePetAccess, vaccinationCtrl.deleteVaccination);


module.exports = router;