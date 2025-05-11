import api from "./api";

/**
 * Service for managing Adashe (group savings) functionality
 */
const adasheService = {
  /**
   * Get all Adashe data including circles and balance
   * @returns {Promise} Promise with Adashe data
   */
  getAdasheData: async () => {
    try {
      const response = await api.get("/adashe");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch Adashe data" };
    }
  },

  /**
   * Create a new circle
   * @param {Object} circleData - Circle creation data
   * @param {string} circleData.name - Name of the circle
   * @param {number} circleData.targetAmount - Target amount for the circle
   * @param {string} circleData.frequency - Contribution frequency (e.g., "weekly", "monthly")
   * @param {number} circleData.contributionAmount - Amount of each contribution
   * @returns {Promise} Promise with created circle data
   */
  createCircle: async (circleData) => {
    try {
      const response = await api.post("/adashe/circles", circleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create circle" };
    }
  },

  /**
   * Get a specific circle by ID
   * @param {string} circleId - ID of the circle to retrieve
   * @returns {Promise} Promise with circle data
   */
  getCircle: async (circleId) => {
    try {
      const response = await api.get(`/adashe/circles/${circleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch circle" };
    }
  },

  /**
   * Contribute to a circle
   * @param {string} circleId - ID of the circle to contribute to
   * @param {number} amount - Amount to contribute
   * @returns {Promise} Promise with contribution response
   */
  contributeToCircle: async (circleId, amount) => {
    try {
      const response = await api.post(
        `/adashe/circles/${circleId}/contribute`,
        { amount }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to contribute to circle" }
      );
    }
  },

  /**
   * Invite members to a circle
   * @param {string} circleId - ID of the circle to invite to
   * @param {Array<string>} members - Array of member emails or IDs to invite
   * @returns {Promise} Promise with invitation response
   */
  inviteMembers: async (circleId, members) => {
    try {
      const response = await api.post(`/adashe/circles/${circleId}/invite`, {
        members,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to invite members" };
    }
  },

  /**
   * Get all activities related to Adashe
   * @returns {Promise} Promise with Adashe activities data
   */
  getActivities: async () => {
    try {
      const response = await api.get("/adashe/activities");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch activities" };
    }
  },

  /**
   * Withdraw from Adashe (if applicable)
   * @param {number} amount - Amount to withdraw
   * @returns {Promise} Promise with withdrawal response
   */
  withdraw: async (amount) => {
    try {
      const response = await api.post("/adashe/withdraw", { amount });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to withdraw from Adashe" }
      );
    }
  },
};

export default adasheService;
