const multer = require('multer');
const path = require('path');

// تحديد مكان حفظ الصورة واسمها الأصلي مع إضافة تاريخ لتجنب تشابه الأسماء
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // تأكدي إن مجلد uploads موجود في مشروعك
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// فلاتر التأكد أن الملف المرفوع هو صورة فقط
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPG, PNG, WEBP) are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // أقصى حجم 5 ميجابايت مطابق للواجهة
    fileFilter: fileFilter
});

module.exports = upload;