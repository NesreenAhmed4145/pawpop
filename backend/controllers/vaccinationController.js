const  Pet  = require('../models/petModel'); // تأكدي إن مسار الـ models عندك مظبوط حسب مشروعك
const  Vaccination  = require('../models/VaccinationModel'); // تأكدي إن مسار الـ models عندك مظبوط حسب مشروعك

// إضافة تطعيم جديد لحيوان
// إضافة تطعيم جديد لحيوان (للمالك أو الأدمن فقط)
exports.addVaccination = async (req, res) => {
    try {
        const { id } = req.params; // معرّف الحيوان من الـ URL
        const { VaccineName, VaccinationDate, NextDueDate, Notes, Status } = req.body;

        if (!VaccineName) {
            return res.status(400).json({ message: "VaccineName is required!" });
        }

        const pet = await Pet.findByPk(id);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found!" });
        }

        // فحص الملكية: المالك أو الأدمن فقط
        if (pet.UserID !== req.user.UserID && req.user.Role !== 'Admin') {
            return res.status(403).json({ message: "Access denied! You are not the owner of this pet." });
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
        console.error("Add vaccination error:", error);
        res.status(500).json({ message: "Failed to add vaccination." });
    }
};


const isValidDate = (value) => !isNaN(new Date(value));

// عرض كل تطعيمات حيوان
exports.getVaccinations = async (req, res) => {
    try {
        const vaccinations = await Vaccination.findAll({
            where: { PetID: req.pet.PetID },
            order: [['VaccinationDate', 'DESC']]
        });

        res.status(200).json({
            message: "Vaccinations fetched successfully!",
            count: vaccinations.length,
            data: vaccinations
        });
    } catch (error) {
        console.error("Get vaccinations error:", error);
        res.status(500).json({ message: "Failed to fetch vaccinations." });
    }
};

// تعديل تطعيم (تحديث جزئي)
exports.updateVaccination = async (req, res) => {
    try {
        const vaccinationId = Number(req.params.vaccinationId);
        if (!Number.isInteger(vaccinationId)) {
            return res.status(400).json({ message: "Invalid vaccination id!" });
        }

        // PetID في الشرط مهم: يمنع تعديل تطعيم تابع لحيوان تاني
        const vaccination = await Vaccination.findOne({
            where: { VaccinationID: vaccinationId, PetID: req.pet.PetID }
        });
        if (!vaccination) {
            return res.status(404).json({ message: "Vaccination not found!" });
        }

        const { VaccineName, VaccinationDate, NextDueDate, Notes, Status } = req.body;

        if (VaccineName !== undefined) {
            if (!String(VaccineName).trim()) {
                return res.status(400).json({ message: "VaccineName cannot be empty!" });
            }
            vaccination.VaccineName = String(VaccineName).trim();
        }

        // التواريخ: null أو '' معناها مسح القيمة
        const dates = { VaccinationDate, NextDueDate };
        for (const field of Object.keys(dates)) {
            const value = dates[field];
            if (value === undefined) continue;
            if (value === null || value === '') {
                vaccination[field] = null;
            } else if (!isValidDate(value)) {
                return res.status(400).json({ message: `${field} is not a valid date!` });
            } else {
                vaccination[field] = value;
            }
        }

        if (Notes !== undefined) vaccination.Notes = Notes;
        if (Status !== undefined) vaccination.Status = Status;

        await vaccination.save();

        res.status(200).json({
            message: "Vaccination updated successfully!",
            data: vaccination
        });
    } catch (error) {
        console.error("Update vaccination error:", error);
        res.status(500).json({ message: "Failed to update vaccination." });
    }
};

// حذف تطعيم
exports.deleteVaccination = async (req, res) => {
    try {
        const vaccinationId = Number(req.params.vaccinationId);
        if (!Number.isInteger(vaccinationId)) {
            return res.status(400).json({ message: "Invalid vaccination id!" });
        }

        const vaccination = await Vaccination.findOne({
            where: { VaccinationID: vaccinationId, PetID: req.pet.PetID }
        });
        if (!vaccination) {
            return res.status(404).json({ message: "Vaccination not found!" });
        }

        await vaccination.destroy();

        res.status(200).json({ message: "Vaccination deleted successfully!" });
    } catch (error) {
        console.error("Delete vaccination error:", error);
        res.status(500).json({ message: "Failed to delete vaccination." });
    }
};