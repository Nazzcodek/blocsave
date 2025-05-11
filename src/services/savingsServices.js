import api from "./api";

/**
 * Service for managing savings products functionality
 */
const savingsService = {
  /**
   * Get all available savings products
   * @returns {Promise} Promise with savings products data
   */
  getSavingsProducts: async () => {
    try {
      const response = await api.get("/savings/products");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch savings products" }
      );
    }
  },

  /**
   * Make a quicksave deposit
   * @param {number} amount - Amount to save
   * @returns {Promise} Promise with quicksave response
   */
  quickSave: async (amount) => {
    try {
      const response = await api.post("/savings/quicksave", { amount });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to quicksave" };
    }
  },

  /**
   * Withdraw from quicksave
   * @param {number} amount - Amount to withdraw
   * @returns {Promise} Promise with quicksave withdrawal response
   */
  withdrawQuickSave: async (amount) => {
    try {
      const response = await api.post("/savings/quicksave/withdraw", {
        amount,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to withdraw from quicksave" }
      );
    }
  },

  /**
   * Create a new safelock
   * @param {Object} data - Safelock creation data
   * @param {number} data.amount - Amount to lock
   * @param {number} data.duration - Duration in days
   * @param {string} data.title - Title of the safelock
   * @returns {Promise} Promise with safelock creation response
   */
  createSafeLock: async (data) => {
    try {
      const response = await api.post("/savings/safelock", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create safelock" };
    }
  },

  /**
   * Get all user's safelocks
   * @returns {Promise} Promise with safelocks data
   */
  getSafeLocks: async () => {
    try {
      const response = await api.get("/savings/safelock");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch safelocks" };
    }
  },

  /**
   * Break a safelock before maturity
   * @param {string} id - Safelock ID to break
   * @returns {Promise} Promise with broken safelock response
   */
  breakSafeLock: async (id) => {
    try {
      const response = await api.delete(`/savings/safelock/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to break safelock" };
    }
  },

  /**
   * Create a new adashe savings
   * @param {Object} data - Adashe creation data
   * @param {number} data.amount - Initial amount to save
   * @param {string} data.frequency - Saving frequency
   * @param {string} data.title - Title of the adashe
   * @returns {Promise} Promise with adashe creation response
   */
  createAdSavings: async (data) => {
    try {
      const response = await api.post("/savings/adashe", data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to create adashe savings" }
      );
    }
  },

  /**
   * Get all user's adashe savings
   * @returns {Promise} Promise with adashe savings data
   */
  getAdSavings: async () => {
    try {
      const response = await api.get("/savings/adashe");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch adashe savings" }
      );
    }
  },

  /**
   * Get user's savings activity history
   * @returns {Promise} Promise with activity history data
   */
  getActivityHistory: async () => {
    try {
      const response = await api.get("/savings/activity");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch activity history" }
      );
    }
  },

  /**
   * Get savings statistics
   * @returns {Promise} Promise with savings statistics data
   */
  getStatistics: async () => {
    try {
      const response = await api.get("/savings/statistics");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch savings statistics",
        }
      );
    }
  },

  /**
   * Withdraw from adashe savings
   * @param {string} id - Adashe ID
   * @param {number} amount - Amount to withdraw
   * @returns {Promise} Promise with adashe withdrawal response
   */
  withdrawAdSavings: async (id, amount) => {
    try {
      const response = await api.post(`/savings/adashe/${id}/withdraw`, {
        amount,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to withdraw from adashe" }
      );
    }
  },
};

export default savingsService;
