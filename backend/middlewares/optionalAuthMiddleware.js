const jwt = require('jsonwebtoken');

const optionalAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        req.user = null; // مفيش توكن، اعتبره زائر عادي
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // لو التوكن سليم، احفظ بيانات المستخدم
    } catch (err) {
        req.user = null; // لو التوكن باظ أو انتهى، اعتبره زائر عادي برضه
    }
    next();
};

module.exports = optionalAuthMiddleware;