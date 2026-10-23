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
    VaccinationDate: { // ضفناه لأنه موجود في الداتا بيز عندك
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    NextDueDate: { // عدلناه من DueDate لـ NextDueDate زي ما هو في SQL Server
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    Notes: { // ضفناه لأنه موجود في الداتا بيز عندك
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