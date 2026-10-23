const { sequelize } = require('../config/db');

// استدعاء النماذج الأساسية فقط
const User = require('./userModel');
const Accommodation = require('./accommodationModel');
const AccommodationRule = require('./accommodationRuleModel');
const Amenity = require('./amenityModel');
const Booking = require('./bookingModel');

// --- تعريف العلاقات ---

// User & Accommodations (Host)
User.hasMany(Accommodation, { foreignKey: 'HostID', as: 'HostedAccommodations' });
Accommodation.belongsTo(User, { foreignKey: 'HostID', as: 'Host' });

// Accommodation & Rules (One-to-One)
Accommodation.hasOne(AccommodationRule, { foreignKey: 'AccommodationID', as: 'Rules' });
AccommodationRule.belongsTo(Accommodation, { foreignKey: 'AccommodationID', as: 'Accommodation' });

// Accommodation & Amenities (Many-to-Many - استخدام اسم الجدول مباشرة)
Accommodation.belongsToMany(Amenity, { 
    through: 'AccommodationAmenities', 
    foreignKey: 'AccommodationID', 
    as: 'Amenities',
    timestamps: false 
});
Amenity.belongsToMany(Accommodation, { 
    through: 'AccommodationAmenities', 
    foreignKey: 'AmenityID', 
    as: 'Accommodations',
    timestamps: false 
});

// Accommodation & Bookings
Accommodation.hasMany(Booking, { foreignKey: 'AccommodationID', as: 'Bookings' });
Booking.belongsTo(Accommodation, { foreignKey: 'AccommodationID', as: 'Accommodation' });

// User & Bookings (Guest)
User.hasMany(Booking, { foreignKey: 'UserID', as: 'UserBookings' });
Booking.belongsTo(User, { foreignKey: 'UserID', as: 'User' });

module.exports = {
    sequelize,
    User,
    Accommodation,
    AccommodationRule,
    Amenity,
    Booking
};