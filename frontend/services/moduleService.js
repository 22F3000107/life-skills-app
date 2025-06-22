const MOCK_API_ENABLED = true;
const BASE_URL = "http://localhost:5001";

export async function fetchModules() {
if (MOCK_API_ENABLED) {
  return fetch("/public/mock-data/modules.json").then((res) => res.json());
} else {
  
  const response = await fetch(`${BASE_URL}/api/modules`);
  if (!response.ok) throw new Error("Failed to fetch modules");
  return response.json();
}
}

export async function createModule(name, description) {
if (MOCK_API_ENABLED) {
  return { mcode: "M1243", message: "Mock module created" };
} else {
  const response = await fetch(`${BASE_URL}/api/modules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  if (!response.ok) throw new Error("Failed to create module");
  return response.json();
}
}
