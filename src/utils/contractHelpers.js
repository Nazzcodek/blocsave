import { formatUnits } from "ethers";
import { logContractOperation } from "./contractDebug";

/**
 * Check if a wallet has enough ETH for gas fees
 *
 * @param {object} provider - Ethers provider
 * @param {string} walletAddress - Address to check
 * @param {object} options - Options
 * @param {string} options.minBalance - Minimum balance in ETH (default: 0.001)
 * @returns {Promise<boolean>} - True if balance is sufficient
 */
export const hasEnoughEthForGas = async (
  provider,
  walletAddress,
  options = {}
) => {
  const minBalance = options.minBalance || "0.001"; // Default minimum balance: 0.001 ETH

  try {
    const balance = await provider.getBalance(walletAddress);
    const balanceInEth = formatUnits(balance, 18);

    logContractOperation("ethBalanceCheck", {
      address: walletAddress,
      balance: balanceInEth,
      minRequired: minBalance,
    });

    return parseFloat(balanceInEth) >= parseFloat(minBalance);
  } catch (error) {
    console.error("Failed to check ETH balance:", error);
    return false;
  }
};

/**
 * Check if a wallet has enough of a specific ERC20 token
 *
 * @param {object} tokenContract - ERC20 token contract instance
 * @param {string} walletAddress - Address to check
 * @param {string} amount - Amount to check (in token units)
 * @returns {Promise<boolean>} - True if balance is sufficient
 */
export const hasEnoughTokenBalance = async (
  tokenContract,
  walletAddress,
  amount
) => {
  try {
    const balance = await tokenContract.balanceOf(walletAddress);
    const decimals = await tokenContract.decimals();
    const balanceFormatted = formatUnits(balance, decimals);

    logContractOperation("tokenBalanceCheck", {
      address: walletAddress,
      tokenAddress: tokenContract.target,
      balance: balanceFormatted,
      required: amount,
    });

    return balance.gte(amount);
  } catch (error) {
    console.error("Failed to check token balance:", error);
    return false;
  }
};

/**
 * Friendly format of contract error messages for users
 *
 * @param {Error} error - The error from a contract call
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyContractError = (error) => {
  if (!error) return "An unknown error occurred";

  const errorMsg = error.message || "Unknown error";

  // Common error translations
  if (
    errorMsg.includes("missing revert data") ||
    errorMsg.includes("CALL_EXCEPTION")
  ) {
    return "The transaction was rejected by the blockchain. This could be due to contract restrictions or insufficient funds.";
  }

  if (errorMsg.includes("insufficient funds")) {
    return "You don't have enough ETH to pay for the transaction gas fee.";
  }

  if (errorMsg.includes("user rejected") || errorMsg.includes("user denied")) {
    return "You rejected the transaction in your wallet.";
  }

  if (errorMsg.includes("nonce too")) {
    return "Transaction error: Please try again in a few moments.";
  }

  if (errorMsg.includes("already pending")) {
    return "A similar transaction is already in progress. Please wait for it to complete.";
  }

  // Return the original error if no specific handling
  return errorMsg;
};

/**
 * Validate Adashe circle parameters before submission
 *
 * @param {object} circleData - Circle data to validate
 * @returns {string|null} - Error message if invalid, null if valid
 */
export const validateAdasheCircleParams = (circleData) => {
  const { name, contributionAmount, memberCount } = circleData;

  // Check circle name
  if (!name || name.trim() === "") {
    return "Circle name cannot be empty";
  }

  if (!/^[A-Za-z0-9\s]+$/.test(name)) {
    return "Circle name can only contain letters, numbers, and spaces";
  }

  if (name.length < 3) {
    return "Circle name must be at least 3 characters long";
  }

  if (name.length > 30) {
    return "Circle name cannot be longer than 30 characters";
  }

  // Check contribution amount
  if (
    !contributionAmount ||
    isNaN(contributionAmount) ||
    contributionAmount <= 0
  ) {
    return "Contribution amount must be greater than zero";
  }

  // Check member count
  if (!memberCount || isNaN(memberCount) || memberCount < 1) {
    return "Member count must be at least 1";
  }

  if (memberCount > 100) {
    return "Member count cannot exceed 100";
  }

  // All checks passed
  return null;
};
