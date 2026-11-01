const { Booking, Accommodation, AccommodationRule, User, sequelize } = require('../models');
const { Op, Transaction } = require('sequelize');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// بيرجّع 'YYYY-MM-DD' بس، عشان مقارنة التواريخ ما تتأثرش بصيغة الإدخال
const toDay = (d) => String(d).slice(0, 10);

const httpError = (status, message) => Object.assign(new Error(message), { status });

// transaction بمستوى SERIALIZABLE عشان نمنع الحجز المزدوج لو طلبين اتبعتوا في نفس اللحظة
const serializableTx = () =>
    sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });

// بيدور على حجز مؤكد بيتداخل مع الفترة (ويستثني حجز معين لو بنعدله أو بنأكده)
const findConfirmedOverlap = (accommodationId, checkIn, checkOut, t, excludeBookingId = null) => {
    const where = {
        AccommodationID: accommodationId,
        Status: 'confirmed',
        CheckInDate: { [Op.lt]: checkOut },
        CheckOutDate: { [Op.gt]: checkIn }
    };
    if (excludeBookingId) where.BookingID = { [Op.ne]: excludeBookingId };
    return Booking.findOne({ where, transaction: t });
};

// بيتحقق من التواريخ ويرجّع عدد الليالي
const getNights = (checkIn, checkOut, rejectPast = true) => {
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    if (isNaN(a) || isNaN(b)) {
        throw httpError(400, "Invalid date format. Use YYYY-MM-DD.");
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (rejectPast && a < today) {
        throw httpError(400, "Check-in date cannot be in the past!");
    }
    const nights = Math.round((b - a) / MS_PER_DAY);
    if (nights <= 0) {
        throw httpError(400, "Check-out date must be after check-in date!");
    }
    return nights;
};

// بيتحقق من عدد الضيوف والحيوانات وقاعدة MaxPets
const validateCounts = (guests, pets, accommodation) => {
    if (!Number.isInteger(guests) || guests < 1 || !Number.isInteger(pets) || pets < 1) {
        throw httpError(400, "GuestsCount and PetsCount must be whole numbers of at least 1!");
    }
    const maxPets = accommodation.Rules ? accommodation.Rules.MaxPets : null;
    if (maxPets != null && pets > maxPets) {
        throw httpError(400, `This accommodation allows a maximum of ${maxPets} pet(s).`);
    }
};

// معالج موحد للأخطاء: rollback ثم رد مناسب
const handleBookingError = async (error, res, t) => {
    if (t && !t.finished) {
        try { await t.rollback(); } catch (rbError) { console.error("Rollback error:", rbError); }
    }
    if (error.status) {
        return res.status(error.status).json({ message: error.message });
    }
    console.error("Booking Error:", error);
    return res.status(500).json({ message: "Internal server error" });
};


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

// 2. إنشاء حجز جديد (فحص التداخل جوه الـ transaction نفسها)
exports.createBooking = async (req, res) => {
    let t;
    try {
        const userId = req.user.UserID;
        const { AccommodationID, CheckInDate, CheckOutDate } = req.body;
        const guests = Number(req.body.GuestsCount);
        const pets = Number(req.body.PetsCount);

        if (!AccommodationID || !CheckInDate || !CheckOutDate) {
            throw httpError(400, "AccommodationID, CheckInDate and CheckOutDate are required!");
        }

        const nights = getNights(CheckInDate, CheckOutDate);

        const accommodation = await Accommodation.findByPk(AccommodationID, {
            include: [{ model: AccommodationRule, as: 'Rules' }]
        });
        if (!accommodation) {
            throw httpError(404, "Accommodation not found!");
        }
        if (accommodation.HostID === userId) {
            throw httpError(400, "You cannot book your own accommodation!");
        }

        validateCounts(guests, pets, accommodation);

        t = await serializableTx();

        const overlap = await findConfirmedOverlap(AccommodationID, CheckInDate, CheckOutDate, t);
        if (overlap) {
            throw httpError(409, "Selected dates are already booked. Please choose other dates!");
        }

        const totalPrice = Math.round(Number(accommodation.PricePerNight) * nights * 100) / 100;

        const newBooking = await Booking.create({
            AccommodationID,
            UserID: userId,
            CheckInDate,
            CheckOutDate,
            GuestsCount: guests,
            PetsCount: pets,
            TotalPrice: totalPrice,
            Status: 'pending'
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            message: "Booking created successfully!",
            data: newBooking
        });
    } catch (error) {
        await handleBookingError(error, res, t);
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
    let t;
    try {
        const { bookingId } = req.params;
        const userId = req.user.UserID;

        const booking = await Booking.findOne({ where: { BookingID: bookingId, UserID: userId } });
        if (!booking) {
            throw httpError(404, "Booking not found!");
        }
        if (booking.Status === 'cancelled' || booking.Status === 'completed') {
            throw httpError(400, "Cannot update a cancelled or completed booking!");
        }

        // القيم الجديدة لو اتبعتت، وإلا القيم الحالية
        const checkIn = req.body.CheckInDate ?? booking.CheckInDate;
        const checkOut = req.body.CheckOutDate ?? booking.CheckOutDate;
        const guests = req.body.GuestsCount !== undefined ? Number(req.body.GuestsCount) : booking.GuestsCount;
        const pets = req.body.PetsCount !== undefined ? Number(req.body.PetsCount) : booking.PetsCount;

        const datesChanged = toDay(checkIn) !== toDay(booking.CheckInDate) || toDay(checkOut) !== toDay(booking.CheckOutDate);

        // نرفض تاريخ الدخول في الماضي فقط لو المستخدم فعلاً غيّره
        const nights = getNights(checkIn, checkOut, datesChanged && req.body.CheckInDate !== undefined);

        const accommodation = await Accommodation.findByPk(booking.AccommodationID, {
            include: [{ model: AccommodationRule, as: 'Rules' }]
        });
        if (!accommodation) {
            throw httpError(404, "Accommodation not found!");
        }
        validateCounts(guests, pets, accommodation);

        t = await serializableTx();

        // فحص التداخل مع باقي الحجوزات المؤكدة (بدون حجزي أنا)
        const overlap = await findConfirmedOverlap(booking.AccommodationID, checkIn, checkOut, t, booking.BookingID);
        if (overlap) {
            throw httpError(409, "Selected dates are already booked. Please choose other dates!");
        }

        await booking.update({
            CheckInDate: checkIn,
            CheckOutDate: checkOut,
            GuestsCount: guests,
            PetsCount: pets,
            // السعر بيتحسب من جديد بس لو التواريخ اتغيرت، غير كده بيفضل زي ما اتفق عليه
            TotalPrice: datesChanged
                ? Math.round(Number(accommodation.PricePerNight) * nights * 100) / 100
                : booking.TotalPrice,
            // لو التواريخ اتغيرت يرجع pending عشان الأدمن يوافق من جديد
            Status: datesChanged ? 'pending' : booking.Status
        }, { transaction: t });

        await t.commit();

        res.status(200).json({ message: "Booking updated successfully!", data: booking });
    } catch (error) {
        await handleBookingError(error, res, t);
    }
};
// 5. الأدمن يحدّث حالة الحجز (بانتقالات مسموحة فقط + فحص تداخل عند التأكيد)
const ALLOWED_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    cancelled: [],
    completed: []
};

// === Admin Controllers ===


exports.adminUpdateBookingStatus = async (req, res) => {
    let t;
    try {
        const { bookingId } = req.params;
        const { Status } = req.body;

        if (!Object.keys(ALLOWED_TRANSITIONS).includes(Status)) {
            throw httpError(400, "Invalid status value!");
        }

        t = await serializableTx();

        const booking = await Booking.findByPk(bookingId, { transaction: t });
        if (!booking) {
            throw httpError(404, "Booking not found!");
        }

        const allowed = ALLOWED_TRANSITIONS[booking.Status] || [];
        if (!allowed.includes(Status)) {
            throw httpError(400, `Cannot change booking status from '${booking.Status}' to '${Status}'.`);
        }

        // عند التأكيد: لازم مفيش حجز مؤكد تاني بيتداخل
        if (Status === 'confirmed') {
            const overlap = await findConfirmedOverlap(
                booking.AccommodationID, booking.CheckInDate, booking.CheckOutDate, t, booking.BookingID
            );
            if (overlap) {
                throw httpError(409, "Cannot confirm: these dates overlap with another confirmed booking!");
            }
        }

        await booking.update({ Status }, { transaction: t });
        await t.commit();

        res.status(200).json({ message: "Booking status updated successfully!", data: booking });
    } catch (error) {
        await handleBookingError(error, res, t);
    }
};




// 6. الأدمن يعرض كل الحجوزات
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


// 6.1 الأدمن يعرض تفاصيل حجز واحد
exports.adminGetBookingById = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.bookingId, {
            include: [
                { model: Accommodation, as: 'Accommodation' },
                { model: User, as: 'User', attributes: ['UserID', 'FullName', 'Email', 'Phone'] }
            ]
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found!" });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6.2 الأدمن يعدّل تفاصيل أي حجز (تواريخ / عدد الضيوف / الحيوانات / السعر)
// الحالة (Status) بتتغير من endpoint منفصل: adminUpdateBookingStatus
exports.adminUpdateBooking = async (req, res) => {
    let t;
    try {
        const { bookingId } = req.params;
        const body = req.body || {};

        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            throw httpError(404, "Booking not found!");
        }
        if (booking.Status === 'cancelled' || booking.Status === 'completed') {
            throw httpError(400, "Cannot edit a cancelled or completed booking!");
        }

        const checkIn = body.CheckInDate ?? booking.CheckInDate;
        const checkOut = body.CheckOutDate ?? booking.CheckOutDate;
        const guests = body.GuestsCount !== undefined ? Number(body.GuestsCount) : booking.GuestsCount;
        const pets = body.PetsCount !== undefined ? Number(body.PetsCount) : booking.PetsCount;

        // الأدمن مسموح له بتواريخ في الماضي (تصحيح بيانات)
        const nights = getNights(checkIn, checkOut, false);

        const accommodation = await Accommodation.findByPk(booking.AccommodationID, {
            include: [{ model: AccommodationRule, as: 'Rules' }]
        });
        if (!accommodation) {
            throw httpError(404, "Accommodation not found!");
        }
        validateCounts(guests, pets, accommodation);

        const datesChanged = toDay(checkIn) !== toDay(booking.CheckInDate) || toDay(checkOut) !== toDay(booking.CheckOutDate);

        // السعر: لو الأدمن بعته يدوي ناخده، لو التواريخ اتغيرت نعيد الحساب، غير كده نسيبه زي ما هو
        let totalPrice = Number(booking.TotalPrice);
        if (body.TotalPrice !== undefined && body.TotalPrice !== null && body.TotalPrice !== '') {
            const manual = Number(body.TotalPrice);
            if (!Number.isFinite(manual) || manual < 0) {
                throw httpError(400, "TotalPrice must be a number of 0 or more!");
            }
            totalPrice = Math.round(manual * 100) / 100;
        } else if (datesChanged) {
            totalPrice = Math.round(Number(accommodation.PricePerNight) * nights * 100) / 100;
        }

        t = await serializableTx();

        // لو الحجز مؤكد وغيّرنا التواريخ لازم مفيش تداخل مع حجز مؤكد تاني
        if (booking.Status === 'confirmed' && datesChanged) {
            const overlap = await findConfirmedOverlap(
                booking.AccommodationID, checkIn, checkOut, t, booking.BookingID
            );
            if (overlap) {
                throw httpError(409, "Selected dates overlap with another confirmed booking!");
            }
        }

        await booking.update({
            CheckInDate: checkIn,
            CheckOutDate: checkOut,
            GuestsCount: guests,
            PetsCount: pets,
            TotalPrice: totalPrice
        }, { transaction: t });

        await t.commit();

        res.status(200).json({ message: "Booking updated successfully by admin!", data: booking });
    } catch (error) {
        await handleBookingError(error, res, t);
    }
};


// 7. إلغاء الحجز (Cancel Booking) - مسموح بس لـ pending و confirmed
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

        // نفس جدول الانتقالات بتاع الأدمن: completed مينفعش يتلغي
        if (!(ALLOWED_TRANSITIONS[booking.Status] || []).includes('cancelled')) {
            return res.status(400).json({ message: `Cannot cancel a booking that is '${booking.Status}'.` });
        }

        // تحديث بشرط على الحالة الحالية عشان لو الأدمن غيّرها في نفس اللحظة ما نكتبش فوقها
        const [changed] = await Booking.update(
            { Status: 'cancelled' },
            { where: { BookingID: bookingId, UserID: userId, Status: { [Op.in]: ['pending', 'confirmed'] } } }
        );
        if (changed === 0) {
            return res.status(409).json({ message: "Booking status changed. Please refresh and try again." });
        }

        res.status(200).json({ message: "Booking cancelled successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
