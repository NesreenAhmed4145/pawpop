const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware =require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');

// مسار تسجيل مستخدم جديد
// POST: /api/users/register
router.post('/register', userController.register);
router.post('/login',userController.login)
router.patch('/profile', authMiddleware, upload.single('ProfileImage'), userController.updateProfile);
router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;