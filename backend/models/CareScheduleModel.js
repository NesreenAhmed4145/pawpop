const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CareSchedule = sequelize.define('CareSchedule', {
    CareID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    PetID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    TaskName: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    ScheduleDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    IsCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'CareSchedules',
    timestamps: false
});

module.exports = CareSchedule;