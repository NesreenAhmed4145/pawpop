const express = require('express');
const router = express.Router();
const adoptionCtrl = require('../controllers/adoptionController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware');

// 1. تقديم طلب تبني (مستخدم مسجل دخول)
router.post('/', authMiddleware, adoptionCtrl.createAdoptionRequest);

// 2. عرض طلبات التبني التي قدمها المستخدم لنفسه (My Requests)
router.get('/my-requests', authMiddleware, adoptionCtrl.getMyAdoptionRequests);

// 3. عرض طلبات التبني الواردة على حيوانات المستخدم (Requests received for my pets)
router.get('/my-pet-requests', authMiddleware, adoptionCtrl.getOwnerPetsRequests);

// 4. عرض كافة طلبات المنصة (للأدمن فقط)
router.get('/admin/all', authMiddleware, adminMiddleware, adoptionCtrl.getAllAdoptionRequests);

// 5. تحديث حالة الطلب قبول/رفض (لصاحب الحيوان فقط)
router.patch('/:id/status', authMiddleware, adoptionCtrl.updateRequestStatus);

// إلغاء طلب التبني بواسطة المستخدم الذي قام بتقديمه
router.patch('/:id/cancel', authMiddleware, adoptionCtrl.cancelAdoptionRequest);

module.exports = router;