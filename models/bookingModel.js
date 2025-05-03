const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true,
    },
    numTickets: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    bookingTime: {
        type: Date,
        default: Date.now,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    isRefunded: {
        type: Boolean,
        default: false,
    },
    price: {
        type: Number,
        required: true,
    },
    isFlaggedAsSuspicious: {
        type: Boolean,
        default: false,
    },
    passengers: [
        {
            title: { type: String, required: true },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            idType: { type: String, required: true },
            idNumber: { type: String, required: true },
            gender: { type: String, required: true },
            age: { type: String },
            seatPreference: { type: String },
            mealPreference: { type: String },
            seatNumber: { type: String },
        },
    ],
    trainDetails: {
        trainId: { type: String, required: true },
        trainName: { type: String, required: true },
        trainNumber: { type: String, required: true },
        class: { type: String, required: true },
        departureStation: { type: String, required: true },
        arrivalStation: { type: String, required: true },
        departureDate: { type: String, required: true },
        departureTime: { type: String, required: true },
        arrivalTime: { type: String, required: true },
    },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;