const express = require("express");
const Container = require("../models/Container");

const router = express.Router();

// GET all containers
router.get("/", async (req, res) => {
  try {
    const containers = await Container.find().sort({ createdAt: -1 });

    res.json(containers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch containers",
      error: error.message,
    });
  }
});

// GET one container
router.get("/:containerId", async (req, res) => {
  try {
    const container = await Container.findOne({
      containerId: req.params.containerId,
    });

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    res.json(container);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch container",
      error: error.message,
    });
  }
});

// CREATE a container
router.post("/", async (req, res) => {
  try {
    const {
      containerId,
      name,
      product,
      location,
    } = req.body;

    if (!containerId || !name || !product) {
      return res.status(400).json({
        message: "containerId, name and product are required",
      });
    }

    const existingContainer = await Container.findOne({
      containerId,
    });

    if (existingContainer) {
      return res.status(409).json({
        message: "Container ID already exists",
      });
    }

    const container = await Container.create({
      containerId,
      name,
      product,
      location,
    });

    res.status(201).json(container);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create container",
      error: error.message,
    });
  }
});

// UPDATE container status
router.patch("/:containerId/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "ACTIVE",
      "SAFE",
      "WARNING",
      "CRITICAL",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const container = await Container.findOneAndUpdate(
      { containerId: req.params.containerId },
      { status },
      { new: true }
    );

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    res.json(container);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update container status",
      error: error.message,
    });
  }
});

module.exports = router;