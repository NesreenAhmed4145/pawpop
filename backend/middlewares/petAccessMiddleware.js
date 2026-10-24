const Pet = require('../models/petModel');

// بيتأكد إن الحيوان (req.params.id) موجود وإن المستخدم هو مالكه أو أدمن
// وبيحط الحيوان في req.pet عشان الـ controller يستخدمه
module.exports = async (req, res, next) => {
    try {
        const pet = await Pet.findByPk(req.params.id);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found!" });
        }

        if (pet.UserID !== req.user.UserID && req.user.Role !== 'Admin') {
            return res.status(403).json({ message: "Access denied! You are not the owner of this pet." });
        }

        req.pet = pet;
        next();
    } catch (error) {
        console.error("Pet access check error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};