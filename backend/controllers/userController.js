const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');

const removeFromUploads = (imageUrl) => {
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(imageUrl));
    fs.unlink(filePath, () => {}); 
};


    exports.register = async (req, res) => {
    try {
        const { FullName, Email, Password, Phone, ProfileImageURL } = req.body;

        const existingUser = await User.findOne({ where: { Email } });
        if (existingUser) {
            return res.status(400).json({ status: 'Error', message: 'Email already exists!' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Password, saltRounds);

        const newUser = await User.create({
            FullName,
            Email,
            Password: hashedPassword,  
            Phone,
            ProfileImageURL
        });

        res.status(201).json({ 
            status: 'Success', 
            message: 'User registered successfully!',
            data: { UserID: newUser.UserID, Email: newUser.Email }
        });

    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
};



exports.login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        const user = await User.findOne({ where: { Email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) {
            return res.status(400).json({ message: `Invalid credentials` });
        }

const token = jwt.sign(
    { 
        UserID: user.UserID, 
        Email: user.Email, 
        Role: user.Role.charAt(0).toUpperCase() + user.Role.slice(1).toLowerCase() 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
);

        res.status(200).json({
            message: "Login successful",
            token: token,
            data: {
                UserID: user.UserID,
                Email: user.Email,
                FullName: user.FullName,
                Phone: user.Phone,
                ProfileImageURL: user.ProfileImageURL,
                CreatedAt: user.CreatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateProfile = async (req, res) => {
    const discardUploadedFile = () => {
        if (req.file) removeFromUploads(`/uploads/${req.file.filename}`);
    };

    try {
        const userId = req.user.UserID;
        const { FullName, Phone } = req.body || {};

        const user = await User.findByPk(userId);
        if (!user) {
            discardUploadedFile();
            return res.status(404).json({ message: "User not found!" });
        }

        if (FullName !== undefined) {
            const name = String(FullName).trim();
            if (!name || name.length > 100) {
                discardUploadedFile();
                return res.status(400).json({ message: "FullName is required (max 100 characters)!" });
            }
            user.FullName = name;
        }

        if (Phone !== undefined) {
            if (Phone !== null && String(Phone).length > 20) {
                discardUploadedFile();
                return res.status(400).json({ message: "Phone must be at most 20 characters!" });
            }
            user.Phone = Phone;
        }

        let oldImageUrl = null;
        if (req.file) {
            oldImageUrl = user.ProfileImageURL;
            user.ProfileImageURL = `/uploads/${req.file.filename}`;
        }

        await user.save();
        if (oldImageUrl) removeFromUploads(oldImageUrl);

        res.status(200).json({
            message: "Profile updated successfully!",
            data: {
                UserID: user.UserID,
                FullName: user.FullName,
                Email: user.Email,
                Phone: user.Phone,
                ProfileImageURL: user.ProfileImageURL,
                Role: user.Role
            }
        });
    } catch (error) {
        discardUploadedFile();
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Failed to update profile." });
    }
};


exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.UserID;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['Password'] } 
        });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({
            status: "Success",
            data: {
                UserID: user.UserID,
                FullName: user.FullName,
                Email: user.Email,
                Phone: user.Phone,
                ProfileImageURL: user.ProfileImageURL,
                Role: user.Role,
                CreatedAt: user.CreatedAt 
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};