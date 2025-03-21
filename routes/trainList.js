const express = require("express");
const router = express.Router();
const trainController = require("../controllers/trainController");

// Debugging logs for API calls
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// GET all trains
router.get("/", trainController.getAllTrains);

// GET a train by ID
router.get("/:id", trainController.getTrainById);

// POST create a new train
router.post("/", trainController.createTrain);

// PUT update a train
router.put("/:id", trainController.updateTrain);

// DELETE soft delete a train
router.delete("/:id", trainController.deleteTrain);

module.exports = router;
