const Train = require("../models/trainList");

/**
 * Fetch all trains with pagination
 */
exports.getAllTrains = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const trains = await Train.find({ active: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Train.countDocuments({ active: true });

        return { success: true, trains, pagination: { total, page, limit } };
    } catch (error) {
        console.error("Error fetching trains:", error);
        throw new Error("Failed to fetch train data");
    }
};

/**
 * Fetch a single train by ID
 */
exports.getTrainById = async (id) => {
    try {
        const train = await Train.findById(id);
        return train ? { success: true, train } : null;
    } catch (error) {
        console.error("Error fetching train:", error);
        throw new Error("Failed to fetch train details");
    }
};

/**
 * Create a new train
 */
exports.createTrain = async (trainData) => {
    try {
        const newTrain = new Train(trainData);
        await newTrain.save();
        return { success: true, data: newTrain };
    } catch (error) {
        console.error("Error creating train:", error);
        throw new Error("Failed to create train");
    }
};

/**
 * Update an existing train
 */
exports.updateTrain = async (id, trainData) => {
    try {
        const updatedTrain = await Train.findByIdAndUpdate(id, trainData, { new: true });
        return updatedTrain ? { success: true, data: updatedTrain } : null;
    } catch (error) {
        console.error("Error updating train:", error);
        throw new Error("Failed to update train details");
    }
};

/**
 * Soft delete a train by ID (mark as inactive)
 */
exports.deleteTrain = async (id) => {
    try {
        const deletedTrain = await Train.findByIdAndUpdate(id, { active: false });
        return deletedTrain ? { success: true, message: "Train deleted successfully" } : null;
    } catch (error) {
        console.error("Error deleting train:", error);
        throw new Error("Failed to delete train");
    }
};
