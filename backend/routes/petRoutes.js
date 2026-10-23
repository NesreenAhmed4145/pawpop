const express = require('express');
const router = express.Router();
const petCtrl = require('../controllers/petController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware'); 
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// 1. إضافة حيوان جديد (مفتوح لأي مستخدم مسجل دخول)
router.post('/', authMiddleware, upload.single('ImageURL'), petCtrl.addPet);

// 2. جلب جميع الحيوانات المتاحة للتبني (يجب أن يكون قبل /:id تماماً)
router.get('/adoption', petCtrl.getAdoptionPets);

// 3. جلب حيوانات المستخدم الحالي فقط لعرضها في البروفايل (يجب أن يكون قبل /:id أيضاً)
router.get('/my-pets', authMiddleware, petCtrl.getMyPets);

// 4. عرض تفاصيل حيوان معين برقم الـ ID (الراوت المتحرك يأتي بعد الثابتة)
router.get('/:id', optionalAuthMiddleware, petCtrl.getPetById);

// 5. تعديل بيانات الحيوان (بواسطة المالك الأساسي فقط)
router.patch('/:id', authMiddleware, upload.single('ImageURL'), petCtrl.updatePet);

// 6. تعديل حالة الحيوان أو حالة التبني)
router.patch('/:id/status', authMiddleware, petCtrl.updatePetStatusByAdmin);

// 7. مسار حذف حيوان برقم الـ ID (للمالك أو الأدمن)
router.delete('/:id', authMiddleware, petCtrl.deletePet);

module.exports = router;