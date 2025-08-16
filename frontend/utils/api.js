const BASE_URL = "http://127.0.0.1:5000/api"; 

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

// Helper function for PUT requests
async function putData(url = '', data = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    method: "PUT",
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
// async function getData(url = '', token = null) {
//   const headers = {
//     "Content-Type": "application/json",
//   };

//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }

//   const response = await fetch(`${BASE_URL}${url}`, {
//     method: "GET",
//     headers,
//   });

//   const json = await response.json();
//   if (!response.ok) {
//     throw new Error(json.error || "API error");
//   }
//   return json;
// }
async function getData(url = '', token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "GET",
      headers,
    });

    const json = await response.json();
    if (!response.ok) {
      console.error("API error response:", json);
      throw new Error(json.error || "API error");
    }
    return json;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
}


// Auth APIs
export async function loginUser(payload) {
  return await postData("/login", payload);
}

export async function registerUser(payload) {
  return await postData("/register/user", payload);
}


// =======================
// User APIs (with token)
// =======================

export async function getUserProfile() {
  const token = localStorage.getItem("auth-token");
  console.log("Token used in getUserProfile():", token);
  return await getData("/user/profile", token);
}

export async function getTodayHabits() {
  const token = localStorage.getItem("auth-token");
  return await getData("/habits/today", token);
}

export async function submitHabits(habitsPayload) {
  const token = localStorage.getItem("auth-token");
  return await postData("/habits/submit", habitsPayload, token);
}

export async function getWeeklyGoals() {
  const token = localStorage.getItem("auth-token");
  return await getData("/weekly/goals", token);
}

export async function addGoal(payload) {
  const token = localStorage.getItem("auth-token");
  return await postData("/add/goals", payload, token);
}

export async function updateGoalStatus(goalId, payload) {
  const token = localStorage.getItem("auth-token");
  return await fetch(`${BASE_URL}/goals/${goalId}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  }).then(res => res.json());
}

export async function getQuizList(token) {
  return await getData("/quizzes", token);
}

export async function getQuizById(quizId, token) {
  return await getData(`/quiz/${quizId}`, token);
}

export async function submitQuiz(quizId, answers, token) {
  return await postData(`/quiz/${quizId}/submit`, { answers }, token);
}


export async function getUserSummary(token) {
  return await getData("/user/summary", token);
}

// export async function getUserProfile(token) {
//   return await getData("/user-profile", token);
// }

export async function updateUserProfile(payload, token) {
  return await putData("/user/profile", payload, token);
}

export async function changePassword(payload, token) {
  return await putData("/change-password", payload, token);
}
export async function getStoriesList(token) {
  const response = await fetch('/api/stories', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
}


// =======================
// Admin APIs
// =======================

// Fetch Admin Statistics (uses JWT)
export async function fetchAdminStats() {
  const token = localStorage.getItem("auth-token");
  return await getData("/admin/stats", token);
}

// Register a new Academic Member
export async function registerAcademicUser(payload) {
  return await postData("/register/academic", payload);
}


export async function getAllUsers() {
  const token = localStorage.getItem("auth-token");
  return await getData("/admin/users", token);
}

export async function blockUser(userId) {
  const token = localStorage.getItem("auth-token");
  return await fetch(`${BASE_URL}/admin/user/${userId}/block`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }).then(res => res.json());
}

export async function unblockUser(userId) {
  const token = localStorage.getItem("auth-token");
  return await fetch(`${BASE_URL}/admin/user/${userId}/unblock`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }).then(res => res.json());
}

export async function deleteUser(userId) {
  const token = localStorage.getItem("auth-token");
  return await fetch(`${BASE_URL}/admin/user/${userId}/delete`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(res => res.json());
}


export async function getAllStories(token) {
  return await getData("/admin/stories", token);
}

export async function updateStoryStatus(storyId, status, token) {
  return await fetch(`${BASE_URL}/admin/story/${storyId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  }).then(res => res.json());
}

