const express = require('express');
const router = express.Router();
const accommodationCtrl = require('../controllers/accommodationController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// رفع صورة واحدة في حقل ImageURL، وأخطاء multer (نوع/حجم الملف) بترجع JSON بدل صفحة HTML
const uploadImage = (req, res, next) => {
    upload.single('ImageURL')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
};

router.get('/', accommodationCtrl.getAllAccommodations);


router.get('/amenities', accommodationCtrl.getAmenities);

router.get('/:accommodationId', accommodationCtrl.getAccommodationById);

router.post('/admin/accommodations', authMiddleware, adminMiddleware, uploadImage, accommodationCtrl.createAccommodation);

router.patch('/admin/accommodations/:accommodationId', authMiddleware, adminMiddleware, uploadImage, accommodationCtrl.updateAccommodation);

router.delete('/admin/accommodations/:accommodationId', authMiddleware, adminMiddleware, accommodationCtrl.deleteAccommodation);

router.post('/admin/amenities', authMiddleware, adminMiddleware, accommodationCtrl.createAmenity);

module.exports = router;