const MOCK_API_ENABLED = false;
const BASE_URL = "http://127.0.0.1:5000";

export async function fetchAcadHomeModules() {
  if (MOCK_API_ENABLED) {
    const res = await fetch("/frontend/public/mock-data/acadHomeModules.json");
    return res.json();
  } else {
    const res = await fetch(`${BASE_URL}/api/module`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch modules");
    return res.json();
  }
}

