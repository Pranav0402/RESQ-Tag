
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const containerRoutes = require("./routes/containerRoutes");
const sensorRoutes = require("./routes/sensorRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/containers", containerRoutes);
app.use("/api/sensor-readings", sensorRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ResQ-TAG backend is running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "ResQ-TAG API",
    database:
      mongoose.connection.readyState === 1
        ? "CONNECTED"
        : "DISCONNECTED",
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`ResQ-TAG backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  });
