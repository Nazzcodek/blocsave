import api from "./api";

const authService = {
  /**
   * Log in a user with credentials
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise} Promise with login response and token
   */
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response;
    } catch (error) {
      throw error.response?.data || { message: "Failed to login" };
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.name - User name
   * @returns {Promise} Promise with registration response and token
   */
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response;
    } catch (error) {
      throw error.response?.data || { message: "Failed to register" };
    }
  },

  /**
   * Log out the current user
   * @returns {Promise} Promise with logout success status
   */
  logout: async () => {
    try {
      localStorage.removeItem("token");
      return { success: true };
    } catch (error) {
      throw { message: "Failed to logout" };
    }
  },

  /**
   * Get the currently authenticated user data
   * @returns {Promise} Promise with current user data
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch user data" };
    }
  },

  /**
   * Update user profile information
   * @param {Object} userData - Updated user profile data
   * @returns {Promise} Promise with updated user profile
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put("/auth/profile", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update profile" };
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise} Promise with password change response
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.put("/auth/password", passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to change password" };
    }
  },
};

export default authService;
