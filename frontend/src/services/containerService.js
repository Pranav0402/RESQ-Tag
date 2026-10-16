const API_URL = "http://localhost:5000/api";

export async function getContainers() {
  const response = await fetch(`${API_URL}/containers`);

  if (!response.ok) {
    throw new Error("Failed to fetch containers");
  }

  return await response.json();
}

export async function getContainerById(containerId) {
  const response = await fetch(
    `${API_URL}/containers/${containerId}`
  );

  if (!response.ok) {
    throw new Error("Container not found");
  }

  return await response.json();
}

export async function addContainer(container) {
  const response = await fetch(`${API_URL}/containers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(container),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create container");
  }

  return data;
}