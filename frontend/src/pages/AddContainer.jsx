import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addContainer } from "../services/containerService";

function AddContainer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    containerId: "",
    name: "",
    product: "",
    location: "",
  });

  const [error, setError] = useState("");

  async function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (
      !formData.containerId ||
      !formData.name ||
      !formData.product ||
      !formData.location
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await addContainer(formData);

      navigate("/containers");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Add Container</h1>
          <p>Create a new ResQ-TAG monitored container.</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Container ID</label>

            <input
              type="text"
              name="containerId"
              placeholder="Example: RESQ001"
              value={formData.containerId}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Container Name</label>

            <input
              type="text"
              name="name"
              placeholder="Example: Mango Batch A"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Product</label>

            <input
              type="text"
              name="product"
              placeholder="Example: Mango"
              value={formData.product}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Location</label>

            <input
              type="text"
              name="location"
              placeholder="Example: Cold Storage 01"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
          >
            Create Container
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddContainer;