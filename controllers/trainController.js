const Train = require("../models/trainList"); // ✅ Ensure correct import path
const trainService = require("../services/trainList"); // ✅ Ensure correct import path

/**
 * Get all trains
 */
exports.getAllTrains = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await trainService.getAllTrains(page, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get a single train by ID
 */
exports.getTrainById = async (req, res) => {
    try {
        const train = await trainService.getTrainById(req.params.id);
        if (!train) return res.status(404).json({ success: false, message: "Train not found" });
        res.json(train);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create a new train
 */
exports.createTrain = async (req, res) => {
    try {
        console.log("Received train data:", req.body);

        const { name, route, departureTime, arrivalTime, classes } = req.body;

        // Validate request body
        if (!name || !route || !departureTime || !arrivalTime || !classes) {
            console.error("Validation failed: Missing required fields");
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Create new train
        const newTrain = new Train({
            name,
            route,
            departureTime,
            arrivalTime,
            classes,
            active: true,
        });

        await newTrain.save();
        console.log("Train saved successfully:", newTrain);

        res.status(201).json({ success: true, data: newTrain });
    } catch (error) {
        console.error("Error saving train:", error.message);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

/**
 * Update a train by ID
 */
exports.updateTrain = async (req, res) => {
    try {
        const updatedTrain = await trainService.updateTrain(req.params.id, req.body);
        if (!updatedTrain) return res.status(404).json({ success: false, message: "Train not found" });
        res.json(updatedTrain);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Delete (Soft delete) a train
 */
exports.deleteTrain = async (req, res) => {
    try {
        const result = await trainService.deleteTrain(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "Train not found" });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
