const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    UserID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'UserID'
    },
    FullName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    Password: {
       type: DataTypes.STRING(255),
        allowNull: false
    },
    Phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    ProfileImageURL: {
        type: DataTypes.STRING(500),
        allowNull: true
    },

    Role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'User'
},
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Users', // اسم الجدول الحقيقي في قاعدة البيانات
    timestamps: false   // لأن الجدول بيعتمد على CreatedAt اللي أنشاتيه بنفسك ومش محتاجين أعمدة التحديث التلقائي updatedAt
});

module.exports = User;