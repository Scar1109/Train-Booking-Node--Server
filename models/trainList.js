const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        route: {
            from: { type: String, required: true, trim: true },
            to: { type: String, required: true, trim: true },
        },
        departureTime: { type: String, required: true },
        arrivalTime: { type: String, required: true },
        classes: [
            {
                type: { type: String, required: true },
                capacity: { type: Number, required: true, min: 1 },
                available: { type: Number, required: true, min: 0 },
                price: { type: Number, required: true, min: 0 },
            },
        ],
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// ✅ Ensure model is exported correctly
const Train = mongoose.model("Train", trainSchema);
module.exports = Train;
