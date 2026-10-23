const Appointment = require('../models/AppointmentModel');
const Pet = require('../models/petModel')
exports.addAppointment = async (req, res) => {
    try {
        const { id } = req.params; // معرف الحيوان من الـ URL
        const userId = req.user.UserID; // أخذ معرف المستخدم من التوكن مباشرة
        const { AppointmentDate, AppointmentType, Reason, Status } = req.body;

        // التأكد إن الحيوان موجود
        const pet = await Pet.findByPk(id);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found!" });
        }

        const appointment = await Appointment.create({
            PetID: id,
            UserID: userId, // ربط الموعد باليوزر المسجل حالياً
            AppointmentType: AppointmentType || 'Checkup', // قيمة افتراضية لو لم تُرسل
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