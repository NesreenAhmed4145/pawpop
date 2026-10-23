const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db.js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// استدعاء ملف الـ Routes الخاص بالمستخدمين
const userRoutes = require('./routes/userRoutes.js');
const petRoutes = require('./routes/petRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adoptionRoutes = require('./routes/adoptionRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes'); 
const bookingRoutes = require('./routes/bookingRoutes');



app.use('/api/users', userRoutes); 
app.use('/api/pets', petRoutes);
app.use('/api/pets', vaccinationRoutes);
app.use('/api/pets', appointmentRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/bookings', bookingRoutes);
// الاتصال بقاعدة البيانات ثم تشغيل السيرفر


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});