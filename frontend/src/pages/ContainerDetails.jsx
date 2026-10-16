
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getContainerById } from "../services/containerService";

const API_URL = "http://localhost:5000/api";

function ContainerDetails() {
  const { id } = useParams();

  const [container, setContainer] = useState(null);
  const [reading, setReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sensorError, setSensorError] = useState("");

  useEffect(() => {
    let active = true;
    let intervalId;

    async function loadSensorData(containerId) {
      try {
        const response = await fetch(
          `${API_URL}/sensor-readings/${encodeURIComponent(containerId)}`
        );

        if (!response.ok) {
          throw new Error(`Sensor API returned HTTP ${response.status}`);
        }

        const readings = await response.json();

        if (!Array.isArray(readings)) {
          throw new Error("Unexpected response from sensor API");
        }

        if (!active) return;

        setHistory(readings);
        setReading(readings.length > 0 ? readings[0] : null);
        setSensorError("");
      } catch (err) {
        if (active) {
          console.error("Sensor data error:", err);
          setSensorError(
            err.message || "Unable to load sensor readings."
          );
        }
      }
    }

    async function loadContainer() {
      try {
        setLoading(true);
        setError("");
        setSensorError("");

        const data = await getContainerById(id);

        if (!active) return;

        if (!data) {
          setContainer(null);
          setReading(null);
          setHistory([]);
          setError("Container not found.");
          return;
        }

        setContainer(data);

        const containerId = data.containerId || id;

        if (!containerId) {
          setSensorError("This container has no container ID.");
          return;
        }

        await loadSensorData(containerId);

        if (!active) return;

        intervalId = setInterval(() => {
          loadSensorData(containerId);
        }, 5000);
      } catch (err) {
        if (active) {
          console.error("Container loading error:", err);
          setError(
            err.message || "Failed to load container details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadContainer();

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [id]);

  function formatTimestamp(timestamp) {
    if (!timestamp) return "--";

    const date = new Date(timestamp);

    return Number.isNaN(date.getTime())
      ? "--"
      : date.toLocaleString();
  }

  if (loading) {
    return (
      <div className="clean-page-state">
        Loading container...
      </div>
    );
  }

  if (error || !container) {
    return (
      <div className="clean-page-state">
        <h2>Container not found</h2>
        <p>{error || "The requested container could not be found."}</p>

        <Link to="/containers" className="primary-button">
          Back to Containers
        </Link>
      </div>
    );
  }

  const status = container.status || "ACTIVE";
  const sensorStatus = reading?.status || "WAITING";

  return (
    <div className="container-details-page">
      {/* Header */}
      <div className="details-header">
        <div>
          <div className="details-eyebrow">
            CONTAINER MONITORING
          </div>

          <h1>{container.name || container.containerId}</h1>

          <p>
            Container ID{" "}
            <strong>{container.containerId || id}</strong>
          </p>
        </div>

        <div className="details-header-actions">
          <span
            className={`status-badge status-${String(status).toLowerCase()}`}
          >
            {status}
          </span>

          <Link to="/containers" className="secondary-button">
            Back
          </Link>
        </div>
      </div>

      {/* Basic information */}
      <div className="details-section">
        <div className="section-title">
          <h2>Container Information</h2>
          <p>Basic information about this monitored batch.</p>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span>Product</span>
            <strong>{container.product || "--"}</strong>
          </div>

          <div className="info-item">
            <span>Location</span>
            <strong>{container.location || "--"}</strong>
          </div>

          <div className="info-item">
            <span>Container ID</span>
            <strong>{container.containerId || id}</strong>
          </div>

          <div className="info-item">
            <span>Created</span>
            <strong>
              {container.createdAt
                ? new Date(container.createdAt).toLocaleDateString()
                : "--"}
            </strong>
          </div>
        </div>
      </div>

      {/* Current environment */}
      <div className="details-section">
        <div className="section-title">
          <h2>Current Environment</h2>
          <p>Latest conditions reported by the container sensor.</p>
        </div>

        {sensorError && (
          <p role="alert">
            Sensor connection issue: {sensorError}
          </p>
        )}

        <div className="environment-grid">
          <div className="environment-item">
            <span>Temperature</span>
            <strong>
              {reading?.temperature != null
                ? `${reading.temperature} °C`
                : "-- °C"}
            </strong>
          </div>

          <div className="environment-item">
            <span>Humidity</span>
            <strong>
              {reading?.humidity != null
                ? `${reading.humidity} %`
                : "-- %"}
            </strong>
          </div>

          <div className="environment-item">
            <span>Battery</span>
            <strong>
              {reading?.battery != null
                ? `${reading.battery} %`
                : "-- %"}
            </strong>
          </div>

          <div className="environment-item">
            <span>Status</span>
            <strong
              className={
                reading
                  ? `status-badge status-${String(sensorStatus).toLowerCase()}`
                  : "waiting-text"
              }
            >
              {sensorStatus}
            </strong>
          </div>
        </div>

        <p>
          <strong>Last updated:</strong>{" "}
          {formatTimestamp(reading?.timestamp)}
        </p>
      </div>

      {/* Shelf life */}
      <div className="details-section">
        <div className="section-title">
          <h2>Shelf-Life Prediction</h2>
          <p>AI-based freshness prediction for this container.</p>
        </div>

        <div className="prediction-grid">
          <div className="prediction-item">
            <span>Remaining Shelf Life</span>
            <strong>-- days</strong>
          </div>

          <div className="prediction-item">
            <span>AI Risk</span>
            <strong className="waiting-text">WAITING</strong>
          </div>
        </div>

        <div className="section-note">
          AI prediction will become available when the AI model
          is connected and sufficient data is available.
        </div>
      </div>

      {/* Sensor history */}
      <div className="details-section">
        <div className="section-title">
          <h2>Sensor History</h2>
          <p>Environmental readings collected over time.</p>
        </div>

        {history.length === 0 ? (
          <div className="clean-empty-state">
            <div className="empty-icon">◌</div>
            <h3>Waiting for sensor data</h3>
            <p>
              Readings for container {container.containerId || id} will
              appear here when available.
            </p>
          </div>
        ) : (
          <div className="sensor-history-list">
            {history.slice(0, 10).map((item, index) => (
              <div
                className="sensor-history-row"
                key={item._id || item.timestamp || index}
              >
                <div>
                  <strong>
                    {item.temperature ?? "--"} °C
                  </strong>
                  <span>
                    {item.humidity ?? "--"} % humidity
                  </span>
                </div>

                <div>
                  <span>
                    Battery: {item.battery ?? "--"}%
                  </span>
                  <span>{formatTimestamp(item.timestamp)}</span>
                </div>

                <span
                  className={`status-badge status-${String(
                    item.status || "waiting"
                  ).toLowerCase()}`}
                >
                  {item.status || "WAITING"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="details-section">
        <div className="section-title">
          <h2>Timeline</h2>
          <p>Important events for this container.</p>
        </div>

        <div className="simple-timeline">
          <div className="timeline-row">
            <span className="timeline-dot" />
            <div>
              <strong>Container Created</strong>
              <p>{formatTimestamp(container.createdAt)}</p>
            </div>
          </div>

          <div className="timeline-row">
            <span className="timeline-dot" />
            <div>
              <strong>Sensor Monitoring</strong>
              <p>
                {reading
                  ? `Receiving readings — latest ${formatTimestamp(
                      reading.timestamp
                    )}`
                  : "Waiting for sensor data"}
              </p>
            </div>
          </div>

          <div className="timeline-row">
            <span className="timeline-dot" />
            <div>
              <strong>AI Freshness Prediction</strong>
              <p>Waiting for AI prediction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContainerDetails;
