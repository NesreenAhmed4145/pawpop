const express = require('express');
const router = express.Router();
const accommodationCtrl = require('../controllers/accommodationController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', accommodationCtrl.getAllAccommodations);


router.get('/amenities', accommodationCtrl.getAmenities);

router.get('/:accommodationId', accommodationCtrl.getAccommodationById);

router.post('/admin/accommodations', authMiddleware, adminMiddleware, accommodationCtrl.createAccommodation);

router.patch('/admin/accommodations/:accommodationId', authMiddleware, adminMiddleware, accommodationCtrl.updateAccommodation);

router.delete('/admin/accommodations/:accommodationId', authMiddleware, adminMiddleware, accommodationCtrl.deleteAccommodation);

router.post('/admin/amenities', authMiddleware, adminMiddleware, accommodationCtrl.createAmenity);

module.exports = router;
