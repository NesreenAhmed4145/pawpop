const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AccommodationRule = sequelize.define('AccommodationRule', {
    RuleID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    AccommodationID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    MaxPets: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    AcceptedPetTypes: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    AllowedSize: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    RequiresVaccination: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    AdditionalRulesText: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'AccommodationRules',
    timestamps: false
});

module.exports = AccommodationRule;