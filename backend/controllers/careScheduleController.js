const CareSchedule = require('../models/CareScheduleModel');

const parseBoolean = (value) => {
    if (value === true || value === 'true' || value === 1 || value === '1') return true;
    if (value === false || value === 'false' || value === 0 || value === '0') return false;
    return null; // قيمة غير صالحة
};

// عرض مهام الرعاية لحيوان (بالترتيب حسب التاريخ)
exports.getCareSchedules = async (req, res) => {
    try {
        const tasks = await CareSchedule.findAll({
            where: { PetID: req.pet.PetID },
            order: [['ScheduleDate', 'ASC']]
        });

        res.status(200).json({
            message: "Care schedules fetched successfully!",
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error("Get care schedules error:", error);
        res.status(500).json({ message: "Failed to fetch care schedules." });
    }
};

// إضافة مهمة رعاية
exports.addCareSchedule = async (req, res) => {
    try {
        const { TaskName, ScheduleDate } = req.body;

        if (!TaskName || !String(TaskName).trim()) {
            return res.status(400).json({ message: "TaskName is required!" });
        }
        if (!ScheduleDate || isNaN(new Date(ScheduleDate))) {
            return res.status(400).json({ message: "A valid ScheduleDate is required!" });
        }

        const task = await CareSchedule.create({
            PetID: req.pet.PetID,
            TaskName: String(TaskName).trim(),
            ScheduleDate
        });

        res.status(201).json({
            message: "Care task added successfully!",
            data: task
        });
    } catch (error) {
        console.error("Add care schedule error:", error);
        res.status(500).json({ message: "Failed to add care task." });
    }
};

// تعديل مهمة (بما فيها تعليمها كمكتملة IsCompleted)
exports.updateCareSchedule = async (req, res) => {
    try {
        const careId = Number(req.params.careId);
        if (!Number.isInteger(careId)) {
            return res.status(400).json({ message: "Invalid care task id!" });
        }

        const task = await CareSchedule.findOne({
            where: { CareID: careId, PetID: req.pet.PetID }
        });
        if (!task) {
            return res.status(404).json({ message: "Care task not found!" });
        }

        const { TaskName, ScheduleDate, IsCompleted } = req.body;

        if (TaskName !== undefined) {
            if (!String(TaskName).trim()) {
                return res.status(400).json({ message: "TaskName cannot be empty!" });
            }
            task.TaskName = String(TaskName).trim();
        }

        if (ScheduleDate !== undefined) {
            if (!ScheduleDate || isNaN(new Date(ScheduleDate))) {
                return res.status(400).json({ message: "A valid ScheduleDate is required!" });
            }
            task.ScheduleDate = ScheduleDate;
        }

        if (IsCompleted !== undefined) {
            const parsed = parseBoolean(IsCompleted);
            if (parsed === null) {
                return res.status(400).json({ message: "IsCompleted must be true or false!" });
            }
            task.IsCompleted = parsed;
        }

        await task.save();

        res.status(200).json({
            message: "Care task updated successfully!",
            data: task
        });
    } catch (error) {
        console.error("Update care schedule error:", error);
        res.status(500).json({ message: "Failed to update care task." });
    }
};

// حذف مهمة
exports.deleteCareSchedule = async (req, res) => {
    try {
        const careId = Number(req.params.careId);
        if (!Number.isInteger(careId)) {
            return res.status(400).json({ message: "Invalid care task id!" });
        }

        const task = await CareSchedule.findOne({
            where: { CareID: careId, PetID: req.pet.PetID }
        });
        if (!task) {
            return res.status(404).json({ message: "Care task not found!" });
        }

        await task.destroy();

        res.status(200).json({ message: "Care task deleted successfully!" });
    } catch (error) {
        console.error("Delete care schedule error:", error);
        res.status(500).json({ message: "Failed to delete care task." });
    }
};