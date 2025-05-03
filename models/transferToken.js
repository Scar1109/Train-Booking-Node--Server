const mongoose = require("mongoose");

// Define the transfer token schema
const transferTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toEmail: {
    type: String,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800, // Token expires after 30 minutes (1800 seconds)
  },
});

// Check if the model already exists, or define it if it doesn't
const TransferToken = mongoose.models.TransferToken || mongoose.model("TransferToken", transferTokenSchema);

module.exports = TransferToken;
