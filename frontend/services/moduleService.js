const MOCK_API_ENABLED = false;
const BASE_URL = "http://127.0.0.1:5000";

export async function fetchModules() {
  if (MOCK_API_ENABLED) {
    return fetch("/frontend/public/mock-data/modules.json").then((res) =>
      res.json()
    );
  } else {
    const response = await fetch(`${BASE_URL}/api/module`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch modules");
    return response.json();
  }
}


export async function createModule(name, description) {
  if (MOCK_API_ENABLED) {
    return { mcode: "M1243", message: "Mock module created" };
  } else {
    const response = await fetch(`${BASE_URL}/api/module`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
      body: JSON.stringify({ name, description }),
    });

    const result = await response.json();

    // Log details to debug
    console.log("Response status:", response.status);
    console.log("Response body:", result);

    if (!response.ok) {
      throw new Error(result.message || "Failed to create module");
    }

    return result;
  }
}
