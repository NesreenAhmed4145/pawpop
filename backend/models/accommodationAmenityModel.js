const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AccommodationAmenity = sequelize.define('AccommodationAmenity', {
    AccommodationID: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    AmenityID: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'AccommodationAmenities',
    timestamps: false
});

module.exports = AccommodationAmenity;