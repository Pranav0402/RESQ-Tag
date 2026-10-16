const mongoose = require("mongoose");

const containerSchema = new mongoose.Schema(
  {
    containerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    product: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SAFE", "WARNING", "CRITICAL"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Container", containerSchema);