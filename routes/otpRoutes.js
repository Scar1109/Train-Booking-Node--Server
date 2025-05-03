const express = require("express");
const router = express.Router();
const OTP = require("../models/otpModel");
const User = require("../models/userModel");
const Ticket = require("../models/ticketModel");
const TransferToken = require("../models/transferToken");
const { sendOtpEmail, sendTransferLinkEmail } = require("../utils/emailService");
const crypto = require("crypto");
const authMiddleware = require("../middlewares/authMiddleware");

// Generate and send OTP for ticket transfer
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { recipientEmail, ticketId, ticketDetails } = req.body;
    const userId = req.user.id; // Get userId from the decoded JWT

    console.log("Attempting to find ticket:", { ticketId, userId });

    // First try to find the ticket by ID
    const ticketExists = await Ticket.findById(ticketId);
    if (!ticketExists) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found in the database",
      });
    }

    // If ticket exists but doesn't belong to the user
    if (ticketExists.userId.toString() !== userId) {
      return res.status(403).send({
        success: false,
        message: "This ticket belongs to another user",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).send({ success: false, message: "Invalid email format" });
    }

    // Check if recipient email exists in the user database
    const recipientUser = await User.findOne({ email: recipientEmail });
    if (!recipientUser) {
      return res.status(404).send({
        success: false,
        message: "Recipient email is not registered in our system",
      });
    }

    // Check if ticket is active
    if (ticketExists.status !== "active") {
      return res.status(400).send({
        success: false,
        message: "Only active tickets can be transferred",
      });
    }

    // Check transfer limit
    if (ticketExists.transfers.length >= ticketExists.transferLimit) {
      return res.status(400).send({
        success: false,
        message: "Transfer limit reached for this ticket",
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    const newOTP = new OTP({
      email: recipientEmail,
      otp,
      ticketId,
    });
    await newOTP.save();

    // Send OTP via email
    const emailResult = await sendOtpEmail(recipientEmail, otp, ticketDetails);

    if (!emailResult.success) {
      return res.status(500).send({
        success: false,
        message: "Failed to send OTP email",
        error: emailResult.error,
      });
    }

    res.send({
      success: true,
      message: "OTP generated and sent successfully",
      expiresIn: 1800, // 30 minutes in seconds
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).send({ success: false, message: "Server error", error: error.message });
  }
});

// Verify OTP and generate transfer token
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { email, otp, ticketId } = req.body;
    const userId = req.user.id;

    if (!email || !otp || !ticketId) {
      return res.status(400).send({
        success: false,
        message: "Email, OTP, and ticket ID are required",
      });
    }

    // Find the most recent OTP for this email and ticket
    const otpRecord = await OTP.findOne({
      email,
      ticketId,
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(404).send({
        success: false,
        message: "No valid OTP found for this email and ticket",
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).send({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Get ticket and sender details
    const ticket = await Ticket.findById(ticketId);
    const sender = await User.findById(userId);

    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found",
      });
    }

    // Generate a transfer token
    const token = crypto.randomBytes(32).toString("hex");

    // Create a new transfer token
    const transferToken = new TransferToken({
      token,
      ticketId,
      fromUserId: userId,
      toEmail: email,
    });
    await transferToken.save();

    // Generate transfer link
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const transferLink = `${baseUrl}/receive/${token}`;

    // Send transfer link via email
    const emailResult = await sendTransferLinkEmail(
      email,
      transferLink,
      {
        from: ticket.from,
        to: ticket.to,
        departureTime: ticket.departureTime,
        trainName: ticket.trainName,
        ticketNumber: ticket.ticketNumber,
      },
      sender ? `${sender.fname} ${sender.lname}` : "A user"
    );

    if (!emailResult.success) {
      return res.status(500).send({
        success: false,
        message: "Failed to send transfer link email",
        error: emailResult.error,
      });
    }

    res.send({
      success: true,
      message: "OTP verified successfully and transfer link sent to recipient",
      token,
      transferLink,
      emailSent: true,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).send({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;
