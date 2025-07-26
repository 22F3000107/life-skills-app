const MOCK_API_ENABLED = false;
const BASE_URL = "http://127.0.0.1:5000";

// 1. Fetch All Questions
export async function fetchAllQuestions() {
  if (MOCK_API_ENABLED) {
    return fetch("/frontend/public/mock-data/questions.json").then((res) =>
      res.json()
    );
  } else {
    const res = await fetch(`${BASE_URL}/api/question`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch questions");
    return res.json();
  }
}

// 2. Fetch a Single Question by qcode
export async function fetchQuestionById(qcode) {
  if (MOCK_API_ENABLED) {
    const all = await fetch("/frontend/public/mock-data/questions.json").then(
      (res) => res.json()
    );
    const found = all.find((q) => q.qcode === qcode);
    if (!found) throw new Error("Mock question not found");
    return found;
  } else {
    const res = await fetch(`${BASE_URL}/api/question/${qcode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
    });
    if (!res.ok) throw new Error("Question not found");
    return res.json();
  }
}

// 3. Create a New Question
let mockQuestions = [];

export async function createQuestion(data) {
  if (MOCK_API_ENABLED) {
    // Simulate fetching current mock data once if not already loaded

    const all = await fetch("/frontend/public/mock-data/questions.json").then(
      (res) => res.json()
    );
    mockQuestions = [...all];

    // Push new question to in-memory list
    mockQuestions.push(data);

    // Log it for debugging
    console.log("Mock created - added question:", data);

    return {
      message: "Mock question created successfully",
      data,
    };
  } else {
    const res = await fetch(`${BASE_URL}/api/question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create question");
    return res.json();
  }
}

// 4. Archive a Question by qcode
export async function archiveQuestion(qcode) {
  if (MOCK_API_ENABLED) {
    console.log(`Mock archive for question ${qcode}`);
    return { message: `Mock question ${qcode} archived` };
  } else {
    const res = await fetch(`${BASE_URL}/api/question/${qcode}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
    });
    if (!res.ok) throw new Error("Failed to archive question");
    return res.json();
  }
}

// 5. Fetch Questions by Module Code
export async function fetchQuestionsByModule(mcode) {
  console.log("Fetching questions for module:", mcode);
  if (MOCK_API_ENABLED) {
    const res = await fetch(
      "/frontend/public/mock-data/questionsByModule.json"
    );
    const allQuestions = await res.json();
    return allQuestions.filter((q) => q.mcode === mcode);
  } else {
    const res = await fetch(`${BASE_URL}/api/module/${mcode}/questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch questions");
    return res.json();
  }
}

// 6. edit a Question by qcode
export async function updateQuestion(qcode, data) {
  if (MOCK_API_ENABLED) {
    console.log(`Mock edit for question ${qcode}`);
    return { message: `Mock question ${qcode} editted` };
  } else {
    const res = await fetch(`${BASE_URL}/api/question/${qcode}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
    });
    if (!res.ok) throw new Error("Failed to archive question");
    return res.json();
  }
}

// 7. Update Question Status
export async function updateQuestionStatus(qcode, statusData) {
  if (MOCK_API_ENABLED) {
    console.log(`Mock status update for question ${qcode}:`, statusData);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
    return {
      message: `Question ${qcode} status updated to ${statusData.status}`,
      qcode: qcode,
      status: statusData.status,
      review_comment: statusData.review_comment,
      reviewer: statusData.reviewer,
      review_date: statusData.review_date,
    };
  } else {
    const res = await fetch(`${BASE_URL}/api/question/${qcode}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(statusData),
    });

    if (!res.ok) throw new Error("Failed to update question status");
    return res.json();
  }
}

// Restore an archived question
export async function restoreQuestion(qcode, restoreData) {
  if (MOCK_API_ENABLED) {
    console.log(`Mock restore for question ${qcode}:`, restoreData);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
    return {
      message: `Question ${qcode} restored successfully`,
      qcode: qcode,
      status: "Draft",
      restored_by: restoreData.restored_by,
      restored_date: restoreData.restored_date,
      restore_comment: restoreData.restore_comment,
    };
  } else {
    const res = await fetch(`${BASE_URL}/api/question/${qcode}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
    });
    if (!res.ok) throw new Error("Failed to unarchive question");
    return res.json();
  }
}

// Permanently delete a question
export async function deleteQuestion(qcode) {
  if (MOCK_API_ENABLED) {
    console.log(`Mock permanent delete for question ${qcode}`);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
    return { message: `Question ${qcode} permanently deleted` };
  } else {
    const res = await fetch(`${BASE_URL}/api/question/${qcode}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
    });
    if (!res.ok) throw new Error("Failed to delete question");
    return res.json();
  }
}

// Get archive statistics
export async function getArchiveStatistics() {
  if (MOCK_API_ENABLED) {
    return {
      total: 45,
      thisMonth: 12,
      thisYear: 38,
      byReason: {
        "Outdated Content": 15,
        Duplicate: 8,
        "Low Quality": 12,
        "Policy Change": 6,
        Other: 4,
      },
    };
  } else {
    const res = await fetch(`${BASE_URL}/api/question/archive/statistics`);
    if (!res.ok) throw new Error("Failed to fetch archive statistics");
    return res.json();
  }
}
