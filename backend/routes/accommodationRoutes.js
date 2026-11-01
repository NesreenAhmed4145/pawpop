const express = require('express');
const router = express.Router();
const accommodationCtrl = require('../controllers/accommodationController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware');

// === Public / User Routes ===
// 1. جلب كافة أماكن الإقامة مع إمكانية التصفية (Location, Price, Facilities)
router.get('/', accommodationCtrl.getAllAccommodations);

// 2. جلب كل المرافق (Amenities)
// مهم: لازم يتعرف قبل '/:accommodationId' وإلا هيتفهم "amenities" على إنه ID
router.get('/amenities', accommodationCtrl.getAmenities);

// 3. جلب تفاصيل مكان إقامة معين برقم الـ ID
router.get('/:accommodationId', accommodationCtrl.getAccommodationById);


// === Admin Routes ===
// 4. إضافة مكان إقامة جديد (للأدمن فقط)
router.post('/admin/accommodations', authMiddleware, adminMiddleware, accommodationCtrl.createAccommodation);

// 5. تعديل بيانات مكان إقامة (للأدمن فقط)
router.patch('/admin/accommodations/:accommodationId', authMiddleware, adminMiddleware, accommodationCtrl.updateAccommodation);

// 6. حذف مكان إقامة (للأدمن فقط)
router.delete('/admin/accommodations/:accommodationId', authMiddleware, adminMiddleware, accommodationCtrl.deleteAccommodation);

// 7. إضافة مرفق جديد (للأدمن فقط)
router.post('/admin/amenities', authMiddleware, adminMiddleware, accommodationCtrl.createAmenity);

module.exports = router;
