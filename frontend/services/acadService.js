const MOCK_API_ENABLED = true;
const BASE_URL = "http://localhost:5000/api";

export async function fetchAcadHomeModules() {
  if (MOCK_API_ENABLED) {
    const res = await fetch("/frontend/public/mock-data/acadHomeModules.json");
    return res.json();
  } else {
    const res = await fetch(`${BASE_URL}/api/acad/home/modules`);
    if (!res.ok) throw new Error("Failed to fetch modules");
    return res.json();
  }
}
