const express = require("express")
const router = express.Router()
const OTP = require("../models/otpModel")
const User = require("../models/userModel")
const { sendOtpEmail } = require("../utils/emailService")
const jwt = require("jsonwebtoken")

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ success: false, message: "Unauthorized: No token provided" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).send({ success: false, message: "Unauthorized: Invalid token" })
  }
}

// Generate and send OTP
router.post("/generate", verifyToken, async (req, res) => {
  try {
    const { recipientEmail, ticketId, ticketDetails } = req.body

    if (!recipientEmail || !ticketId || !ticketDetails) {
      return res.status(400).send({
        success: false,
        message: "Recipient email, ticket ID, and ticket details are required",
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).send({ success: false, message: "Invalid email format" })
    }

    // Check if recipient email exists in the user database
    const recipientUser = await User.findOne({ email: recipientEmail })
    if (!recipientUser) {
      return res.status(404).send({
        success: false,
        message: "Recipient email is not registered in our system",
      })
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Save OTP to database
    const newOTP = new OTP({
      email: recipientEmail,
      otp,
      ticketId,
    })

    await newOTP.save()

    // Send OTP via email
    const emailResult = await sendOtpEmail(recipientEmail, otp, ticketDetails)

    if (!emailResult.success) {
      return res.status(500).send({
        success: false,
        message: "Failed to send OTP email",
        error: emailResult.error,
      })
    }

    res.send({
      success: true,
      message: "OTP generated and sent successfully",
      expiresIn: 1800, // 30 minutes in seconds
    })
  } catch (error) {
    console.error("Error generating OTP:", error)
    res.status(500).send({ success: false, message: "Server error", error: error.message })
  }
})

// Verify OTP
router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { email, otp, ticketId } = req.body

    if (!email || !otp || !ticketId) {
      return res.status(400).send({
        success: false,
        message: "Email, OTP, and ticket ID are required",
      })
    }

    // Find the most recent OTP for this email and ticket
    const otpRecord = await OTP.findOne({
      email,
      ticketId,
      isUsed: false,
    }).sort({ createdAt: -1 })

    if (!otpRecord) {
      return res.status(404).send({
        success: false,
        message: "No valid OTP found for this email and ticket",
      })
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).send({
        success: false,
        message: "Invalid OTP",
      })
    }

    // Mark OTP as used
    otpRecord.isUsed = true
    await otpRecord.save()

    res.send({
      success: true,
      message: "OTP verified successfully",
    })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    res.status(500).send({ success: false, message: "Server error", error: error.message })
  }
})

module.exports = router

