const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Amenity = sequelize.define('Amenity', {
    AmenityID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'Amenities',
    timestamps: false
});

module.exports = Amenity;