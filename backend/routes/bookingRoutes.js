const express = require('express');
const router = express.Router();
const bookingCtrl = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware');

// === User Routes (محمية بـ authMiddleware) ===
// 1. التحقق من توفر مكان الإقامة في تواريخ معينة
router.get('/:accommodationId/availability', authMiddleware, bookingCtrl.checkAvailability);

// 2. إنشاء حجز جديد
router.post('/', authMiddleware, bookingCtrl.createBooking);

// 3. جلب حجوزات المستخدم الحالي
router.get('/me', authMiddleware, bookingCtrl.getMyBookings);

// 4. عرض تفاصيل حجز معين
router.get('/:bookingId', authMiddleware, bookingCtrl.getBookingById);

// 5. تعديل تفاصيل أو تواريخ الحجز
router.patch('/:bookingId', authMiddleware, bookingCtrl.updateBooking);

// 6. إلغاء الحجز
router.patch('/:bookingId/cancel', authMiddleware, bookingCtrl.cancelBooking);


// === Admin Routes (محمية بـ authMiddleware و adminMiddleware) ===
// 7. الأدمن يعرض كل الحجوزات (لازم قبل /admin/:bookingId)
router.get('/admin/all', authMiddleware, adminMiddleware, bookingCtrl.adminGetAllBookings);

// 8. الأدمن يعرض تفاصيل حجز واحد
router.get('/admin/:bookingId', authMiddleware, adminMiddleware, bookingCtrl.adminGetBookingById);

// 9. الأدمن يعدّل تفاصيل أي حجز (تواريخ / ضيوف / حيوانات / سعر)
router.patch('/admin/:bookingId', authMiddleware, adminMiddleware, bookingCtrl.adminUpdateBooking);

// 10. الأدمن يحدّث حالة الحجز
router.patch('/admin/:bookingId/status', authMiddleware, adminMiddleware, bookingCtrl.adminUpdateBookingStatus);

module.exports = router;
