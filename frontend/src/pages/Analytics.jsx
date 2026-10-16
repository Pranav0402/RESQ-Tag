import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Thermometer, Droplets } from "lucide-react";
import { getContainers } from "../services/containerService";

const API_URL = "http://localhost:5000/api";

function Analytics() {
  const [containers, setContainers] = useState([]);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setError("");

      const containerData = await getContainers();

      const readingGroups = await Promise.all(
        containerData.map(async (container) => {
          const response = await fetch(
            `${API_URL}/sensor-readings/${container.containerId}`
          );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch readings for ${container.containerId}`
            );
          }

          return response.json();
        })
      );

      setContainers(containerData);
      setReadings(readingGroups.flat());
    } catch (err) {
      console.error("Analytics error:", err);
      setError(err.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(loadAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const latestByContainer = containers.map((container) => {
    const containerReadings = readings
      .filter((reading) => reading.containerId === container.containerId)
      .sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

    return {
      ...container,
      latest: containerReadings[0] || null,
    };
  });

  const latestReadings = latestByContainer
    .map((container) => container.latest)
    .filter(Boolean);

  const safeCount = latestReadings.filter(
    (reading) => reading.status === "SAFE"
  ).length;

  const warningCount = latestReadings.filter(
    (reading) => reading.status === "WARNING"
  ).length;

  const criticalCount = latestReadings.filter(
    (reading) => reading.status === "CRITICAL"
  ).length;

  const averageTemperature = latestReadings.length
    ? (
        latestReadings.reduce(
          (sum, reading) => sum + reading.temperature,
          0
        ) / latestReadings.length
      ).toFixed(1)
    : "--";

  const averageHumidity = latestReadings.length
    ? (
        latestReadings.reduce(
          (sum, reading) => sum + reading.humidity,
          0
        ) / latestReadings.length
      ).toFixed(1)
    : "--";

  const formatTimestamp = (timestamp) =>
    timestamp ? new Date(timestamp).toLocaleString() : "--";

  if (loading) {
    return <div className="clean-page-state">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Environmental monitoring statistics across registered containers.</p>
        </div>

        <button className="secondary-button" onClick={loadAnalytics}>
          <Activity size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="clean-page-state">
          <h3>Unable to load analytics</h3>
          <p>{error}</p>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon containers-icon">
            <Activity size={20} />
          </div>
          <div className="stat-content">
            <span>Registered Containers</span>
            <strong>{containers.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon safe-icon">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-content">
            <span>Latest Safe Readings</span>
            <strong>{safeCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <span>Latest Warnings</span>
            <strong>{warningCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon critical-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <span>Latest Critical</span>
            <strong>{criticalCount}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon containers-icon">
            <Thermometer size={20} />
          </div>
          <div className="stat-content">
            <span>Average Latest Temperature</span>
            <strong>{averageTemperature}{averageTemperature !== "--" ? " °C" : ""}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon safe-icon">
            <Droplets size={20} />
          </div>
          <div className="stat-content">
            <span>Average Latest Humidity</span>
            <strong>{averageHumidity}{averageHumidity !== "--" ? " %" : ""}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon containers-icon">
            <Activity size={20} />
          </div>
          <div className="stat-content">
            <span>Total Stored Readings</span>
            <strong>{readings.length}</strong>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Latest Container Conditions</h2>
            <p>Most recent available reading for each container.</p>
          </div>
        </div>

        {latestByContainer.length === 0 ? (
          <div className="clean-empty-state">
            <Activity size={32} />
            <h3>No containers registered</h3>
            <p>Create a container and start collecting sensor data.</p>
          </div>
        ) : (
          <div className="container-list">
            {latestByContainer.map((container) => (
              <div className="container-row" key={container.containerId}>
                <div className="container-info">
                  <div className="container-symbol">
                    <Activity size={19} />
                  </div>
                  <div>
                    <strong>{container.name}</strong>
                    <span>
                      {container.containerId} · {container.product}
                    </span>
                  </div>
                </div>

                <div className="container-location">
                  {container.latest
                    ? `${container.latest.temperature} °C · ${container.latest.humidity}%`
                    : "No readings"}
                </div>

                <span
                  className={`status-badge status-${(
                    container.latest?.status || "active"
                  ).toLowerCase()}`}
                >
                  {container.latest?.status || "WAITING"}
                </span>

                <span>
                  {formatTimestamp(container.latest?.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="section-note">
        Analytics refresh every 10 seconds. These figures describe recorded
        environmental readings; they are not AI shelf-life predictions.
      </p>
    </div>
  );
}

export default Analytics;