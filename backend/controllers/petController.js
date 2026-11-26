const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const Pet = require('../models/petModel');
const Vaccination = require('../models/VaccinationModel');
const CareSchedule = require('../models/CareScheduleModel');
const Appointment = require('../models/AppointmentModel');
const AdoptionRequest = require('../models/AdoptionRequestModel');
const { sequelize } = require('../config/db');

const PET_STATUSES = ['Available', 'NotForAdoption', 'Adopted'];

const parseBoolean = (v) => {
    if (v === true || v === 'true' || v === 1 || v === '1') return true;
    if (v === false || v === 'false' || v === 0 || v === '0') return false;
    return undefined;
};

const removeFromUploads = (imageUrl) => {
    if (!imageUrl || !String(imageUrl).startsWith('/uploads/')) return;
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(imageUrl));
    fs.unlink(filePath, () => {}); 
};

const petController = {
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
    Status: petStatus 
});

            res.status(201).json({
                message: "Pet added successfully!",
                data: newPet
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

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

    async getMyPets(req, res) {
        try {
            const userId = req.user.UserID;

            // بنرجّع التطعيمات والمواعيد والـ care مع كل حيوان (طلب واحد بدل 3 طلبات لكل حيوان)
            const pets = await Pet.findAll({
                where: { UserID: userId },
                include: [
                    { model: Vaccination, as: 'Vaccinations' },
                    { model: Appointment, as: 'Appointments' },
                    { model: CareSchedule, as: 'CareSchedules' }
                ],
                order: [['CreatedAt', 'DESC']]
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

            if (!pet.IsForAdoption || pet.Status !== 'Available') {
                return res.status(404).json({ message: "Pet not found!" });
            }

            const adoptionPetDetails = await Pet.findByPk(id, {
                
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

    async updatePet(req, res) {
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


    async deletePet(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user; 

            const pet = await Pet.findByPk(id);
            if (!pet) {
                return res.status(404).json({ message: "Pet not found!" });
            }

            const isOwnerOrAdmin = currentUser.UserID === pet.UserID || currentUser.Role === 'Admin';
            if (!isOwnerOrAdmin) {
                return res.status(403).json({ message: "Access denied! You are not authorized to delete this pet." });
            }

            // نمسح البيانات المرتبطة الأول في transaction عشان الـ foreign keys ماتمنعش الحذف
            await sequelize.transaction(async (t) => {
                const where = { PetID: pet.PetID };
                await Vaccination.destroy({ where, transaction: t });
                await Appointment.destroy({ where, transaction: t });
                await CareSchedule.destroy({ where, transaction: t });
                await AdoptionRequest.destroy({ where, transaction: t });
                await pet.destroy({ transaction: t });
            });

            removeFromUploads(pet.ImageURL);

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
        const { petId } = req.params; 
        const { VaccineName, GivenDate, DueDate, Notes } = req.body;

        const pet = await Pet.findByPk(petId);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found!" });
        }

        const vaccination = await Vaccination.create({
            PetID: petId,
            VaccineName,
            GivenDate,
            DueDate, 
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