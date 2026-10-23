const  Pet  = require('../models/petModel'); // تأكدي إن مسار الـ models عندك مظبوط حسب مشروعك
const  Vaccination  = require('../models/VaccinationModel'); // تأكدي إن مسار الـ models عندك مظبوط حسب مشروعك

// إضافة تطعيم جديد لحيوان
exports.addVaccination = async (req, res) => {
    try {
        const { id } = req.params; // معرّف الحيوان من الـ URL
        const { VaccineName, VaccinationDate, NextDueDate, Notes, Status } = req.body;

        // التأكد إن الحيوان موجود
        const pet = await Pet.findByPk(id);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found!" });
        }

        const vaccination = await Vaccination.create({
            PetID: id,
            VaccineName,
            VaccinationDate,
            NextDueDate,
            Notes,
            Status: Status || 'Completed'
        });

        res.status(201).json({
            message: "Vaccination added successfully!",
            data: vaccination
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};