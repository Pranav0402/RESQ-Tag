
const express = require("express");
const router = express.Router();

const SensorReading = require("../models/SensorReading");

// GET the latest reading across all containers
router.get("/latest", async (req, res) => {
  try {
    const reading = await SensorReading.findOne()
      .sort({ timestamp: -1 });

    if (!reading) {
      return res.status(404).json({
        message: "No sensor readings found",
      });
    }

    return res.json(reading);
  } catch (error) {
    console.error("Failed to fetch latest sensor reading:", error);

    return res.status(500).json({
      message: "Failed to fetch latest sensor reading",
      error: error.message,
    });
  }
});

// GET the latest 50 readings for one container
// Example: GET /api/sensor-readings/RESQ002
router.get("/:containerId", async (req, res) => {
  try {
    const containerId = req.params.containerId;

    const readings = await SensorReading.find({ containerId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    return res.json(readings);
  } catch (error) {
    console.error("Failed to fetch container sensor readings:", error);

    return res.status(500).json({
      message: "Failed to fetch container sensor readings",
      error: error.message,
    });
  }
});

// POST a new sensor reading
router.post("/", async (req, res) => {
  try {
    const {
      containerId,
      temperature,
      humidity,
      battery,
    } = req.body;

    if (
      typeof containerId !== "string" ||
      !containerId.trim() ||
      temperature === undefined ||
      humidity === undefined ||
      !Number.isFinite(Number(temperature)) ||
      !Number.isFinite(Number(humidity))
    ) {
      return res.status(400).json({
        message:
          "A valid containerId, numeric temperature and numeric humidity are required",
      });
    }

    const temp = Number(temperature);
    const hum = Number(humidity);

    let status = "CRITICAL";

    if (
      temp >= 2 &&
      temp <= 8 &&
      hum >= 40 &&
      hum <= 75
    ) {
      status = "SAFE";
    } else if (
      temp >= 0 &&
      temp <= 12 &&
      hum >= 30 &&
      hum <= 85
    ) {
      status = "WARNING";
    }

    let batteryValue = null;

    if (battery !== undefined && battery !== null && battery !== "") {
      const parsedBattery = Number(battery);

      if (!Number.isFinite(parsedBattery)) {
        return res.status(400).json({
          message: "Battery must be a number",
        });
      }

      batteryValue = parsedBattery;
    }

    const reading = new SensorReading({
      containerId: containerId.trim(),
      temperature: temp,
      humidity: hum,
      battery: batteryValue,
      status,
      timestamp: new Date(),
    });

    const savedReading = await reading.save();

    return res.status(201).json(savedReading);
  } catch (error) {
    console.error("Failed to save sensor reading:", error);

    return res.status(500).json({
      message: "Failed to save sensor reading",
      error: error.message,
    });
  }
});

module.exports = router;
