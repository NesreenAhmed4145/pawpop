const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Vaccination = sequelize.define('Vaccination', {
    VaccinationID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    PetID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    VaccineName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    VaccinationDate: { 
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    NextDueDate: { 
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    Notes: { 
        type: DataTypes.TEXT,
        allowNull: true
    },
    Status: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'Vaccinations',
    timestamps: false
});

module.exports = Vaccination;