const  AdoptionRequest = require('../models/AdoptionRequestModel');
const  Pet = require('../models/petModel');
const  User = require('../models/userModel');





// 1. تقديم طلب تبني جديد (لأي مستخدم مسجل دخول)
exports.createAdoptionRequest = async (req, res) => {
    try {
        const { petId } = req.body;
        const userId = req.user.UserID; // أخذ ID المستخدم من التوكن
        const { Notes } = req.body;

        // التأكد من وجود الحيوان
        const pet = await Pet.findByPk(petId);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found!" });
        }

        // منع المستخدم من تقديم طلب تبني لحيوانه الخاص
        if (pet.UserID === userId) {
            return res.status(400).json({ message: "You cannot submit an adoption request for your own pet!" });
        }


const existingRequest = await AdoptionRequest.findOne({
            where: { PetID: petId, RequesterID: userId, Status: 'Pending' }
        });

        if (existingRequest) {
            return res.status(400).json({ 
                message: "You already have a pending adoption request for this pet!" 
            });
        }

        // إنشاء طلب التبني
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
        console.error("Adoption Error Details:", error); // هيطبع الخطأ كاملاً في الـ Terminal عندك
        res.status(500).json({ 
            error: error.message || "Unknown server error",
            details: error 
        });
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
        const { Status } = req.body; // 'Approved' أو 'Rejected'
        const currentUserId = req.user.UserID; // معرّف اليوزر المسجل حالياً من authMiddleware

        // 1. جلب طلب التبني مع بيانات الحيوان المرتبط بيه
        const request = await AdoptionRequest.findByPk(id, {
            include: [{ model: Pet, as: 'Pet' }]
        });

        if (!request) {
            return res.status(404).json({ message: "Adoption request not found!" });
        }

        // 2. التحقق الحصري: هل المستخدم الحالي هو صاحب الحيوان؟
        const isOwner = request.Pet && request.Pet.UserID === currentUserId;

        if (!isOwner) {
            return res.status(403).json({ 
                message: "Access denied! Only the pet owner can update this adoption request." 
            });
        }

        // 3. تحديث وحفظ حالة طلب التبني
        request.Status = Status;
        await request.save();

        // 4. إذا وافق صاحب الحيوان على التبني، نحدث حالة الحيوان نفسه في جدول الـ Pets
     if (Status === 'Approved' && request.Pet) {
            request.Pet.Status = 'NotForAdoption'; // استبدلي Adopted بالكلمة المقبولة فعلاً في الداتا بيز لديك
            request.Pet.IsForAdoption = false; // إخفاء الحيوان من قائمة المتاح للتبني
            await request.Pet.save();
        }

        res.status(200).json({
            message: `Adoption request status updated to ${Status} successfully by owner!`,
            data: request
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// إلغاء طلب التبني (بواسطة المستخدم صاحب الطلب نفسه)
exports.cancelAdoptionRequest = async (req, res) => {
    try {
        const { id } = req.params; // RequestID
        const currentUserId = req.user.UserID; // معرّف اليوزر المسجل حالياً من التوكن

        // 1. جلب طلب التبني مع بيانات الحيوان المرتبط بيه
        const request = await AdoptionRequest.findByPk(id, {
            include: [{ model: Pet, as: 'Pet' }]
        });

        if (!request) {
            return res.status(404).json({ message: "Adoption request not found!" });
        }

        // 2. التحقق: هل المستخدم الحالي هو من قام بتقديم هذا الطلب؟ (باستخدام RequesterID)
        if (request.RequesterID !== currentUserId) {
            return res.status(403).json({ 
                message: "Access denied! You can only cancel your own adoption requests." 
            });
        }

        // 3. التحقق مما إذا كان الطلب قابلاً للإلغاء (مثلاً إذا كان لا يزال Pending)
        if (request.Status !== 'Pending') {
            return res.status(400).json({ 
                message: `Cannot cancel this request because its current status is '${request.Status}'.` 
            });
        }

        // 4. تحديث حالة الطلب إلى 'Cancelled'
        request.Status = 'Cancelled';
        await request.save();

        // 5. التأكد من أن الحيوان يظل متاحاً للتبني لمن أراد
        if (request.Pet) {
            request.Pet.Status = 'Available';
            request.Pet.IsForAdoption = true;
            await request.Pet.save();
        }

        res.status(200).json({
            message: "Adoption request cancelled successfully!",
            data: request
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};