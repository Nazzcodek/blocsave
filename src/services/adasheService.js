import api from "./api";
import { useSelector } from "react-redux";
import { getAllAdasheAddresses } from "./blockchain/useAdasheFactory";
import { BrowserProvider, Contract } from "ethers";
import adashe from "../ABI/Adashe.json";

const ADASHE_CONTRACT_ABI = adashe.abi;

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

  /**
   * Get the total pool amount the user will get from all Adashe circles they are in
   * @param {object} embeddedWallet - Privy embedded wallet object
   * @returns {Promise<number>} - Total pool amount
   */
  getAdasheTotalPool: async (embeddedWallet) => {
    if (!embeddedWallet) return 0;
    try {
      const adasheAddresses = await getAllAdasheAddresses(embeddedWallet);
      if (!adasheAddresses || adasheAddresses.length === 0) return 0;
      const provider = await embeddedWallet.getEthereumProvider();
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      let total = 0;
      for (const adasheAddress of adasheAddresses) {
        const contract = new Contract(
          adasheAddress,
          ADASHE_CONTRACT_ABI,
          signer
        );
        try {
          const [members, adasheDetails] = await Promise.all([
            contract.getMembers(),
            contract.adashe(),
          ]);
          const membersCount = members.length;
          const weeklyAmount = Number(adasheDetails.weeklyContribution) / 1e6; // USDC 6 decimals
          total += membersCount * weeklyAmount;
        } catch (e) {
          // skip this adashe if error
        }
      }
      return total;
    } catch (e) {
      return 0;
    }
  },
};

// Export getAdasheTotalPool as a named export for dashboardSlice.js
export const getAdasheTotalPool = adasheService.getAdasheTotalPool;

export default adasheService;
