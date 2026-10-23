const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_SERVER,
        dialect: 'mssql',
        logging: false, 
        dialectOptions: {
            options: {
                encrypt: true,
                trustServerCertificate: true
            }
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to SQL Server successfully using Sequelize!');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        throw err;
    }
};

module.exports = { sequelize, connectDB };