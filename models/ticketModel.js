const mongoose = require("mongoose")

// Define the ticket schema
const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    trainName: {
      type: String,
      required: true,
    },
    trainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    coach: {
      type: String,
      required: true,
    },
    seat: {
      type: String,
      required: true,
    },
    passengerName: {
      type: String,
      required: true,
    },
    passengerId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "used", "transferred", "expired", "cancelled"],
      default: "active",
    },
    price: {
      type: Number,
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    transferLimit: {
      type: Number,
      default: 3,
    },
    transfers: [
      {
        fromUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        toUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        transferDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const Ticket = mongoose.model("Ticket", ticketSchema)

module.exports = Ticket
