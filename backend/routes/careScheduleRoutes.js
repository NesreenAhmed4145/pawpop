const express = require('express');
const router = express.Router();
const careCtrl = require('../controllers/careScheduleController');
const authMiddleware = require('../middlewares/auth');
const requirePetAccess = require('../middlewares/petAccessMiddleware');

router.get('/:id/care', authMiddleware, requirePetAccess, careCtrl.getCareSchedules);
router.post('/:id/care', authMiddleware, requirePetAccess, careCtrl.addCareSchedule);
router.patch('/:id/care/:careId', authMiddleware, requirePetAccess, careCtrl.updateCareSchedule);
router.delete('/:id/care/:careId', authMiddleware, requirePetAccess, careCtrl.deleteCareSchedule);

module.exports = router;