const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Accommodation = sequelize.define('Accommodation', {
    AccommodationID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    HostID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Title: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Location: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    DistanceKm: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    PricePerNight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    Rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0
    },
    ReviewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ImageURL: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'Accommodations',
    timestamps: false
});



module.exports = Accommodation;