const MOCK_API_ENABLED = true;
const BASE_URL = "http://localhost:5001";

// 1. Fetch All Questions
export async function fetchAllQuestions() {
  if (MOCK_API_ENABLED) {
    return fetch("/public/mock-data/questions.json").then((res) => res.json());
  } else {
    const res = await fetch(`${BASE_URL}/api/questions`);
    if (!res.ok) throw new Error("Failed to fetch questions");
    return res.json();
  }
}

// 2. Fetch a Single Question by qcode
export async function fetchQuestionById(qcode) {
  if (MOCK_API_ENABLED) {
    const all = await fetch("/public/mock-data/questions.json").then((res) =>
      res.json()
    );
    const found = all.find((q) => q.qcode === qcode);
    if (!found) throw new Error("Mock question not found");
    return found;
  } else {
    const res = await fetch(`${BASE_URL}/api/questions/${qcode}`);
    if (!res.ok) throw new Error("Question not found");
    return res.json();
  }
}

// 3. Create a New Question
let mockQuestions = [];

export async function createQuestion(data) {
  if (MOCK_API_ENABLED) {
    // Simulate fetching current mock data once if not already loaded

    const all = await fetch("/public/mock-data/questions.json").then((res) =>
      res.json()
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
    const res = await fetch(`${BASE_URL}/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch(`${BASE_URL}/api/questions/${qcode}/archive`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to archive question");
    return res.json();
  }
}

// 5. Fetch Questions by Module Code
export async function fetchQuestionsByModule(mcode) {
  console.log("Fetching questions for module:", mcode);
  if (MOCK_API_ENABLED) {
    const res = await fetch("/public/mock-data/questionsByModule.json");
    const allQuestions = await res.json();
    return allQuestions.filter((q) => q.mcode === mcode);
  } else {
    const res = await fetch(`${BASE_URL}/api/module/${mcode}/questions`);
    if (!res.ok) throw new Error("Failed to fetch questions");
    return res.json();
  }
}
