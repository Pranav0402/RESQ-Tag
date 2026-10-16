const mongoose = require("mongoose");

const sensorReadingSchema = new mongoose.Schema({
  containerId: {
    type: String,
    required: true,
  },

  temperature: {
    type: Number,
    required: true,
  },

  humidity: {
    type: Number,
    required: true,
  },

  battery: {
    type: Number,
    default: null,
  },

  status: {
    type: String,
    enum: ["SAFE", "WARNING", "CRITICAL"],
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "SensorReading",
  sensorReadingSchema
);