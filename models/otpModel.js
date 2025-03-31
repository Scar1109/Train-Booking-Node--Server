const mongoose = require("mongoose")

// Define the OTP schema
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  ticketId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800, // OTP expires after 30 minutes (1800 seconds)
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
})

const OTP = mongoose.model("OTP", otpSchema)

module.exports = OTP

