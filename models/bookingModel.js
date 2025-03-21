const mongoose = require("mongoose");

// Define the booking schema
const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // Link each booking to a user
    },
    ticketId: {
        type: String,
        required: true,
        unique: true, // Unique ticket ID for each booking
    },
    numTickets: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true, // Payment method (e.g., credit_card, debit_card, PayPal)
    },
    bookingTime: {
        type: Date,
        default: Date.now, // Timestamp of the booking
    },
    ipAddress: {
        type: String,
        required: true, // IP address from where the booking was made
    },
    isRefunded: {
        type: Boolean,
        default: false, // Indicates if the booking was refunded
    },
    price: {
        type: Number,
        required: true, // Price of the ticket(s)
    },
    isFlaggedAsSuspicious: {
        type: Boolean,
        default: false, // Flag to indicate if the booking is suspicious
    },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
