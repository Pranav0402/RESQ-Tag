import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Container as ContainerIcon, Eye } from "lucide-react";
import { getContainers } from "../services/containerService";

function Containers() {
  const navigate = useNavigate();

  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadContainers() {
      try {
        const data = await getContainers();
        setContainers(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        console.error("Failed to load containers:", err);
        setError(err.message || "Failed to load containers.");
      } finally {
        setLoading(false);
      }
    }

    loadContainers();
  }, []);

  return (
    <div className="containers-page">
      <div className="page-header">
        <div>
          <h1>Containers</h1>
          <p>Manage and monitor your registered food containers.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/containers/new")}
        >
          <Plus size={18} />
          Add Container
        </button>
      </div>

      {loading ? (
        <div className="clean-page-state">Loading containers...</div>
      ) : error ? (
        <div className="clean-page-state">
          <h3>Unable to load containers</h3>
          <p>{error}</p>
          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : containers.length === 0 ? (
        <div className="clean-empty-state">
          <ContainerIcon size={32} />
          <h3>No containers yet</h3>
          <p>Create your first container to start monitoring its conditions.</p>
          <button
            className="primary-button"
            onClick={() => navigate("/containers/new")}
          >
            <Plus size={18} />
            Add Container
          </button>
        </div>
      ) : (
        <div className="containers-table-wrapper">
          <table className="containers-table">
            <thead>
              <tr>
                <th>Container ID</th>
                <th>Product / Batch</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {containers.map((item) => {
                const status = item.status || "ACTIVE";

                return (
                  <tr key={item.containerId}>
                    <td>
                      <span className="container-id">
                        {item.containerId}
                      </span>
                    </td>

                    <td>
                      <div className="container-product-name">
                        {item.name || item.product || "Unnamed container"}
                      </div>
                      {item.name && item.product && item.name !== item.product && (
                        <div className="container-product-type">
                          {item.product}
                        </div>
                      )}
                    </td>

                    <td className="container-location">
                      {item.location || "—"}
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${String(
                          status
                        ).toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="container-view-button"
                        onClick={() =>
                          navigate(`/containers/${item.containerId}`)
                        }
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Containers;