const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const authMiddleware = (req, res, next) => {
    // Get token from Authorization header
    const token = req.header("Authorization")?.split(" ")[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Attach the user to the request object
        req.user = decoded.user;
        next(); // Continue to the next middleware or route handler
    } catch (err) {
        return res.status(401).json({ msg: "Token is not valid" });
    }
};

module.exports = authMiddleware;
