const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// @route POST /api/auth/register
router.post("/register", async (req, res, next) => {
    const { fName, lName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 400;
            return next(error);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fname: fName,
            lname: lName,
            email,
            password: hashedPassword,
            isVerified: true, // optional: default verified
        });

        await newUser.save();

        // Generate a JWT token
        const payload = { user: { id: newUser._id } };
        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: "1h",
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                fname: newUser.fname,
                lname: newUser.lname,
                email: newUser.email,
                token,
            },
        });
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("Invalid credentials");
            error.statusCode = 400;
            return next(error);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error("Invalid credentials");
            error.statusCode = 400;
            return next(error);
        }
        
        // Generate a JWT token
        const payload = { user: { id: user._id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ success: true, token });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
