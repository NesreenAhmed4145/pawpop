const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.Role === 'Admin') {
        next(); 
    } else {
        res.status(403).json({ message: "Access denied! Admin privileges required." });
    }
};

module.exports = adminMiddleware;