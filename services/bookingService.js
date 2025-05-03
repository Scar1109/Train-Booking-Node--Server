const Booking = require("../models/bookingModel");
const mongoose = require("mongoose");

/**
 * Service layer for booking operations
 * Handles business logic separate from controllers
 */
class BookingService {
    /**
     * Create a new booking
     * @param {Object} bookingData - Booking information
     * @returns {Promise<Object>} Created booking
     */
    async createBooking(bookingData) {
        const { id } = req.params;
        try {
            // const {
            //     userId,
            //     ticketId,
            //     numTickets,
            //     paymentMethod,
            //     price,
            //     ipAddress,
            //     passengers,
            //     trainDetails,
            // } = bookingData;
            // if (
            //     !userId ||
            //     !ticketId ||
            //     !numTickets ||
            //     !paymentMethod ||
            //     !price ||
            //     !ipAddress
            // ) {
            //     throw new Error("Missing required booking fields");
            // }

            userId = id;
            const newBooking = new Booking({
                userId,
                ticketId,
                numTickets,
                paymentMethod,
                price,
                ipAddress,
                bookingTime: new Date(),
                isRefunded: false,
                isFlaggedAsSuspicious: false,
                passengers,
                trainDetails,
            });
            return await newBooking.save();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get booking by ID
     * @param {string} id - Booking ID
     * @returns {Promise<Object>} Booking object
     */
    async getBookingById(id) {
        try {
            // Validate booking ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid booking ID format");
            }

            // Find booking by ID
            const booking = await Booking.findById(id);

            if (!booking) {
                throw new Error("Booking not found");
            }

            return booking;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get bookings by user ID
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of bookings
     */
    async getBookingsByUserId(userId) {
        try {
            // Find bookings by user ID
            return await Booking.find({ userId }).sort({ bookingTime: -1 });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cancel (refund) a booking
     * @param {string} id - Booking ID
     * @returns {Promise<Object>} Updated booking
     */
    async cancelBooking(id) {
        try {
            // Validate booking ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid booking ID format");
            }

            // Update booking to refunded status
            const updatedBooking = await Booking.findByIdAndUpdate(
                id,
                { isRefunded: true },
                { new: true }
            );

            if (!updatedBooking) {
                throw new Error("Booking not found");
            }

            return updatedBooking;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update booking details
     * @param {string} id - Booking ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated booking
     */
    async updateBooking(id, updateData) {
        try {
            // Validate booking ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid booking ID format");
            }

            // Update booking
            const updatedBooking = await Booking.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            if (!updatedBooking) {
                throw new Error("Booking not found");
            }

            return updatedBooking;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all bookings with pagination
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated bookings
     */
    async getAllBookings(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;

            // Count total bookings
            const total = await Booking.countDocuments();

            // Get bookings with pagination
            const bookings = await Booking.find()
                .sort({ bookingTime: -1 })
                .skip(skip)
                .limit(limit);

            return {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                bookings,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Flag a booking as suspicious
     * @param {string} id - Booking ID
     * @param {string} reason - Reason for flagging
     * @returns {Promise<Object>} Updated booking
     */
    async flagBookingAsSuspicious(id, reason) {
        try {
            // Validate booking ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid booking ID format");
            }

            // Update booking to flag as suspicious
            const updatedBooking = await Booking.findByIdAndUpdate(
                id,
                {
                    isFlaggedAsSuspicious: true,
                    flagReason: reason || "Manual flag by admin",
                },
                { new: true }
            );

            if (!updatedBooking) {
                throw new Error("Booking not found");
            }

            return updatedBooking;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get booking statistics
     * @returns {Promise<Object>} Booking statistics
     */
    async getBookingStatistics() {
        try {
            const totalBookings = await Booking.countDocuments();
            const totalRefunded = await Booking.countDocuments({
                isRefunded: true,
            });
            const totalSuspicious = await Booking.countDocuments({
                isFlaggedAsSuspicious: true,
            });

            // Get bookings by payment method
            const paymentMethodStats = await Booking.aggregate([
                { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]);

            // Get total revenue
            const revenueStats = await Booking.aggregate([
                { $match: { isRefunded: false } },
                { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
            ]);

            return {
                totalBookings,
                totalRefunded,
                totalSuspicious,
                refundRate:
                    totalBookings > 0
                        ? (totalRefunded / totalBookings) * 100
                        : 0,
                paymentMethods: paymentMethodStats,
                totalRevenue:
                    revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0,
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new BookingService();
