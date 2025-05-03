const express = require("express")
const router = express.Router()
const ticketController = require("../controllers/ticketController")
const authMiddleware = require("../middlewares/authMiddleware")
const TransferToken = require("../models/transferToken") // Import TransferToken model
const Ticket = require("../models/ticketModel") // Import Ticket model

// Get all tickets for a user
router.get("/", authMiddleware, ticketController.getUserTickets)

// Get a single ticket by ID
router.get("/:id", authMiddleware, ticketController.getTicketById)

// Generate a transfer token
router.post("/transfer/generate", authMiddleware, ticketController.generateTransferToken)

// Validate a transfer token
router.get("/transfer/validate/:token", ticketController.validateTransferToken)

// Complete a ticket transfer
router.post("/transfer/complete/:token", authMiddleware, async (req, res) => {
  try {
    const { token } = req.params
    const { receiverName, receiverIdNumber } = req.body
    const userId = req.user.id

    console.log("Processing transfer with token:", token)

    // Find the transfer token
    const transferToken = await TransferToken.findOne({ token, isUsed: false })
    if (!transferToken) {
      return res.status(404).json({ success: false, message: "Invalid or expired transfer token" })
    }

    console.log("Transfer token found:", transferToken)

    // Get the ticket using the ticketId from the transferToken
    const ticket = await Ticket.findById(transferToken.ticketId)
    console.log("Ticket found:", ticket)

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" })
    }

    // Check if ticket is still active
    if (ticket.status !== "active") {
      return res.status(400).json({ success: false, message: "This ticket is no longer active" })
    }

    // Update ticket status to transferred
    ticket.status = "transferred"

    // Add transfer record
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
      message: "Ticket transfer process completed successfully",
    })
  } catch (error) {
    console.error("Error completing transfer process:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Send transfer email with link
router.post("/transfer/send-email", authMiddleware, ticketController.sendTransferEmail)

module.exports = router
