const bookingService = require("../services/bookingService");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a new booking
const createBooking = async (req, res) => {
    try {
        const userId = req.user.id; // Get userId from the decoded token
        const bookingData = req.body; // Get the booking data from the request body

        const savedBooking = await bookingService.createBooking(userId, bookingData);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: savedBooking,
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(error.message.includes("Missing required") ? 400 : 500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};


// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await bookingService.getBookingById(id);

        res.json({
            success: true,
            booking,
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(
            error.message.includes("Invalid booking ID") ||
                error.message.includes("not found")
                ? 404
                : 500
        ).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};

// Get bookings by user ID
const getBookingsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await bookingService.getBookingsByUserId(userId);

        res.json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};

// Cancel (refund) a booking
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBooking = await bookingService.cancelBooking(id);

        res.json({
            success: true,
            message: "Booking cancelled successfully",
            booking: updatedBooking,
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(
            error.message.includes("Invalid booking ID") ||
                error.message.includes("not found")
                ? 404
                : 500
        ).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};

// Update booking details
const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedBooking = await bookingService.updateBooking(
            id,
            updateData
        );

        res.json({
            success: true,
            message: "Booking updated successfully",
            booking: updatedBooking,
        });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(
            error.message.includes("Invalid booking ID") ||
                error.message.includes("not found")
                ? 404
                : 500
        ).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const result = await bookingService.getAllBookings(page, limit);

        res.json({
            success: true,
            count: result.total,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            bookings: result.bookings,
        });
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};

// Flag a booking as suspicious
const flagBookingAsSuspicious = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const updatedBooking = await bookingService.flagBookingAsSuspicious(
            id,
            reason
        );

        res.json({
            success: true,
            message: "Booking flagged as suspicious",
            booking: updatedBooking,
        });
    } catch (error) {
        console.error("Error flagging booking:", error);
        res.status(
            error.message.includes("Invalid booking ID") ||
                error.message.includes("not found")
                ? 404
                : 500
        ).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};

module.exports = {
    createBooking,
    getBookingById,
    getBookingsByUserId,
    cancelBooking,
    updateBooking,
    getAllBookings,
    flagBookingAsSuspicious,
};
