const { Accommodation, AccommodationRule, Amenity } = require('../models');
const { Op } = require('sequelize');

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

// 3. إضافة مكان إقامة جديد (للأدمن فقط)
exports.createAccommodation = async (req, res) => {
    try {
        const adminId = req.user.UserID;
        const {
            Title, Description, Type, Location, DistanceKm,
            PricePerNight, ImageURL, MaxPets, AcceptedPetTypes,
            AllowedSize, RequiresVaccination, AdditionalRulesText, AmenityIDs
        } = req.body;

        const newAccommodation = await Accommodation.create({
            HostID: adminId,
            Title, Description, Type, Location, DistanceKm,
            PricePerNight, ImageURL
        });

        await AccommodationRule.create({
            AccommodationID: newAccommodation.AccommodationID,
            MaxPets: MaxPets || 1,
            AcceptedPetTypes,
            AllowedSize,
            RequiresVaccination: RequiresVaccination || false,
            AdditionalRulesText
        });

        if (AmenityIDs && Array.isArray(AmenityIDs) && AmenityIDs.length > 0) {
            await newAccommodation.addAmenities(AmenityIDs);
        }

        const createdAccommodation = await Accommodation.findByPk(newAccommodation.AccommodationID, {
            include: [
                { model: AccommodationRule, as: 'Rules' },
                { model: Amenity, as: 'Amenities', through: { attributes: [] } }
            ]
        });

        res.status(201).json({
            message: "Accommodation created successfully by admin!",
            data: createdAccommodation
        });
    } catch (error) {
        console.error("Error creating accommodation:", error);
        res.status(500).json({ error: error.message });
    }
};

// 4. تعديل بيانات مكان إقامة (للأدمن فقط)
exports.updateAccommodation = async (req, res) => {
    try {
        const { accommodationId } = req.params;
        const {
            Title, Description, Type, Location, DistanceKm,
            PricePerNight, ImageURL, MaxPets, AcceptedPetTypes,
            AllowedSize, RequiresVaccination, AdditionalRulesText, AmenityIDs
        } = req.body;

        const accommodation = await Accommodation.findByPk(accommodationId);
        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found!" });
        }

        // تحديث البيانات الأساسية
        await accommodation.update({
            Title: Title || accommodation.Title,
            Description: Description || accommodation.Description,
            Type: Type || accommodation.Type,
            Location: Location || accommodation.Location,
            DistanceKm: DistanceKm !== undefined ? DistanceKm : accommodation.DistanceKm,
            PricePerNight: PricePerNight || accommodation.PricePerNight,
            ImageURL: ImageURL || accommodation.ImageURL
        });

        // تحديث القواعد (Rules) إذا وجدت
        const rule = await AccommodationRule.findOne({ where: { AccommodationID: accommodationId } });
        if (rule) {
            await rule.update({
                MaxPets: MaxPets !== undefined ? MaxPets : rule.MaxPets,
                AcceptedPetTypes: AcceptedPetTypes || rule.AcceptedPetTypes,
                AllowedSize: AllowedSize || rule.AllowedSize,
                RequiresVaccination: RequiresVaccination !== undefined ? RequiresVaccination : rule.RequiresVaccination,
                AdditionalRulesText: AdditionalRulesText || rule.AdditionalRulesText
            });
        }

        // تحديث المميزات (Amenities) إذا تم إرسالها
        if (AmenityIDs && Array.isArray(AmenityIDs)) {
            await accommodation.setAmenities(AmenityIDs);
        }

        const updatedAccommodation = await Accommodation.findByPk(accommodationId, {
            include: [
                { model: AccommodationRule, as: 'Rules' },
                { model: Amenity, as: 'Amenities', through: { attributes: [] } }
            ]
        });

        res.status(200).json({
            message: "Accommodation updated successfully!",
            data: updatedAccommodation
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. حذف مكان إقامة (للأدمن فقط)
exports.deleteAccommodation = async (req, res) => {
    try {
        const { accommodationId } = req.params;

        const accommodation = await Accommodation.findByPk(accommodationId);
        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found!" });
        }

        await accommodation.destroy();

        res.status(200).json({
            message: "Accommodation removed successfully by admin!"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};