const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Appointment = sequelize.define('Appointment', {
    AppointmentID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    PetID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    UserID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    AppointmentDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    AppointmentType: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Status: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    Notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'Appointments',
    timestamps: false
});

module.exports = Appointment;