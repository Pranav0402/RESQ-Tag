import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";
// With 10-second simulator posts, 30 seconds tolerates one missed post and one poll delay.
const FRESHNESS_THRESHOLD_MS = 30_000;
const POLL_INTERVAL_MS = 5_000;

function Monitoring() {
  const [reading, setReading] = useState(null);
  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastChecked, setLastChecked] = useState(null);
  const [now, setNow] = useState(null);

  const loadLatestReading = useCallback(async (signal) => {
    try {
      const [readingResponse, containersResponse] = await Promise.all([
        fetch(`${API_URL}/sensor-readings/latest`, { signal }),
        fetch(`${API_URL}/containers`, { signal }),
      ]);

      if (readingResponse.status === 404) {
        if (!containersResponse.ok) throw new Error("Unable to load registered containers.");
        const registered = await containersResponse.json();
        if (!Array.isArray(registered)) throw new Error("Invalid containers response.");
        setReading(null);
        setContainer(null);
        setError(registered.length ? "No sensor readings are available yet." : "No containers are registered yet.");
        setLastChecked(new Date());
        return;
      }
      if (!readingResponse.ok) throw new Error(`Sensor API returned HTTP ${readingResponse.status}.`);
      if (!containersResponse.ok) throw new Error(`Container API returned HTTP ${containersResponse.status}.`);

      const [latest, containers] = await Promise.all([
        readingResponse.json(),
        containersResponse.json(),
      ]);
      if (!latest || typeof latest !== "object" || Array.isArray(latest) ||
          !latest.containerId || latest.temperature == null || latest.humidity == null ||
          !latest.timestamp || Number.isNaN(new Date(latest.timestamp).getTime())) {
        throw new Error("The latest sensor response is invalid.");
      }
      if (!Array.isArray(containers)) throw new Error("The containers response is invalid.");

      setReading(latest);
      setContainer(containers.find((item) => item.containerId === latest.containerId) || null);
      setError("");
      setLastChecked(new Date());
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Monitoring error:", err);
      setError(err.message || "Unable to connect to the sensor backend.");
      setLastChecked(new Date());
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let inFlight = false;

    const poll = async () => {
      if (!active || inFlight) return;
      inFlight = true;
      try {
        await loadLatestReading(controller.signal);
      } finally {
        inFlight = false;
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    const freshnessTimer = setInterval(() => setNow(Date.now()), 1_000);
    return () => {
      active = false;
      controller.abort();
      clearInterval(interval);
      clearInterval(freshnessTimer);
    };
  }, [loadLatestReading]);

  function formatTimestamp(timestamp) {
    if (!timestamp) return "--";
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? "--" : date.toLocaleString();
  }

  const timestamp = reading?.timestamp ? new Date(reading.timestamp) : null;
  const hasValidTimestamp = timestamp && !Number.isNaN(timestamp.getTime());
  const stale = hasValidTimestamp && now !== null && now - timestamp.getTime() > FRESHNESS_THRESHOLD_MS;
  const live = Boolean(reading && hasValidTimestamp && !stale && !error);
  const status = reading?.status || "WAITING";
  const connectionMessage = loading && !reading
    ? "Connecting to sensor backend…"
    : error || (stale
      ? `No new reading for over ${FRESHNESS_THRESHOLD_MS / 1000} seconds. Sensor may be disconnected.`
      : !reading
        ? "Waiting for the first sensor reading."
        : container
          ? `Receiving readings from ${reading.containerId}`
          : `Reading from unregistered container ${reading.containerId}`);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Live Monitoring</h1>
          <p>Monitor environmental conditions from ResQ-TAG containers in real time.</p>
        </div>
      </div>

      <div className="monitoring-connection">
        <div>
          <span className={`connection-dot ${live ? "online" : "offline"}`} />
          <strong>{live ? "Live sensor" : stale ? "Stale sensor data" : loading && !reading ? "Connecting" : error ? "Connection error" : "Waiting for sensor data"}</strong>
        </div>
        <span className="connection-text">{connectionMessage}</span>
      </div>

      <div className="section-title"><h2>Current Environment</h2></div>
      <div className="monitoring-grid">
        <div className="dashboard-card monitoring-card">
          <span className="card-label">Temperature</span>
          <div className="sensor-value">{reading ? reading.temperature : "--"}<span>°C</span></div>
          <p>{reading ? (stale ? "Last known reading · stale" : "Latest sensor reading") : "Waiting for sensor data"}</p>
        </div>
        <div className="dashboard-card monitoring-card">
          <span className="card-label">Humidity</span>
          <div className="sensor-value">{reading ? reading.humidity : "--"}<span>%</span></div>
          <p>{reading ? (stale ? "Last known reading · stale" : "Latest sensor reading") : "Waiting for sensor data"}</p>
        </div>
        <div className="dashboard-card monitoring-card">
          <span className="card-label">Battery</span>
          <div className="sensor-value">{reading?.battery ?? "--"}<span>%</span></div>
          <p>{reading ? "ESP32 battery level" : "Waiting for sensor data"}</p>
        </div>
        <div className="dashboard-card monitoring-card">
          <span className="card-label">Environment Status</span>
          <div className={`monitoring-status ${status === "WAITING" ? "" : status.toLowerCase()}`}>{status}</div>
          <p>{reading ? (stale ? "Last known condition · data is stale" : "Current environment condition") : "No reading received"}</p>
        </div>
      </div>

      <div className="section-title"><h2>Latest Sensor Reading</h2></div>
      <div className="dashboard-card">
        <div className="latest-reading">
          <div>
            <span className="card-label">Container</span>
            <strong>{container?.name || reading?.containerId || "--"}</strong>
            <p>{reading?.containerId || ""}{container?.product ? ` · ${container.product}` : reading && !container ? " · Not registered" : ""}</p>
          </div>
          <div><span className="card-label">Timestamp</span><strong>{formatTimestamp(reading?.timestamp)}</strong></div>
          <div><span className="card-label">Status</span><strong>{status}</strong></div>
        </div>
      </div>

      <div className="section-title"><h2>Monitoring Information</h2></div>
      <div className="dashboard-card monitoring-info">
        <p>Monitoring displays the newest reading received across all containers and resolves its registered name and product.</p>
        <p>Sensor data refreshes automatically every {POLL_INTERVAL_MS / 1000} seconds.</p>
        <p>Simulator readings are sent every 10 seconds. Data older than {FRESHNESS_THRESHOLD_MS / 1000} seconds is marked stale.</p>
        {lastChecked && <p>Last checked: {lastChecked.toLocaleTimeString()}</p>}
      </div>
    </div>
  );
}

export default Monitoring;
