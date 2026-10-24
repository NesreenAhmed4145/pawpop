const Appointment = require('../models/AppointmentModel');
const Pet = require('../models/petModel')

// إضافة موعد لحيوان (للمالك أو الأدمن فقط)
exports.addAppointment = async (req, res) => {
    try {
        const { id } = req.params; // معرف الحيوان من الـ URL
        const userId = req.user.UserID;
  const { AppointmentDate, AppointmentType, Location, Reason, Notes, Status } = req.body;

        if (!AppointmentDate || isNaN(new Date(AppointmentDate))) {
            return res.status(400).json({ message: "A valid AppointmentDate is required!" });
        }

        const pet = await Pet.findByPk(id);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found!" });
        }

        // فحص الملكية: المالك أو الأدمن فقط
        if (pet.UserID !== userId && req.user.Role !== 'Admin') {
            return res.status(403).json({ message: "Access denied! You are not the owner of this pet." });
        }

        const appointment = await Appointment.create({
            PetID: id,
            UserID: userId,
            AppointmentType: AppointmentType || 'Checkup',
            AppointmentDate,
            // الموديل مفيهوش عمود Reason، فبنحفظه في Notes عشان ما يضيعش
            Notes: Notes ?? Reason,
            Status: Status || 'Scheduled'
        });

        res.status(201).json({
            message: "Appointment scheduled successfully!",
            data: appointment
        });
    } catch (error) {
        console.error("Add appointment error:", error);
        res.status(500).json({ message: "Failed to schedule appointment." });
    }
};


const APPOINTMENT_STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

// عرض كل مواعيد حيوان (الأقرب أولاً)
exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            where: { PetID: req.pet.PetID },
            order: [['AppointmentDate', 'ASC']]
        });

        res.status(200).json({
            message: "Appointments fetched successfully!",
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error("Get appointments error:", error);
        res.status(500).json({ message: "Failed to fetch appointments." });
    }
};

// تعديل موعد (تحديث جزئي)
exports.updateAppointment = async (req, res) => {
    try {
        const appointmentId = Number(req.params.appointmentId);
        if (!Number.isInteger(appointmentId)) {
            return res.status(400).json({ message: "Invalid appointment id!" });
        }

        const appointment = await Appointment.findOne({
            where: { AppointmentID: appointmentId, PetID: req.pet.PetID }
        });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found!" });
        }

        const { AppointmentDate, AppointmentType, Location, Status, Notes } = req.body;

        if (AppointmentDate !== undefined) {
            if (!AppointmentDate || isNaN(new Date(AppointmentDate))) {
                return res.status(400).json({ message: "A valid AppointmentDate is required!" });
            }
            appointment.AppointmentDate = AppointmentDate;
        }

        if (AppointmentType !== undefined) {
            if (!String(AppointmentType).trim()) {
                return res.status(400).json({ message: "AppointmentType cannot be empty!" });
            }
            appointment.AppointmentType = String(AppointmentType).trim();
        }

        if (Status !== undefined) {
            if (!APPOINTMENT_STATUSES.includes(Status)) {
                return res.status(400).json({
                    message: `Status must be one of: ${APPOINTMENT_STATUSES.join(', ')}`
                });
            }
            appointment.Status = Status;
        }

        if (Location !== undefined) appointment.Location = Location;
        if (Notes !== undefined) appointment.Notes = Notes;

        await appointment.save();

        res.status(200).json({
            message: "Appointment updated successfully!",
            data: appointment
        });
    } catch (error) {
        console.error("Update appointment error:", error);
        res.status(500).json({ message: "Failed to update appointment." });
    }
};

// حذف موعد
exports.deleteAppointment = async (req, res) => {
    try {
        const appointmentId = Number(req.params.appointmentId);
        if (!Number.isInteger(appointmentId)) {
            return res.status(400).json({ message: "Invalid appointment id!" });
        }

        const appointment = await Appointment.findOne({
            where: { AppointmentID: appointmentId, PetID: req.pet.PetID }
        });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found!" });
        }

        await appointment.destroy();

        res.status(200).json({ message: "Appointment deleted successfully!" });
    } catch (error) {
        console.error("Delete appointment error:", error);
        res.status(500).json({ message: "Failed to delete appointment." });
    }
};