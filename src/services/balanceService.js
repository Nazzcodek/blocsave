import api from "./api";

const balanceService = {
  /**
   * Get user's wallet balance
   * @returns {Promise} Promise with wallet balance data
   */
  getWalletBalance: async () => {
    try {
      const response = await api.get("/balance/wallet");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch wallet balance" };
    }
  },

  /**
   * Get user's savings balance
   * @returns {Promise} Promise with savings balance data
   */
  getSavingsBalance: async () => {
    try {
      const response = await api.get("/balance/savings");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch savings balance" };
    }
  },

  /**
   * Fund user's account with specified amount
   * @param {number} amount - Amount to fund
   * @returns {Promise} Promise with funding response
   */
  fundAccount: async (amount) => {
    try {
      const response = await api.post("/balance/fund", { amount });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fund account" };
    }
  },

  /**
   * Withdraw funds to bank account
   * @param {Object} data - Withdrawal data
   * @param {number} data.amount - Amount to withdraw
   * @param {string} data.accountNumber - Bank account number
   * @param {string} data.bankCode - Bank code
   * @returns {Promise} Promise with bank withdrawal response
   */
  withdrawToBank: async (data) => {
    try {
      const response = await api.post("/balance/withdraw/bank", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to withdraw to bank" };
    }
  },

  /**
   * Withdraw funds from wallet
   * @param {number} amount - Amount to withdraw
   * @returns {Promise} Promise with wallet withdrawal response
   */
  withdrawFromWallet: async (amount) => {
    try {
      const response = await api.post("/balance/withdraw/wallet", { amount });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to withdraw from wallet" };
    }
  },

  /**
   * Get user's transaction history
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date for transaction history
   * @param {string} [params.endDate] - End date for transaction history
   * @param {string} [params.type] - Transaction type filter
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Number of transactions per page
   * @returns {Promise} Promise with transaction history data
   */
  getTransactionHistory: async (params) => {
    try {
      const response = await api.get("/balance/transactions", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch transaction history" };
    }
  },
};

export default balanceService;
