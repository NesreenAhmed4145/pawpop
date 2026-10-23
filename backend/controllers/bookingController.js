const { Booking, Accommodation, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// 1. التحقق من توفر الأماكن في تواريخ معينة
exports.checkAvailability = async (req, res) => {
    try {
        const { accommodationId } = req.params;
        const { checkInDate, checkOutDate } = req.query;

        if (!checkInDate || !checkOutDate) {
            return res.status(400).json({ message: "Please provide checkInDate and checkOutDate!" });
        }

        // البحث عن أي حجز مؤكد يتداخل مع الفترة المطلوبة
        const overlappingBooking = await Booking.findOne({
            where: {
                AccommodationID: accommodationId,
                Status: 'confirmed',
                [Op.and]: [
                    { CheckInDate: { [Op.lt]: checkOutDate } },
                    { CheckOutDate: { [Op.gt]: checkInDate } }
                ]
            }
        });

        if (overlappingBooking) {
            return res.status(200).json({ 
                available: false, 
                message: "Accommodation is already booked for these dates!" 
            });
        }

        res.status(200).json({ 
            available: true, 
            message: "Accommodation is available for your dates!" 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// 2. إنشاء حجز جديد مع حماية ضد الحجز المزدوج (Transaction)
// 2. إنشاء حجز جديد بدون مشاكل الـ Transactions المعقدة مع SQL Server
exports.createBooking = async (req, res) => {
    let t = null;
    try {
        const userId = req.user.UserID;
        const { AccommodationID, CheckInDate, CheckOutDate, GuestsCount, PetsCount } = req.body;

        // التأكد من وجود مكان الإقامة أولاً
        const accommodation = await Accommodation.findByPk(AccommodationID);
        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found!" });
        }

        // منع المستخدم من حجز مكانه الخاص
        if (accommodation.HostID === userId) {
            return res.status(400).json({ message: "You cannot book your own accommodation!" });
        }

        // التحقق من تداخل التواريخ مع الحجوزات المؤكدة مسبقاً
        const overlappingBooking = await Booking.findOne({
            where: {
                AccommodationID,
                Status: 'confirmed',
                [Op.and]: [
                    { CheckInDate: { [Op.lt]: CheckOutDate } },
                    { CheckOutDate: { [Op.gt]: CheckInDate } }
                ]
            }
        });

        if (overlappingBooking) {
            return res.status(400).json({ message: "Selected dates are already booked. Please choose other dates!" });
        }

        // حساب السعر الإجمالي (عدد الليالي * سعر الليلة)
        const checkIn = new Date(CheckInDate);
        const checkOut = new Date(CheckOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            return res.status(400).json({ message: "Check-out date must be after check-in date!" });
        }

        const totalPrice = nights * accommodation.PricePerNight;

        // بدء الـ Transaction بأمان تام بعد اجتياز كل التحقق
        t = await sequelize.transaction();

        // إنشاء الحجز
        const newBooking = await Booking.create({
            AccommodationID,
            UserID: userId,
            CheckInDate,
            CheckOutDate,
            GuestsCount,
            PetsCount,
            TotalPrice: totalPrice,
            Status: 'pending'
        }, { transaction: t });

        await t.commit(); // تأكيد المعاملة بنجاح

        res.status(201).json({
            message: "Booking created successfully!",
            data: newBooking
        });
    } catch (error) {
        // التحقق من أن المعاملة تم فتحها بالفعل قبل محاولة التراجع عنها
        if (t && typeof t.finished === 'undefined' || (t && !t.finished)) {
            try {
                await t.rollback();
            } catch (rbError) {
                console.error("Rollback error:", rbError);
            }
        }
        console.error("Booking Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// 3. جلب حجوزات المستخدم الحالي (My Bookings)
exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.UserID;

        const bookings = await Booking.findAll({
            where: { UserID: userId },
            include: [
                { 
                    model: Accommodation, 
                    as: 'Accommodation',
                    attributes: ['AccommodationID', 'Title', 'Location', 'ImageURL', 'PricePerNight'] 
                }
            ],
            order: [['CreatedAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. عرض تفاصيل حجز معين
exports.getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.UserID;

        const booking = await Booking.findOne({
            where: { BookingID: bookingId, UserID: userId },
            include: [{ model: Accommodation, as: 'Accommodation' }]
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found or unauthorized!" });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. تعديل تفاصيل أو تواريخ الحجز
exports.updateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.UserID;
        const { CheckInDate, CheckOutDate, GuestsCount, PetsCount } = req.body;

        const booking = await Booking.findOne({ where: { BookingID: bookingId, UserID: userId } });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found!" });
        }

        if (booking.Status === 'cancelled' || booking.Status === 'completed') {
            return res.status(400).json({ message: "Cannot update a cancelled or completed booking!" });
        }

        // تحديث البيانات المتاحة
        await booking.update({
            CheckInDate: CheckInDate || booking.CheckInDate,
            CheckOutDate: CheckOutDate || booking.CheckOutDate,
            GuestsCount: GuestsCount !== undefined ? GuestsCount : booking.GuestsCount,
            PetsCount: PetsCount !== undefined ? PetsCount : booking.PetsCount
        });

        res.status(200).json({ message: "Booking updated successfully!", data: booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. إلغاء الحجز (Cancel Booking)
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.UserID;

        const booking = await Booking.findOne({ where: { BookingID: bookingId, UserID: userId } });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found!" });
        }

        if (booking.Status === 'cancelled') {
            return res.status(400).json({ message: "Booking is already cancelled!" });
        }

        await booking.update({ Status: 'cancelled' });

        res.status(200).json({ message: "Booking cancelled successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// === Admin Controllers ===

// 7. الأدمن يعرض كل الحجوزات
exports.adminGetAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: Accommodation, as: 'Accommodation', attributes: ['Title', 'Location'] },
                { model: User, as: 'User', attributes: ['UserID', 'FullName', 'Email'] }
            ],
            order: [['CreatedAt', 'DESC']]
        });

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. الأدمن يحدّث حالة الحجز (pending, confirmed, cancelled, completed)
exports.adminUpdateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { Status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(Status)) {
            return res.status(400).json({ message: "Invalid status value!" });
        }

        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found!" });
        }

        await booking.update({ Status });

        res.status(200).json({ message: "Booking status updated successfully!", data: booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};