export async function updateStoryStatusWithReason(storyId, status, reason, token) {
  return await fetch(`${BASE_URL}/admin/story/${storyId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status, flag_reason: reason })
  }).then(res => res.json());
}


export async function deleteStory(storyId, token) {
  return await fetch(`${BASE_URL}/admin/story/${storyId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }).then(res => res.json());
}

export async function getAdminQuizzes(token) {
  return await getData("/admin/quizzes", token);
}

// export async function updateQuiz(id, payload) {
//   const token = localStorage.getItem("auth-token");
//   return await fetch(`${BASE_URL}/admin/update-quiz/${id}`, {
//     method: 'PUT',
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${token}`
//     },
//     body: JSON.stringify(payload)
//   }).then(res => res.json());
// }
export async function updateQuiz(quizId, payload) {
  const token = localStorage.getItem("auth-token");
  return await putData(`/admin/update-quiz/${quizId}`, payload, token);
}


export async function deleteQuizById(id) {
  const token = localStorage.getItem("auth-token");
  return await fetch(`${BASE_URL}/admin/delete-quiz/${id}`, {
    method: 'DELETE',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }).then(res => res.json());
}

export async function getFlaggedContent(token) {
  return await getData("/admin/flagged-content", token);
}

export async function unflagContent(type, id, token) {
  return await fetch(`${BASE_URL}/admin/unflag/${type}/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }).then(res => res.json());
}

export async function deleteFlaggedContent(type, id, token) {
  return await fetch(`${BASE_URL}/admin/delete-flagged/${type}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }).then(res => res.json());
}

export async function getAdminOverviewStats(token) {
  return await getData("/admin/stats-overview", token);
}

export async function getQuizAttemptsByRange(range, token) {
  return await getData(`/admin/quiz-attempts?range=${range}`, token);
}

export async function getSkillEngagement(token) {
  return await getData("/admin/skill-engagement", token);
}

export async function getAdminSettings() {
  const token = localStorage.getItem("auth-token");
  return await getData("/admin/settings", token);
}


export async function updateAdminSettings(payload) {
  const token = localStorage.getItem("auth-token");
  return await putData("/admin/settings", payload, token);
}

// export async function getReminderSettings(token) {
//   return await getData("/admin/reminder-settings", token);
// }

// export async function saveReminderSettings(data, token) {
//   return await postData("/admin/reminder-settings", data, token);
// }
export async function saveWeeklyReminderSettings(data, token) {
  return await putData("/admin/WeeklyReminder", data, token); 
}

export async function saveInactiveReminderSettings(data, token) {
  return await putData("/admin/InactiveReminder", data, token); // PUT
}

export async function changeAdminPassword(payload, token) {
  return await putData("/admin/change-password", payload, token);
}



// ========== Module APIs ==========
export async function getModules(token) {
  return await getData("/admin/modules", token);  
}

export async function createModule(payload, token) {
  return await postData("/admin/modules", payload, token);
}

export async function updateModule(id, payload, token) {
  return await putData(`/admin/modules/${id}`, payload, token);
}

export async function deleteModule(id, token) {
  return await fetch(`${BASE_URL}/admin/modules/${id}`, {
    method: 'DELETE',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }).then(res => res.json());
}

// ACADEMIC APIs


export async function createAcademicStory(payload) {
  const token = localStorage.getItem("auth-token");
  return await postData("/academic/story", payload, token);
}

export async function createAcademicQuiz(payload) {
  const token = localStorage.getItem("auth-token");
  return await postData("/academic/quiz", payload, token);
}

export async function getAcademicQuiz(quizId, token) {
  return await getData(`/academic/quiz/${quizId}`, token);
}

export async function updateAcademicQuiz(quizId, payload, token) {
  return await putData(`/academic/quiz/${quizId}`, payload, token);
}

export async function deleteAcademicQuiz(quizId, token) {
  return await fetch(`${BASE_URL}/academic/quiz/${quizId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }).then(res => res.json());
}