import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { getContainers } from "../services/containerService";

const API_URL = "http://localhost:5000/api";

function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAlerts() {
    try {
      setError("");

      const containers = await getContainers();

      const results = await Promise.all(
        containers.map(async (container) => {
          try {
            const response = await fetch(
              `${API_URL}/sensor-readings/${container.containerId}`
            );

            if (!response.ok) {
              throw new Error("Failed to fetch sensor readings");
            }

            const readings = await response.json();
            const latest = readings[0];

            if (
              latest &&
              ["WARNING", "CRITICAL"].includes(latest.status)
            ) {
              return {
                ...container,
                latestReading: latest,
                alertStatus: latest.status,
              };
            }

            return null;
          } catch (err) {
            console.error(
              `Failed to check ${container.containerId}:`,
              err
            );
            return null;
          }
        })
      );

      setAlerts(results.filter(Boolean));
    } catch (err) {
      console.error("Failed to load alerts:", err);
      setError(err.message || "Unable to load alerts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();

    const interval = setInterval(loadAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  function formatTimestamp(timestamp) {
    return timestamp
      ? new Date(timestamp).toLocaleString()
      : "--";
  }

  const criticalCount = alerts.filter(
    (alert) => alert.alertStatus === "CRITICAL"
  ).length;

  const warningCount = alerts.filter(
    (alert) => alert.alertStatus === "WARNING"
  ).length;

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div>
          <h1>Alerts</h1>
          <p>Review containers whose latest sensor readings need attention.</p>
        </div>

        <button className="secondary-button" onClick={loadAlerts}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon critical-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <span>Critical Alerts</span>
            <strong>{criticalCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <span>Warnings</span>
            <strong>{warningCount}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="clean-page-state">Loading alerts...</div>
      ) : error ? (
        <div className="clean-page-state">
          <h3>Unable to load alerts</h3>
          <p>{error}</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="clean-empty-state">
          <CheckCircle2 size={36} />
          <h3>No active environmental alerts</h3>
          <p>
            No containers currently have a latest reading marked WARNING
            or CRITICAL.
          </p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div
              className="dashboard-card alert-card"
              key={alert.containerId}
            >
              <div className="container-card-header">
                <div>
                  <span className="card-label">{alert.containerId}</span>
                  <h3>{alert.name}</h3>
                </div>

                <span
                  className={`status-badge status-${alert.alertStatus.toLowerCase()}`}
                >
                  {alert.alertStatus}
                </span>
              </div>

              <p>
                {alert.product} · {alert.location}
              </p>

              <div className="alert-reading-details">
                <span>
                  Temperature: <strong>{alert.latestReading.temperature} °C</strong>
                </span>
                <span>
                  Humidity: <strong>{alert.latestReading.humidity}%</strong>
                </span>
                <span>
                  Recorded: <strong>{formatTimestamp(alert.latestReading.timestamp)}</strong>
                </span>
              </div>

              <button
                className="secondary-button"
                onClick={() =>
                  navigate(`/containers/${alert.containerId}`)
                }
              >
                View Container
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="section-note">
        Alerts are based on the latest environmental status returned by the
        backend. AI freshness-risk alerts are not included until the AI
        prediction service is integrated.
      </p>
    </div>
  );
}

export default Alerts;