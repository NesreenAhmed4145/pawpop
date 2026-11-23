const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
    BookingID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    AccommodationID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    UserID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    CheckInDate: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },
    CheckOutDate: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },
    GuestsCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    PetsCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    TotalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    Status: {
        type: DataTypes.STRING(50),
        defaultValue: 'pending'
    }
}, {
    tableName: 'Bookings',
    timestamps: false 
});

module.exports = Booking;