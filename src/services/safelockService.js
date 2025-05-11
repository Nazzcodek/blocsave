import api from "./api";

/**
 * Service for managing safelock functionality
 */
const safelockService = {
  /**
   * Get safelock data including active safelocks, completed safelocks, and transactions
   * @returns {Promise} Promise with safelock data
   */
  getSafelockData: async () => {
    try {
      const response = await api.get("/safelocks");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch safelock data" }
      );
    }
  },

  /**
   * Create a new safelock
   * @param {Object} safelockData - Safelock creation data
   * @param {number} safelockData.amount - Amount to lock
   * @param {number} safelockData.duration - Duration in days
   * @param {string} safelockData.title - Title of the safelock
   * @param {string} [safelockData.description] - Description of the safelock
   * @returns {Promise} Promise with created safelock data
   */
  createSafelock: async (safelockData) => {
    try {
      const response = await api.post("/safelocks", safelockData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create safelock" };
    }
  },

  /**
   * Break an existing safelock (withdraw early)
   * @param {string} safelockId - ID of the safelock to break
   * @returns {Promise} Promise with broken safelock data
   */
  breakSafelock: async (safelockId) => {
    try {
      const response = await api.post(`/safelocks/${safelockId}/break`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to break safelock" };
    }
  },
};

export default safelockService;
