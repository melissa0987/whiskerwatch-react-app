import axios from "axios";

const API_URL = "http://localhost:8080/api"; // adjust if deployed

const apiService = {
  signup: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users`, userData);
      return response.data;
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      // Do you actually have a login endpoint? If not, we’ll need to handle authentication differently
      const response = await axios.post(`${API_URL}/users/login`, { email, password });
      return response.data;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default apiService;
