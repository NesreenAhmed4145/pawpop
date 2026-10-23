const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./userModel'); 
const Vaccination = require('./VaccinationModel');
const CareSchedule = require('./CareScheduleModel');
const Appointment = require('./AppointmentModel');

// 1. تعريف الـ Model أولاً
const Pet = sequelize.define('Pet', {
    PetID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'PetID'
    },
    Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Species: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Breed: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Gender: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    BirthDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    IsNeutered: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    Weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    ImageURL: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'UserID'
        }
    },
    IsForAdoption: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    Status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'Available'
    },
    // --- الحقول الجديدة المضافة لتطابق الواجهات ---
    Color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Location: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    VetName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    GoodWithDogs: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    GoodWithChildren: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    GoodWithApartments: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // -------------------------------------------
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Pets',
    timestamps: false
});

// 2. كتابة العلاقات بعد تعريف الـ Model مباشرة
User.hasMany(Pet, { foreignKey: 'UserID' });
Pet.belongsTo(User, { foreignKey: 'UserID' });

Pet.hasMany(Vaccination, { foreignKey: 'PetID', as: 'Vaccinations' });
Vaccination.belongsTo(Pet, { foreignKey: 'PetID' });

Pet.hasMany(CareSchedule, { foreignKey: 'PetID', as: 'CareSchedules' });
CareSchedule.belongsTo(Pet, { foreignKey: 'PetID' });

Pet.hasMany(Appointment, { foreignKey: 'PetID', as: 'Appointments' });
Appointment.belongsTo(Pet, { foreignKey: 'PetID' });

module.exports = Pet;