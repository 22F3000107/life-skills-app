const BASE_URL = "http://localhost:5000/api"; // Change if deployed

// Helper function for standard POST requests
async function postData(url = '', data = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || "API error");
  }
  return json;
}

// Helper function for GET requests
async function getData(url = '', token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    method: "GET",
    headers,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || "API error");
  }
  return json;
}

// Auth APIs
export async function loginUser(payload) {
  return await postData("/login", payload);
}

export async function registerUser(payload) {
  return await postData("/register", payload);
}


// =======================
// User APIs (with token)
// =======================

export async function getUserProfile() {
  const token = localStorage.getItem("auth-token");
  return await getData("/user-profile", token);
}

export async function getTodayHabits() {
  const token = localStorage.getItem("auth-token");
  return await getData("/today-habits", token);
}

export async function submitHabits(habitsPayload) {
  const token = localStorage.getItem("auth-token");
  return await postData("/submit-habits", habitsPayload, token);
}

export async function getWeeklyGoals() {
  const token = localStorage.getItem("auth-token");
  return await getData("/weekly-goals", token);
}

export async function addGoal(payload) {
  const token = localStorage.getItem("auth-token");
  return await postData("/add-goal", payload, token);
}

export async function updateGoalStatus(goalId, payload) {
  const token = localStorage.getItem("auth-token");
  return await fetch(`${BASE_URL}/update-goal-status/${goalId}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  }).then(res => res.json());
}
