const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // Import the DB connection
const authRoutes = require("./routes/authRoutes"); // Import authentication routes
const authMiddleware = require("./middlewares/authMiddleware"); // Import authentication middleware
const errorMiddleware = require("./middlewares/errorMiddleware"); // Import error handler middleware
const trainRoutes = require("./routes/trainList"); // Import train routes
const userRoutes = require("./routes/userRoutes"); // Import user routes
const bookingRoutes = require("./routes/bookingRoutes"); // Import booking routes
const otpRoutes = require("./routes/otpRoutes")

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse incoming JSON requests

const checkTokenExpired = (token) => {
    if (!token) {
        return true;
    }

    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decodedToken.exp < currentTime;
    } catch (error) {
        console.error("Error decoding token: ", error);
        return true;
    }
};

// Connect to the database
connectDB();

// Public routes (no token required)
app.use("/api/auth", authRoutes);

// Protected routes (token required)
app.use("/api/trains", authMiddleware, trainRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/bookings", authMiddleware, bookingRoutes);
app.use("/api/otp", authMiddleware, otpRoutes);

// Global error handler middleware
app.use(errorMiddleware); // Catch errors globally

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
