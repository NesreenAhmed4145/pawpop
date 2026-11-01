const { Accommodation, AccommodationRule, Amenity, Booking, sequelize } = require('../models');
const { Op } = require('sequelize');


const removeFromUploads = (imageUrl) => {
    if (!imageUrl || !String(imageUrl).startsWith('/uploads/')) return;
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(imageUrl));
    fs.unlink(filePath, () => {}); // لو الملف مش موجود نتجاهل الخطأ
};

// multipart/form-data بيبعت كل القيم كنصوص، فبنحوّلها:
const toBool = (v) => v === true || v === 'true' || v === '1' || v === 1;
const toNumberOrNull = (v) => (v === undefined || v === null || v === '' ? null : Number(v));

// AmenityIDs ممكن تيجي Array (JSON عادي) أو نص JSON (من FormData) أو مش مبعوتة
// بترجّع: undefined (مش مبعوتة) أو Array أرقام
const parseAmenityIds = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    let list = value;
    if (typeof value === 'string') {
        try {
            list = JSON.parse(value);
        } catch {
            return [NaN]; // نص مش JSON: هيتعامل كخطأ في الـ validation
        }
    }
    return Array.isArray(list) ? list.map(Number) : [NaN];
};

const includeDetails = [
    { model: AccommodationRule, as: 'Rules' },
    { model: Amenity, as: 'Amenities', through: { attributes: [] } }
];


