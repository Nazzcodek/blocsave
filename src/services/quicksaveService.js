import api from "./api";

const quicksaveService = {
  /**
   * Get user's quicksave balance
   * @returns {Promise} Promise with balance data
   */
  getBalance: async () => {
    try {
      const response = await api.get(`/quicksave/balance`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch balance" };
    }
  },

  /**
   * Get user's quicksave transactions
   * @returns {Promise} Promise with transactions data
   */
  getTransactions: async () => {
    try {
      const response = await api.get(`/quicksave/transactions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch transactions" };
    }
  },

  /**
   * Get user's wallet balance
   * @returns {Promise} Promise with wallet balance data
   */
  getWalletBalance: async () => {
    try {
      const response = await api.get(`/wallet/balance`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch wallet balance" }
      );
    }
  },

  /**
   * Save money to quicksave
   * @param {number} amount - Amount to save
   * @returns {Promise} Promise with save response
   */
  save: async (amount) => {
    try {
      const response = await api.post(`/quicksave/save`, { amount });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to save to quicksave" };
    }
  },

  /**
   * Withdraw money from quicksave
   * @param {number} amount - Amount to withdraw
   * @returns {Promise} Promise with withdraw response
   */
  withdraw: async (amount) => {
    try {
      const response = await api.post(`/quicksave/withdraw`, {
        amount,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to withdraw from quicksave" }
      );
    }
  },
};

export default quicksaveService;
