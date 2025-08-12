// storyService.js
const API_BASE_URL = "http://127.0.0.1:5000";

// Helper to handle requests
async function request(url, options = {}) {
  const token = localStorage.getItem("auth-token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData || { message: response.statusText };
  }

  return response.json();
}

// Story Service Functions
export const storyService = {
  async fetchStories(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return request(`/api/acad/stories?${params}`);
  },

  async fetchStoryById(storyId) {
    return request(`/api/acad/stories/${storyId}`);
  },

  async updateStory(storyId, storyData) {
    return request(`/api/acad/stories/${storyId}`, {
      method: "PUT",
      body: JSON.stringify(storyData),
    });
  },

  async deleteStory(storyId) {
    return request(`/api/acad/stories/${storyId}`, { method: "DELETE" });
  },

  async fetchStoryByConceptId(conceptId) {
    return request(`/api/concepts/${conceptId}/story`);
  },

  async updateStoryStatus(storyId, status) {
    return request(`/api/acad/stories/${storyId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  async flagStory(storyId, flag, flagReason = null) {
    const payload = { flag };
    if (flag && flagReason) payload.flag_reason = flagReason;

    return request(`/api/acad/stories/${storyId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

// Quiz Service Functions
export const quizService = {
  async fetchQuizzes(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return request(`/api/acad/quizzes?${params}`);
  },

  async fetchQuizById(quizId) {
    return request(`/api/acad/quizzes/${quizId}`);
  },

  async updateQuiz(quizId, quizData) {
    return request(`/api/acad/quizzes/${quizId}`, {
      method: "PUT",
      body: JSON.stringify(quizData),
    });
  },

  async deleteQuiz(quizId) {
    return request(`/api/acad/quizzes/${quizId}`, { method: "DELETE" });
  },

  async fetchQuizByConceptId(conceptId) {
    return request(`/api/concepts/${conceptId}/quiz`);
  },

  async updateQuizStatus(quizId, status) {
    return request(`/api/acad/quizzes/${quizId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  async flagQuiz(quizId, flag, flagReason = null) {
    const payload = { flag };
    if (flag && flagReason) payload.flag_reason = flagReason;

    return request(`/api/acad/quizzes/${quizId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

// Combined service for concept-based operations
export const conceptContentService = {
  async fetchConceptContent(conceptId, type) {
    if (type === "story") {
      return storyService.fetchStoryByConceptId(conceptId);
    } else if (type === "quiz") {
      return quizService.fetchQuizByConceptId(conceptId);
    } else {
      throw new Error('Invalid content type. Must be "story" or "quiz".');
    }
  },

  async updateConceptContent(conceptId, type, contentData) {
    const content = await this.fetchConceptContent(conceptId, type);
    if (type === "story") {
      return storyService.updateStory(content.id, contentData);
    } else if (type === "quiz") {
      return quizService.updateQuiz(content.id, contentData);
    } else {
      throw new Error('Invalid content type. Must be "story" or "quiz".');
    }
  },
};

// Utility functions remain unchanged
export const contentUtils = {
  getContentIcon(type) {
    return type === "quiz" ? "bi-question-circle-fill" : "bi-book-fill";
  },
  getContentColor(type) {
    return type === "quiz" ? "primary" : "info";
  },
  getStatusColor(status) {
    const colors = {
      draft: "secondary",
      published: "success",
      flagged: "danger",
    };
    return colors[status] || "secondary";
  },
  formatContent(content) {
    return {
      ...content,
      formatted_created_at: new Date(content.created_at).toLocaleDateString(),
      formatted_updated_at: new Date(content.updated_at).toLocaleDateString(),
      status_color: this.getStatusColor(content.status),
      type_icon: this.getContentIcon(content.concept?.type || "quiz"),
      type_color: this.getContentColor(content.concept?.type || "quiz"),
    };
  },
};

export default {
  storyService,
  quizService,
  conceptContentService,
  contentUtils,
};
