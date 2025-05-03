const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const authMiddleware = require("../middlewares/authMiddleware");
const dotenv = require("dotenv");
dotenv.config();
const bookingController = require('../controllers/bookingController');

// Route to create a new booking
router.post('/create', authMiddleware, bookingController.createBooking);

// Route to get a booking by ID
router.get('/bookings/:id', bookingController.getBookingById);

// Route to get all bookings for a specific user
router.get('/bookings/user/:userId', bookingController.getBookingsByUserId);

// Route to cancel a booking
router.delete('/bookings/:id', bookingController.cancelBooking);

// Route to update booking details
router.put('/bookings/:id', bookingController.updateBooking);

// Route to get all bookings (for admin)
router.get('/bookings', bookingController.getAllBookings);

// Route to flag a booking as suspicious
router.patch('/bookings/:id/flag', bookingController.flagBookingAsSuspicious);


// ✅ GET all bookings
router.get("/getAll", authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ bookingTime: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ PUT update a booking
router.put("/update/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { numTickets, price, bookingTime } = req.body;

    try {
        const updated = await Booking.findByIdAndUpdate(
            id,
            {
                numTickets,
                price,
                bookingTime, // ✅ include bookingTime (expected as ISO string)
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.json({ success: true, message: "Booking updated", booking: updated });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ PATCH cancel (refund) a booking
router.patch("/cancel/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const cancelled = await Booking.findByIdAndUpdate(
            id,
            { isRefunded: true },
            { new: true }
        );

        if (!cancelled) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.json({ success: true, message: "Ticket cancelled", booking: cancelled });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
