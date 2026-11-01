const  AdoptionRequest = require('../models/AdoptionRequestModel');
const  Pet = require('../models/petModel');
const  User = require('../models/userModel');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

const httpError = (status, message) => Object.assign(new Error(message), { status });


// 1. تقديم طلب تبني جديد (لأي مستخدم مسجل دخول)
exports.createAdoptionRequest = async (req, res) => {
    try {
        const { petId, Notes } = req.body;
        const userId = req.user.UserID;

        if (!petId) {
            return res.status(400).json({ message: "petId is required!" });
        }

        const pet = await Pet.findByPk(petId);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found!" });
        }

        // منع المستخدم من تقديم طلب تبني لحيوانه الخاص
        if (pet.UserID === userId) {
            return res.status(400).json({ message: "You cannot submit an adoption request for your own pet!" });
        }

        // الحيوان لازم يكون معروض للتبني ومتاح
        if (!pet.IsForAdoption || pet.Status !== 'Available') {
            return res.status(400).json({ message: "This pet is not available for adoption!" });
        }

        const existingRequest = await AdoptionRequest.findOne({
            where: { PetID: petId, RequesterID: userId, Status: 'Pending' }
        });
        if (existingRequest) {
            return res.status(400).json({
                message: "You already have a pending adoption request for this pet!"
            });
        }

        const newRequest = await AdoptionRequest.create({
            PetID: petId,
            RequesterID: userId,
            Notes,
            Status: 'Pending'
        });

        res.status(201).json({
            message: "Adoption request submitted successfully!",
            data: newRequest
        });
    } catch (error) {
        console.error("Adoption Error Details:", error); // التفاصيل في الـ Terminal فقط
        res.status(500).json({ message: "Failed to submit adoption request." });
    }
};


exports.getMyAdoptionRequests = async (req, res) => {
    try {
        const userId = req.user.UserID;

        const requests = await AdoptionRequest.findAll({
            where: { RequesterID: userId },
            include: [
                { model: Pet, as: 'Pet' }
            ]
        });

        res.status(200).json({
            message: "Your submitted adoption requests fetched successfully!",
            data: requests
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. عرض طلبات التبني الواردة على حيوانات المستخدم الحالي (الطلبات اللي الناس بعتها لحيواناتي عشان أوافق عليها)
exports.getOwnerPetsRequests = async (req, res) => {
    try {
        const userId = req.user.UserID;

        // نجيب أولاً كل الحيوانات بتاعت المستخدم ده
        const userPets = await Pet.findAll({
            where: { UserID: userId },
            attributes: ['PetID']
        });

        const petIds = userPets.map(pet => pet.PetID);

        // نجيب طلبات التبني المرتبطة بحيوانات هذا المستخدم فقط
        const requests = await AdoptionRequest.findAll({
            where: {
                PetID: petIds // بيجيب الطلبات الخاصة بحيوانات المالك ده فقط
            },
            include: [
                { model: Pet, as: 'Pet' },
                { model: User, as: 'User', attributes: ['UserID', 'FullName', 'Email', 'Phone'] }
            ]
        });

        res.status(200).json({
            message: "Adoption requests for your pets fetched successfully!",
            data: requests
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. عرض جميع طلبات التبني في المنصة (مخصصة للأدمن فقط)
exports.getAllAdoptionRequests = async (req, res) => {
    try {
        const requests = await AdoptionRequest.findAll({
            include: [
                { model: Pet, as: 'Pet' },
                { model: User, as: 'User', attributes: ['UserID', 'FullName', 'Email', 'Phone'] }
            ]
        });

        res.status(200).json({
            message: "All system adoption requests fetched successfully (Admin View)!",
            data: requests
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// تحديث حالة طلب التبني (بواسطة صاحب الحيوان فقط)
exports.updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params; // RequestID
        const { Status } = req.body; // 'Approved' أو 'Rejected' فقط
        const currentUserId = req.user.UserID;

        if (!['Approved', 'Rejected'].includes(Status)) {
            return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'." });
        }

        const request = await AdoptionRequest.findByPk(id, {
            include: [{ model: Pet, as: 'Pet' }]
        });
        if (!request) {
            return res.status(404).json({ message: "Adoption request not found!" });
        }

        const isOwner = request.Pet && request.Pet.UserID === currentUserId;
        if (!isOwner) {
            return res.status(403).json({
                message: "Access denied! Only the pet owner can update this adoption request."
            });
        }

        // كل التغييرات في transaction واحدة: يا كلها تنجح يا كلها تتلغي
        await sequelize.transaction(async (t) => {
            // 1. الطلب لازم يكون Pending (التحديث بشرط، فمفيش سباق بين طلبين)
            const [changed] = await AdoptionRequest.update(
                { Status },
                { where: { RequestID: request.RequestID, Status: 'Pending' }, transaction: t }
            );
            if (changed === 0) {
                throw httpError(409, "This request is no longer pending, so its status cannot be changed.");
            }

            if (Status === 'Approved') {
                // 2. الحيوان لازم لسه متاح وتحت إيد المالك الحالي، وبنخفيه من قائمة التبني
                //    وبننقل ملكيته للمتبنّي (UserID بقى بتاع صاحب الطلب)
                const [petChanged] = await Pet.update(
                    { Status: 'NotForAdoption', IsForAdoption: false, UserID: request.RequesterID },
                    {
                        where: {
                            PetID: request.PetID,
                            UserID: currentUserId,
                            IsForAdoption: true,
                            Status: 'Available'
                        },
                        transaction: t
                    }
                );
                if (petChanged === 0) {
                    throw httpError(409, "This pet is no longer available for adoption.");
                }

                // 3. رفض باقي الطلبات المعلقة على نفس الحيوان
                await AdoptionRequest.update(
                    { Status: 'Rejected' },
                    {
                        where: {
                            PetID: request.PetID,
                            Status: 'Pending',
                            RequestID: { [Op.ne]: request.RequestID }
                        },
                        transaction: t
                    }
                );
            }
        });

        await request.reload();

        res.status(200).json({
            message: `Adoption request status updated to ${Status} successfully by owner!`,
            data: request
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Update adoption status error:", error);
        res.status(500).json({ message: "Failed to update adoption request." });
    }
};
// إلغاء طلب التبني (بواسطة المستخدم صاحب الطلب نفسه)
exports.cancelAdoptionRequest = async (req, res) => {
    try {
        const { id } = req.params; // RequestID
        const currentUserId = req.user.UserID;

        const request = await AdoptionRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: "Adoption request not found!" });
        }

        if (request.RequesterID !== currentUserId) {
            return res.status(403).json({
                message: "Access denied! You can only cancel your own adoption requests."
            });
        }

        // الإلغاء مسموح فقط للطلب Pending (تحديث بشرط لتجنب السباق)
        const [changed] = await AdoptionRequest.update(
            { Status: 'Cancelled' },
            { where: { RequestID: id, Status: 'Pending' } }
        );
        if (changed === 0) {
            return res.status(400).json({
                message: `Cannot cancel this request because its current status is '${request.Status}'.`
            });
        }

        // ملحوظة: مفيش أي تعديل على الحيوان هنا، لأن تقديم الطلب ما غيّرش حالته أصلاً.

        await request.reload();

        res.status(200).json({
            message: "Adoption request cancelled successfully!",
            data: request
        });
    } catch (error) {
        console.error("Cancel adoption error:", error);
        res.status(500).json({ message: "Failed to cancel adoption request." });
    }
}