const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const Pet = require('../models/petModel');
const Vaccination = require('../models/VaccinationModel');
const CareSchedule = require('../models/CareScheduleModel');
const Appointment = require('../models/AppointmentModel');

// القيم المسموحة لحالة الحيوان. زوّد هنا أي قيمة تانية بتستخدمها في الفرونت.
const PET_STATUSES = ['Available', 'NotForAdoption', 'Adopted'];

// بيحوّل true/'true'/1 و false/'false'/0 لـ boolean، وأي حاجة تانية undefined
const parseBoolean = (v) => {
    if (v === true || v === 'true' || v === 1 || v === '1') return true;
    if (v === false || v === 'false' || v === 0 || v === '0') return false;
    return undefined;
};

// مسح ملف الصورة من مجلد uploads (basename بيمنع أي مسار غريب)
const removeFromUploads = (imageUrl) => {
    if (!imageUrl || !String(imageUrl).startsWith('/uploads/')) return;
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(imageUrl));
    fs.unlink(filePath, () => {}); // لو الملف مش موجود نتجاهل الخطأ
};

const petController = {
    // 1. إضافة حيوان جديد (Add Pet) متطابق مع الواجهة
   async addPet(req, res) {
        try {
            const userId = req.user.UserID;

            const {
                Name,
                Species,
                Breed,
                Gender,
                Description,
                BirthDate,
                IsNeutered,
                Weight,
                Color,
                VetName,
                IsForAdoption,
                Status
            } = req.body;

            if (!Name || !Species || !Breed || !Gender || !BirthDate) {
                return res.status(400).json({ 
                    message: "Please fill all required fields (Name, Species, Breed, Gender, BirthDate)!" 
                });
            }

            // لو المستخدم رفع صورة، بناخد مسارها، لو مرفعش بنخليهاnull أو قيمة افتراضية
            const imageURL = req.file ? `/uploads/${req.file.filename}` : null;

      let petStatus = Status;
if (!petStatus) {
    petStatus = (IsForAdoption === 'true' || IsForAdoption === true) ? 'Available' : 'NotForAdoption';
}

const newPet = await Pet.create({
    Name,
    Species,
    Breed,
    Gender,
    Description,
    BirthDate,
    IsNeutered: IsNeutered !== undefined ? IsNeutered : false,
    Weight,
    ImageURL: imageURL,
    Color,
    VetName,
    UserID: userId,
    IsForAdoption: IsForAdoption || false,
    Status: petStatus // هتتظبط لوحدها صح بناءً على الاختيار
});

            res.status(201).json({
                message: "Pet added successfully!",
                data: newPet
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 2. جلب جميع الحيوانات المتاحة للتبني
    async getAdoptionPets(req, res) {
        try {
            const pets = await Pet.findAll({
                where: { 

                        [Op.and]: [
      { IsForAdoption: true },
      { Status: "Available" }
    ]
                }
            });

            res.status(200).json({
                message: "Adoption pets fetched successfully!",
                count: pets.length,
                data: pets
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 3. جلب حيوانات المستخدم الحالي فقط
    async getMyPets(req, res) {
        try {
            const userId = req.user.UserID;

            const pets = await Pet.findAll({
                where: { UserID: userId }
            });

            res.status(200).json({
                message: "Your pets fetched successfully!",
                count: pets.length,
                data: pets
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 4. عرض تفاصيل حيوان معين (يتكيف حسب المالك أو الزائر)
    async getPetById(req, res) {
        try {
            const { id } = req.params;
            const pet = await Pet.findByPk(id);

            if (!pet) {
                return res.status(404).json({ message: "Pet not found!" });
            }

            const currentUser = req.user;
            const isOwnerOrAdmin = currentUser && (currentUser.UserID === pet.UserID || currentUser.Role === 'Admin');

            if (isOwnerOrAdmin) {
                const fullPetDetails = await Pet.findByPk(id, {
                    include: [
                        { model: Vaccination, as: 'Vaccinations' },
                        { model: CareSchedule, as: 'CareSchedules' },
                        { model: Appointment, as: 'Appointments' }
                    ]
                });

                return res.status(200).json({
                    mode: "owner_view",
                    message: "Full pet profile fetched successfully for owner/admin!",
                    data: fullPetDetails
                });
            }

            // أي حد تاني (زائر أو يوزر عادي) يشوف بس الحيوانات المعروضة للتبني والمتاحة.
            // بنرجّع 404 مش 403 عشان ما نكشفش إن الحيوان موجود أصلاً.
            if (!pet.IsForAdoption || pet.Status !== 'Available') {
                return res.status(404).json({ message: "Pet not found!" });
            }

            const adoptionPetDetails = await Pet.findByPk(id, {
                // بيانات خاصة بالمالك مش بتتعرض للعامة
                attributes: { exclude: ['UserID', 'VetName'] },
                include: [
                    { model: Vaccination, as: 'Vaccinations', attributes: ['VaccineName', 'Status', 'NextDueDate'] }
                ]
            });

            return res.status(200).json({
                mode: "adoption_view",
                message: "Pet adoption details fetched successfully!",
                data: adoptionPetDetails
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 5. تعديل بيانات الحيوان (تحديث جزئي متوافق مع نافذة الـ Edit)
    async updatePet(req, res) {
        // لو في أي خطأ بعد رفع الصورة بنمسحها عشان ما تفضلش ملفات يتيمة
        const discardUploadedFile = () => {
            if (req.file) removeFromUploads(`/uploads/${req.file.filename}`);
        };

        try {
            const { id } = req.params;
            const userId = req.user.UserID;
            const body = req.body || {};

            const pet = await Pet.findByPk(id);
            if (!pet) {
                discardUploadedFile();
                return res.status(404).json({ message: "Pet not found!" });
            }

            if (pet.UserID !== userId) {
                discardUploadedFile();
                return res.status(403).json({ message: "Access denied! You are not the owner of this pet." });
            }

            // ImageURL مش موجودة هنا عن قصد: الصورة بتتغير بس برفع ملف
            // (لو اتقبلت من الـ body المستخدم يقدر يشاور على ملف حد تاني)
            const fieldsToUpdate = [
                'Name', 'Species', 'Breed', 'Gender', 'Description',
                'BirthDate', 'IsNeutered', 'Weight',
                'Color', 'VetName',
                'GoodWithDogs', 'GoodWithChildren', 'GoodWithApartments'
            ];

            fieldsToUpdate.forEach(field => {
                if (body[field] !== undefined) {
                    pet[field] = body[field];
                }
            });

            if (body.Status !== undefined) {
                if (!PET_STATUSES.includes(body.Status)) {
                    discardUploadedFile();
                    return res.status(400).json({ message: `Status must be one of: ${PET_STATUSES.join(', ')}` });
                }
                pet.Status = body.Status;
            }

            if (body.IsForAdoption !== undefined) {
                const isForAdoption = parseBoolean(body.IsForAdoption);
                if (isForAdoption === undefined) {
                    discardUploadedFile();
                    return res.status(400).json({ message: "IsForAdoption must be true or false!" });
                }
                pet.IsForAdoption = isForAdoption;
            }

            // صورة جديدة: نحفظ مسارها ونمسح القديمة بعد نجاح الحفظ
            let oldImageUrl = null;
            if (req.file) {
                oldImageUrl = pet.ImageURL;
                pet.ImageURL = `/uploads/${req.file.filename}`;
            }

            await pet.save();
            if (oldImageUrl) removeFromUploads(oldImageUrl);

            res.status(200).json({
                message: "Pet updated successfully!",
                data: pet
            });
        } catch (error) {
            discardUploadedFile();
            res.status(500).json({ error: error.message });
        }
    },

    // 6. تعديل حالة الحيوان بواسطة الأدمن فقط
    async updatePetStatusByAdmin(req, res) {
        try {
            const { id } = req.params;
            const { Status, IsForAdoption } = req.body || {};

            if (Status === undefined && IsForAdoption === undefined) {
                return res.status(400).json({ message: "Provide Status and/or IsForAdoption!" });
            }

            if (Status !== undefined && !PET_STATUSES.includes(Status)) {
                return res.status(400).json({ message: `Status must be one of: ${PET_STATUSES.join(', ')}` });
            }

            let isForAdoption;
            if (IsForAdoption !== undefined) {
                isForAdoption = parseBoolean(IsForAdoption);
                if (isForAdoption === undefined) {
                    return res.status(400).json({ message: "IsForAdoption must be true or false!" });
                }
            }

            const pet = await Pet.findByPk(id);
            if (!pet) {
                return res.status(404).json({ message: "Pet not found!" });
            }

            if (Status !== undefined) pet.Status = Status;
            if (isForAdoption !== undefined) pet.IsForAdoption = isForAdoption;

            await pet.save();

            res.status(200).json({
                message: "Pet status updated successfully by Admin!",
                data: pet
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 7. حذف حيوان (بواسطة المالك أو الأدمن فقط)
    async deletePet(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user; // جاية من الـ middleware

            const pet = await Pet.findByPk(id);
            if (!pet) {
                return res.status(404).json({ message: "Pet not found!" });
            }

            // التأكد أن المستخدم الحالي هو مالك الحيوان أو أدمن
            const isOwnerOrAdmin = currentUser.UserID === pet.UserID || currentUser.Role === 'Admin';
            if (!isOwnerOrAdmin) {
                return res.status(403).json({ message: "Access denied! You are not authorized to delete this pet." });
            }

            await pet.destroy();

            res.status(200).json({
                message: "Pet deleted successfully!"
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};



exports.addVaccination = async (req, res) => {
    try {
        const { petId } = req.params; // معرف الحيوان من الـ URL
        const { VaccineName, GivenDate, DueDate, Notes } = req.body;

        // التأكد إن الحيوان موجود
        const pet = await Pet.findByPk(petId);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found!" });
        }

        const vaccination = await Vaccination.create({
            PetID: petId,
            VaccineName,
            GivenDate,
            DueDate, // تأكدي إن العمود ده مضاف في الداتا بيز زي ما ناقشنا سابقاً
            Notes
        });

        res.status(201).json({
            message: "Vaccination added successfully!",
            data: vaccination
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.addAppointment = async (req, res) => {
    try {
        const { petId } = req.params;
        const { AppointmentDate, Reason, Status } = req.body;

        const pet = await Pet.findByPk(petId);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found!" });
        }

        const appointment = await Appointment.create({
            PetID: petId,
            AppointmentDate,
            Reason,
            Status: Status || 'Scheduled'
        });

        res.status(201).json({
            message: "Appointment scheduled successfully!",
            data: appointment
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = petController;