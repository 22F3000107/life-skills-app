const MOCK_API_ENABLED = false;
const BASE_URL = "http://127.0.0.1:5000";

export async function fetchConcepts() {
  const response = await fetch(`${BASE_URL}/api/concept`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch concepts");
  return response.json();
}

export async function createConcept(data) {
  const response = await fetch(`${BASE_URL}/api/concept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  // Log details to debug
  console.log("Response status:", response.status);
  console.log("Response body:", result);

  if (!response.ok) {
    throw new Error(result.message || "Failed to create concept");
  }

  return result;
}

export async function fetchConceptById(id) {
  const res = await fetch(`${BASE_URL}/api/concept/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
    },
  });
  if (!res.ok) throw new Error("Concept not found");
  return res.json();
}

export async function patchConceptById(id, data) {
  const res = await fetch(`${BASE_URL}/api/concept/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update concept");
  return res.json();
}

export async function addQuestionsToConcepts(id, questions) {
  const res = await fetch(`${BASE_URL}/api/concept/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
    },
    body: JSON.stringify({
      flag: "add_question",
      question_ids: questions.map((q) => q.id),
    }),
  });

  if (!res.ok) throw new Error("Failed to add questions to concept");
  return res.json();
}

export async function removeQuestionFromConcept(conceptId, questionId) {
  const res = await fetch(`${BASE_URL}/api/concept/${conceptId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
    },
    body: JSON.stringify({ flag: "remove_question", question_id: questionId }),
  });

  if (!res.ok) throw new Error("Failed to remove question from concept");
  return res.json();
}
