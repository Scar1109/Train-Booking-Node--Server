const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountCreated: {
        type: Date,
        default: Date.now,
    },
    numBookings: {
        type: Number,
        default: 0, // Number of bookings made by the user
    },
    totalTicketsBought: {
        type: Number,
        default: 0, // Total tickets purchased by the user
    },
    lastBookingDate: {
        type: Date,
    },
    isFlaggedForFraud: {
        type: Boolean,
        default: false, // Indicates if the user has been flagged for fraud
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
