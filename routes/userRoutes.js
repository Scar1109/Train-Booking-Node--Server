const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


router.get("/getAllUsers", async (req, res) => {
    try {
        const users = await User.find();
        res.send({ success: true, users });
    } catch (error) {
        res.status(500).send({ success: false, message: "Server error" });
    }
});

// Add new user
router.post("/createUser", async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.send({ success: true, user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Server error" });
    }
});

// Update existing user
router.put("/updateUser/:id", async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send({ success: true, user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Server error" });
    }
});

// Delete a user by ID
router.delete("/deleteUser/:id", async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).send({ success: false, message: "User not found" });
        }
        res.send({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Server error" });
    }
});



module.exports = router;
