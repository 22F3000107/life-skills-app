const MOCK_API_ENABLED = true;

export async function fetchModules() {
  if (MOCK_API_ENABLED) {
    return fetch("/mock-data/modules.json").then((res) => res.json());
  } else {
    const BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5500";
    const response = await fetch(`${BASE_URL}/api/modules`);
    if (!response.ok) throw new Error("Failed to fetch modules");
    return response.json();
  }
}


export async function createModule(name,description) {
  if (MOCK_API_ENABLED) {
    return { mcode: "M1243", message: "Mock module created" };
  } else {
    const BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5500";
    const response = await fetch(`${BASE_URL}/api/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name ,description}),
    });
    if (!response.ok) throw new Error("Failed to create module");
    return response.json();
  }
}
