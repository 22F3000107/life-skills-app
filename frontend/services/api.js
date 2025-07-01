// services/api.js
import axios from "axios";

const BASE_URL = "YOUR_API_BASE_URL";

export const questionService = {
  async getQuestions(params) {
    try {
      const response = await axios.get(`${BASE_URL}/questions`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  },

  async getQuestionById(id) {
    try {
      const response = await axios.get(`${BASE_URL}/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching question:", error);
      throw error;
    }
  },

  // Add other API methods as needed
};