// 1. استعراض الفنادق والأماكن مع الفلاتر (Location, Price, Facilities, Type)
exports.getAllAccommodations = async (req, res) => {
    try {
        const { location, minPrice, maxPrice, facilities, type, minRating } = req.query;
        let whereClause = {};

        // فلترة حسب الموقع (Location)
        if (location && location !== 'Anywhere') {
            whereClause.Location = { [Op.like]: `%${location}%` };
        }

        // فلترة حسب السعر (Price per night)
        if (minPrice || maxPrice) {
            whereClause.PricePerNight = {};
            if (minPrice) whereClause.PricePerNight[Op.gte] = Number(minPrice);
            if (maxPrice) whereClause.PricePerNight[Op.lte] = Number(maxPrice);
        }

        // فلترة حسب نوع المكان (Hotel, Villa, Apartment...)
        if (type) {
            whereClause.Type = type;
        }

        // فلترة حسب التقييم الأدنى
        if (minRating) {
            whereClause.Rating = { [Op.gte] : Number(minRating) };
        }

        let includeOptions = [
            { model: AccommodationRule, as: 'Rules' },
            { 
                model: Amenity, 
                as: 'Amenities',
                through: { attributes: [] } 
            }
        ];

        // فلترة حسب المرافق أو المميزات (Facilities/Amenities) مثل Pet beds, Garden
        if (facilities) {
            const facilityList = facilities.split(',').map(f => f.trim());
            includeOptions[1].where = { Name: { [Op.in]: facilityList } };
        }

        const accommodations = await Accommodation.findAll({
            where: whereClause,
            include: includeOptions
        });

        res.status(200).json({
            success: true,
            count: accommodations.length,
            data: accommodations
        });
    } catch (error) {
        console.error("Error fetching accommodations:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2. جلب تفاصيل مكان إقامة واحد
exports.getAccommodationById = async (req, res) => {
    try {
        const { accommodationId } = req.params;

        const accommodation = await Accommodation.findByPk(accommodationId, {
            include: [
                { model: AccommodationRule, as: 'Rules' },
                { model: Amenity, as: 'Amenities', through: { attributes: [] } }
            ]
        });

        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found!" });
        }

        res.status(200).json({
            success: true,
            data: accommodation
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================================
// Helpers (للأدمن: تنظيف وفحص البيانات)
// ============================================================
const httpError = (status, message) => Object.assign(new Error(message), { status });

const fullInclude = () => [
    { model: AccommodationRule, as: 'Rules' },
    { model: Amenity, as: 'Amenities', through: { attributes: [] } }
];

const isEmpty = (v) => v === undefined || v === null || v === '';

// نص إجباري: لازم يكون موجود وما يعديش الحد الأقصى
const requiredText = (v, field, max) => {
    const s = isEmpty(v) ? '' : String(v).trim();
    if (!s) throw httpError(400, `${field} is required!`);
    if (s.length > max) throw httpError(400, `${field} must be at most ${max} characters!`);
    return s;
};

// نص اختياري: الفاضي بيتحول null
const optionalText = (v, field, max) => {
    if (isEmpty(v)) return null;
    const s = String(v).trim();
    if (!s) return null;
    if (max && s.length > max) throw httpError(400, `${field} must be at most ${max} characters!`);
    return s;
};

const parsePrice = (v) => {
    const n = Number(v);
    if (isEmpty(v) || !Number.isFinite(n) || n <= 0) {
        throw httpError(400, "PricePerNight must be a number greater than 0!");
    }
    return Math.round(n * 100) / 100;
};

const parseDistance = (v) => {
    if (isEmpty(v)) return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 999.99) {
        throw httpError(400, "DistanceKm must be a number between 0 and 999.99!");
    }
    return n;
};

const parseMaxPets = (v) => {
    const n = Number(v);
    if (isEmpty(v) || !Number.isInteger(n) || n < 1) {
        throw httpError(400, "MaxPets must be a whole number of at least 1!");
    }
    return n;
};

const parseBool = (v) => v === true || v === 'true' || v === 1 || v === '1';



const handleError = async (error, res, t, label) => {
    if (t && !t.finished) {
        try { await t.rollback(); } catch (rbError) { console.error("Rollback error:", rbError); }
    }
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error(label, error);
    return res.status(500).json({ message: "Internal server error" });
};


// 3. إضافة مكان إقامة جديد (للأدمن فقط)

exports.createAccommodation = async (req, res) => {
    // لو في أي خطأ بعد رفع الصورة بنمسحها عشان ما تفضلش ملفات يتيمة
    const discardUpload = () => {
        if (req.file) removeFromUploads(`/uploads/${req.file.filename}`);
    };
    let t;
    try {
        const adminId = req.user.UserID;
        const b = req.body || {};

        const title = String(b.Title || '').trim();
        const type = String(b.Type || '').trim();
        const location = String(b.Location || '').trim();
        const price = Number(b.PricePerNight);
        const distance = toNumberOrNull(b.DistanceKm);
        const maxPets = b.MaxPets === undefined || b.MaxPets === '' ? 1 : Number(b.MaxPets);
        const amenityIds = parseAmenityIds(b.AmenityIDs) || [];

        if (!title || !type || !location || !(price > 0)) {
            discardUpload();
            return res.status(400).json({
                message: "Title, Type, Location and a PricePerNight greater than 0 are required!"
            });
        }
        if (title.length > 150 || type.length > 50 || location.length > 100) {
            discardUpload();
            return res.status(400).json({ message: "Title, Type or Location is too long!" });
        }
        if (distance !== null && !(distance >= 0)) {
            discardUpload();
            return res.status(400).json({ message: "DistanceKm must be 0 or more!" });
        }
        if (!Number.isInteger(maxPets) || maxPets < 1) {
            discardUpload();
            return res.status(400).json({ message: "MaxPets must be a whole number of at least 1!" });
        }
        if (amenityIds.some((id) => !Number.isInteger(id))) {
            discardUpload();
            return res.status(400).json({ message: "AmenityIDs must be a list of numbers!" });
        }

        // الصورة: ملف مرفوع (الأساسي)، أو ImageURL كنص لو اتبعت JSON بالطريقة القديمة
        const imageUrl = req.file
            ? `/uploads/${req.file.filename}`
            : (typeof b.ImageURL === 'string' && b.ImageURL.trim() ? b.ImageURL.trim() : null);

        // المكان + القواعد + المرافق: يا كلهم ينجحوا يا مفيش حاجة تتحفظ
        t = await sequelize.transaction();

        const newAccommodation = await Accommodation.create({
            HostID: adminId,
            Title: title,
            Description: b.Description,
            Type: type,
            Location: location,
            DistanceKm: distance,
            PricePerNight: price,
            ImageURL: imageUrl
        }, { transaction: t });

        await AccommodationRule.create({
            AccommodationID: newAccommodation.AccommodationID,
            MaxPets: maxPets,
            AcceptedPetTypes: b.AcceptedPetTypes,
            AllowedSize: b.AllowedSize,
            RequiresVaccination: toBool(b.RequiresVaccination),
            AdditionalRulesText: b.AdditionalRulesText
        }, { transaction: t });

        if (amenityIds.length > 0) {
            await newAccommodation.addAmenities(amenityIds, { transaction: t });
        }

        await t.commit();

        const created = await Accommodation.findByPk(newAccommodation.AccommodationID, { include: includeDetails });

        res.status(201).json({
            message: "Accommodation created successfully by admin!",
            data: created
        });
    } catch (error) {
        discardUpload();
        if (t && !t.finished) {
            try { await t.rollback(); } catch (rbError) { console.error("Rollback error:", rbError); }
        }
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: "One or more AmenityIDs do not exist!" });
        }
        console.error("Error creating accommodation:", error);
        res.status(500).json({ message: "Failed to create accommodation." });
    }
};


// 4. تعديل بيانات مكان إقامة (للأدمن فقط) - بيعدّل بس اللي اتبعت
exports.updateAccommodation = async (req, res) => {
    let t;
    try {
        const { accommodationId } = req.params;
        const b = req.body || {};

        const accommodation = await Accommodation.findByPk(accommodationId);
        if (!accommodation) throw httpError(404, "Accommodation not found!");

        const updates = {};
        if (b.Title !== undefined) updates.Title = requiredText(b.Title, 'Title', 150);
        if (b.Description !== undefined) updates.Description = optionalText(b.Description);
        if (b.Type !== undefined) updates.Type = requiredText(b.Type, 'Type', 50);
        if (b.Location !== undefined) updates.Location = requiredText(b.Location, 'Location', 100);
        if (b.DistanceKm !== undefined) updates.DistanceKm = parseDistance(b.DistanceKm);
        if (b.PricePerNight !== undefined) updates.PricePerNight = parsePrice(b.PricePerNight);
        if (b.ImageURL !== undefined) updates.ImageURL = optionalText(b.ImageURL, 'ImageURL', 255);

        const ruleUpdates = {};
        if (b.MaxPets !== undefined) ruleUpdates.MaxPets = parseMaxPets(b.MaxPets);
        if (b.AcceptedPetTypes !== undefined) ruleUpdates.AcceptedPetTypes = optionalText(b.AcceptedPetTypes, 'AcceptedPetTypes', 100);
        if (b.AllowedSize !== undefined) ruleUpdates.AllowedSize = optionalText(b.AllowedSize, 'AllowedSize', 50);
        if (b.RequiresVaccination !== undefined) ruleUpdates.RequiresVaccination = parseBool(b.RequiresVaccination);
        if (b.AdditionalRulesText !== undefined) ruleUpdates.AdditionalRulesText = optionalText(b.AdditionalRulesText);

        t = await sequelize.transaction();

        if (Object.keys(updates).length) {
            await accommodation.update(updates, { transaction: t });
        }

        if (Object.keys(ruleUpdates).length) {
            const rule = await AccommodationRule.findOne({
                where: { AccommodationID: accommodationId },
                transaction: t
            });
            if (rule) {
                await rule.update(ruleUpdates, { transaction: t });
            } else {
                await AccommodationRule.create(
                    { AccommodationID: accommodation.AccommodationID, ...ruleUpdates },
                    { transaction: t }
                );
            }
        }

        if (b.AmenityIDs !== undefined) {
            const ids = await parseAmenityIds(b.AmenityIDs, t);
            await accommodation.setAmenities(ids, { transaction: t });
        }

        await t.commit();

        const updated = await Accommodation.findByPk(accommodationId, { include: fullInclude() });

        res.status(200).json({
            message: "Accommodation updated successfully!",
            data: updated
        });
    } catch (error) {
        await handleError(error, res, t, "Error updating accommodation:");
    }
};

// 5. حذف مكان إقامة (للأدمن فقط) - ممنوع لو عليه حجوزات
exports.deleteAccommodation = async (req, res) => {
    let t;
    try {
        const { accommodationId } = req.params;

        const accommodation = await Accommodation.findByPk(accommodationId);
        if (!accommodation) throw httpError(404, "Accommodation not found!");

        const bookingsCount = await Booking.count({ where: { AccommodationID: accommodationId } });
        if (bookingsCount > 0) {
            throw httpError(
                409,
                `Cannot delete: this accommodation has ${bookingsCount} booking(s). Bookings history must be kept.`
            );
        }

        t = await sequelize.transaction();
        await accommodation.setAmenities([], { transaction: t });
        await AccommodationRule.destroy({ where: { AccommodationID: accommodationId }, transaction: t });
        await accommodation.destroy({ transaction: t });
        await t.commit();

        res.status(200).json({ message: "Accommodation removed successfully by admin!" });
    } catch (error) {
        await handleError(error, res, t, "Error deleting accommodation:");
    }
};

// 6. جلب كل المرافق (Amenities) - بتتستخدم في فورم الأدمن
exports.getAmenities = async (req, res) => {
    try {
        const amenities = await Amenity.findAll({ order: [['Name', 'ASC']] });
        res.status(200).json({ success: true, count: amenities.length, data: amenities });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. إضافة مرفق جديد (للأدمن فقط)
exports.createAmenity = async (req, res) => {
    try {
        const Name = requiredText((req.body || {}).Name, 'Name', 50);

        const existing = await Amenity.findOne({ where: { Name } });
        if (existing) throw httpError(409, "This amenity already exists!");

        const amenity = await Amenity.create({ Name });
        res.status(201).json({ message: "Amenity created successfully!", data: amenity });
    } catch (error) {
        await handleError(error, res, null, "Error creating amenity:");
    }
};
