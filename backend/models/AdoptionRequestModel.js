const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Pet = require('../models/petModel')
const User = require('../models/userModel'); 
const AdoptionRequest = sequelize.define('AdoptionRequest', {
    RequestID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    PetID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    RequesterID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    RequestDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    Status: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pending' // القيم المعتادة: Pending, Approved, Rejected
    },
    Notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'AdoptionRequests',
    timestamps: false
});

Pet.hasMany(AdoptionRequest, { foreignKey: 'PetID', as: 'AdoptionRequests' });
AdoptionRequest.belongsTo(Pet, { foreignKey: 'PetID', as: 'Pet' });
User.hasMany(AdoptionRequest, { foreignKey: 'RequesterID', as: 'AdoptionRequests' });
AdoptionRequest.belongsTo(User, { foreignKey: 'RequesterID', as: 'User' });

module.exports = AdoptionRequest;