const { Op } = require('sequelize');
const Pet = require('../models/petModel');
const Vaccination = require('../models/VaccinationModel');
const CareSchedule = require('../models/CareScheduleModel');
const Appointment = require('../models/AppointmentModel');

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
            } else {
                const adoptionPetDetails = await Pet.findByPk(id, {
                    include: [
                        { model: Vaccination, as: 'Vaccinations', attributes: ['VaccineName', 'Status', 'NextDueDate'] } // تم التعديل هنا من DueDate إلى NextDueDate
                    ]
                });

                return res.status(200).json({
                    mode: "adoption_view",
                    message: "Pet adoption details fetched successfully!",
                    data: adoptionPetDetails
                });
            }

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 5. تعديل بيانات الحيوان (تحديث جزئي متوافق مع نافذة الـ Edit)
    async updatePet(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.UserID;

            const pet = await Pet.findByPk(id);
            if (!pet) {
                return res.status(404).json({ message: "Pet not found!" });
            }

            if (pet.UserID !== userId) {
                return res.status(403).json({ message: "Access denied! You are not the owner of this pet." });
            }

            const fieldsToUpdate = [
                'Name', 'Species', 'Breed', 'Gender', 'Description', 
                'BirthDate', 'IsNeutered', 'Weight', 'ImageURL', 
                'Color', 'VetName', 'IsForAdoption', 'Status',
                'GoodWithDogs', 'GoodWithChildren', 'GoodWithApartments'
            ];

            fieldsToUpdate.forEach(field => {
                if (req.body[field] !== undefined) {
                    pet[field] = req.body[field];
                }
            });

            await pet.save();

            res.status(200).json({
                message: "Pet updated successfully!",
                data: pet
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 6. تعديل حالة الحيوان بواسطة الأدمن فقط
    async updatePetStatusByAdmin(req, res) {
        try {
            const { id } = req.params;
            const { Status, IsForAdoption } = req.body;

            const pet = await Pet.findByPk(id);
            if (!pet) {
                return res.status(404).json({ message: "Pet not found!" });
            }

            if (Status !== undefined) pet.Status = Status;
            if (IsForAdoption !== undefined) pet.IsForAdoption = IsForAdoption;

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