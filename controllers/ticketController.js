const Ticket = require("../models/ticketModel")
const User = require("../models/userModel")
const TransferToken = require("../models/transferToken")
const OTP = require("../models/otpModel")
const { sendOtpEmail } = require("../utils/emailService")
const crypto = require("crypto")

/**
 * Get all tickets for a user
 */
exports.getUserTickets = async (req, res) => {
    try {
      // Remove the userId filtering to fetch all tickets
      const tickets = await Ticket.find().sort({ createdAt: -1 }) // Sort by creation date (newest first)
      res.json({ success: true, tickets }) // Sending the tickets as response
    } catch (error) {
      console.error("Error fetching tickets:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  }

/**
 * Get a single ticket by ID
 */
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" })
    }
    res.json({ success: true, ticket })
  } catch (error) {
    console.error("Error fetching ticket:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

// Generate a transfer token for a ticket
exports.generateTransferToken = async (req, res) => {
    try {
      const { ticketId, recipientEmail } = req.body
      const userId = req.user.id  // Ensure we are using the authenticated user ID
  
      // Validate ticket exists and belongs to user
      const ticket = await Ticket.findOne({ _id: ticketId, userId })
      console.log("Ticket not found or doesn't belong to user", ticketId, userId)
      if (!ticket) {
        return res.status(404).json({ success: false, message: "Ticket not found or doesn't belong to you" })  
      }
  
      // Check if ticket is active
      if (ticket.status !== "active") {
        return res.status(400).json({ success: false, message: "Only active tickets can be transferred" })
      }
  
      // Check transfer limit
      if (ticket.transfers.length >= ticket.transferLimit) {
        return res.status(400).json({ success: false, message: "Transfer limit reached for this ticket" })
      }
  
      // Generate a unique token
      const token = crypto.randomBytes(32).toString("hex")
  
      // Create a new transfer token
      const transferToken = new TransferToken({
        token,
        ticketId: ticket._id,
        fromUserId: userId,
        toEmail: recipientEmail,
      })
  
      await transferToken.save()
  
      res.json({
        success: true,
        token,
        message: "Transfer token generated successfully",
      })
    } catch (error) {
      console.error("Error generating transfer token:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  }
  

/**
 * Validate a transfer token
 */
exports.validateTransferToken = async (req, res) => {
  try {
    const { token } = req.params

    // Find the transfer token
    const transferToken = await TransferToken.findOne({ token, isUsed: false })
    if (!transferToken) {
      return res.status(404).json({ success: false, message: "Invalid or expired transfer token" })
    }

    // Get the ticket details
    const ticket = await Ticket.findById(transferToken.ticketId)
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" })
    }

    // Check if ticket is still active
    if (ticket.status !== "active") {
      return res.status(400).json({ success: false, message: "This ticket is no longer active" })
    }

    res.json({
      success: true,
      ticket,
      message: "Transfer token is valid",
    })
  } catch (error) {
    console.error("Error validating transfer token:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

/**
 * Complete a ticket transfer
 */
exports.completeTransfer = async (req, res) => {
  try {
    const { token } = req.params
    const { receiverName, receiverIdNumber } = req.body
    const userId = req.user.id

    // Find the transfer token
    const transferToken = await TransferToken.findOne({ token, isUsed: false })
    if (!transferToken) {
      return res.status(404).json({ success: false, message: "Invalid or expired transfer token" })
    }

    // Get the ticket
    const ticket = await Ticket.findById(transferToken.ticketId)
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" })
    }

    // Check if ticket is still active
    if (ticket.status !== "active") {
      return res.status(400).json({ success: false, message: "This ticket is no longer active" })
    }

    // Update ticket with new owner information
    ticket.userId = userId
    ticket.passengerName = receiverName
    ticket.passengerId = receiverIdNumber
    ticket.transfers.push({
      fromUserId: transferToken.fromUserId,
      toUserId: userId,
      transferDate: new Date(),
    })

    // Mark transfer token as used
    transferToken.isUsed = true
    await transferToken.save()

    // Save updated ticket
    await ticket.save()

    res.json({
      success: true,
      ticket,
      message: "Ticket transfer completed successfully",
    })
  } catch (error) {
    console.error("Error completing transfer:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

/**
 * Send transfer email with link
 */
exports.sendTransferEmail = async (req, res) => {
  try {
    const { ticketId, recipientEmail, token } = req.body
    const userId = req.user.id

    // Validate ticket exists and belongs to user
    const ticket = await Ticket.findOne({ _id: ticketId, userId })
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found or doesn't belong to you" })
    }

    // Generate transfer link
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173"
    const transferLink = `${baseUrl}/receive/${token}`

    // Send email with transfer link
    // This would use your email service
    // For now, we'll just return the link
    res.json({
      success: true,
      transferLink,
      message: "Transfer link generated successfully",
    })
  } catch (error) {
    console.error("Error sending transfer email:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}
