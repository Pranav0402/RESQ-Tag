import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Container,
  Plus,
  Thermometer,
  Wifi,
} from "lucide-react";

import { getContainers } from "../services/containerService";

function Dashboard() {
  const navigate = useNavigate();
  const [containers, setContainers] = useState([]);

  useEffect(() => {
  async function loadContainers() {
    try {
      const data = await getContainers();

      setContainers(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to load containers:",
        error
      );

      setContainers([]);
    }
  }

  loadContainers();
}, []);

  const safeCount = containers.filter(
    (container) => container.status === "SAFE"
  ).length;

  const warningCount = containers.filter(
    (container) => container.status === "WARNING"
  ).length;

  const criticalCount = containers.filter(
    (container) => container.status === "CRITICAL"
  ).length;

  const activeCount = containers.filter(
    (container) => container.status === "ACTIVE"
  ).length;

  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            RESQ-TAG MONITORING SYSTEM
          </span>

          <h1>Dashboard</h1>

          <p>
            Monitor container conditions and food freshness in real time.
          </p>
        </div>

        <button
          className="dashboard-add-button"
          onClick={() => navigate("/containers/new")}
        >
          <Plus size={18} />
          Add Container
        </button>
      </div>

      {/* SYSTEM STATUS */}
      <div className="system-status-card">
        <div className="system-status-left">
          <div className="system-status-icon">
            <Activity size={22} />
          </div>

          <div>
            <span>System Status</span>
            <h3>Monitoring System Online</h3>
            <p>
              Ready to receive ESP32 sensor readings.
            </p>
          </div>
        </div>

        <div className="system-online">
          <span className="online-dot"></span>
          ONLINE
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="dashboard-stats">

        <div className="stat-card">
          <div className="stat-icon containers-icon">
            <Container size={20} />
          </div>

          <div className="stat-content">
            <span>Total Containers</span>
            <strong>{containers.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon safe-icon">
            <CheckCircle2 size={20} />
          </div>

          <div className="stat-content">
            <span>Safe</span>
            <strong>{safeCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning-icon">
            <AlertTriangle size={20} />
          </div>

          <div className="stat-content">
            <span>Warning</span>
            <strong>{warningCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon critical-icon">
            <AlertTriangle size={20} />
          </div>

          <div className="stat-content">
            <span>Critical</span>
            <strong>{criticalCount}</strong>
          </div>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className="dashboard-main-grid">

        {/* CONTAINERS */}
        <section className="dashboard-section containers-section">

          <div className="section-header">
            <div>
              <h2>Monitored Containers</h2>
              <p>
                {containers.length} container
                {containers.length !== 1 ? "s" : ""} registered
              </p>
            </div>

            <button
              className="text-button"
              onClick={() => navigate("/containers")}
            >
              View all
              <ChevronRight size={16} />
            </button>
          </div>

          {containers.length === 0 ? (
            <div className="dashboard-empty">
              <Container size={32} />

              <h3>No containers yet</h3>

              <p>
                Add your first monitored container to begin.
              </p>

              <button
                className="dashboard-add-button"
                onClick={() => navigate("/containers/new")}
              >
                <Plus size={17} />
                Add Container
              </button>
            </div>
          ) : (
            <div className="container-list">

              {containers.slice(0, 5).map((container) => {

                const status =
                  container.status || "ACTIVE";

                return (
                  <div
                    className="container-row"
                    key={container.containerId}
                  >

                    <div className="container-info">

                      <div className="container-symbol">
                        <Container size={19} />
                      </div>

                      <div>
                        <strong>
                          {container.name}
                        </strong>

                        <span>
                          {container.containerId} ·{" "}
                          {container.product}
                        </span>
                      </div>

                    </div>

                    <div className="container-location">
                      {container.location}
                    </div>

                    <div>
                      <span
                        className={`status-badge status-${status.toLowerCase()}`}
                      >
                        <span></span>
                        {status}
                      </span>
                    </div>

                    <button
                      className="row-arrow"
                      onClick={() =>
                        navigate(
                          `/containers/${container.containerId}`
                        )
                      }
                    >
                      <ChevronRight size={18} />
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </section>

        {/* MONITORING SUMMARY */}
        <section className="dashboard-section monitoring-section">

          <div className="section-header">
            <div>
              <h2>Live Monitoring</h2>
              <p>ESP32 sensor network</p>
            </div>

            <Wifi size={21} />
          </div>

          <div className="monitoring-status">

            <div className="monitoring-circle">
              <Thermometer size={26} />
            </div>

            <div>
              <span className="monitoring-label">
                SENSOR CONNECTION
              </span>

              <h3>Waiting for ESP32</h3>

              <p>
                Sensor readings will appear here
                when the simulator connects.
              </p>
            </div>

          </div>

          <div className="monitoring-footer">

            <div>
              <span>Active containers</span>
              <strong>{activeCount}</strong>
            </div>

            <div>
              <span>Recording interval</span>
              <strong>10 min</strong>
            </div>

          </div>

          <button
            className="monitoring-button"
            onClick={() => navigate("/monitoring")}
          >
            Open Live Monitoring
            <ChevronRight size={17} />
          </button>

        </section>

      </div>

    </div>
  );
}

export default Dashboard;