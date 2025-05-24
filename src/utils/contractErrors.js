// Utility for handling and decoding contract errors
import { Interface } from "ethers";

/**
 * Common Solidity error signatures
 */
const ERROR_SIGNATURES = {
  // Standard ERC20 errors
  "ERC20: insufficient allowance": "0x13be252b",
  "ERC20: transfer amount exceeds balance": "0xdde0ff5d",

  // Common Solidity errors
  "Ownable: caller is not the owner": "0x4ca88867",
  "ReentrancyGuard: reentrant call": "0x9e87fac8",

  // Adashe contract specific errors
  "You are already a member of this group": "0x8579befe", // AlreadyAdasheGroupMember
  "This group is full and cannot accept new members": "0x4b1c4b82", // GroupIsFull
  "You are not a member of this group": "0x9e1b8b41", // NotAlreadyAdasheGroupMember
  "Only the owner can perform this action": "0x82b42900", // CallerNotOwner
  "Invalid amount specified": "0x18b2b6d1", // InvalidAmount
  "Invalid week specified": "0xa24a13a6", // InvalidWeek
  "Already withdrawn for this period": "0x7dbfbb93", // AlreadyWithdrawn
  "Already paid for this week": "0x9d2fc8f5", // AlreadyPaidThisWeek
  "Not yet unlocked": "0xf8a8fd6d", // NotYetUnlocked
  "Transfer failed": "0x90b8ec18", // TransferFailed
  "Invalid members count": "0x8b96b22c", // InvalidMembers
  "Invalid lock period": "0x03b9b8b6", // InvalidLockPeriod
};

/**
 * Try to decode a contract revert reason from error data
 *
 * @param {Error} error - The error received from the contract call
 * @returns {string} - A human-readable error message
 */
export function decodeContractError(error) {
  try {
    if (!error) return "Unknown error";

    // If we already have a reason, just return it
    if (error.reason) return error.reason;

    // Handle specific wallet/provider error patterns first
    if (error.message) {
      const errorMsg = error.message.toLowerCase();

      // Handle "missing revert data" specifically
      if (errorMsg.includes("missing revert data")) {
        return "Transaction failed due to contract requirements. You may already be a member or the action is not allowed.";
      }

      // Handle user rejection
      if (
        errorMsg.includes("user rejected") ||
        errorMsg.includes("user denied")
      ) {
        return "Transaction was cancelled by user.";
      }

      // Handle insufficient funds
      if (errorMsg.includes("insufficient funds")) {
        return "Insufficient funds to complete the transaction.";
      }

      // Handle network errors
      if (
        errorMsg.includes("network error") ||
        errorMsg.includes("connection")
      ) {
        return "Network error. Please check your connection and try again.";
      }
    }

    // For standard errors with data
    if (error.data) {
      // Try to find a matching error signature
      const errorSignature = error.data.substring(0, 10);

      for (const [errorMessage, signature] of Object.entries(
        ERROR_SIGNATURES
      )) {
        if (errorSignature.toLowerCase() === signature.toLowerCase()) {
          return errorMessage;
        }
      }

      // Log the unknown error for debugging
      console.log("[CONTRACT ERROR] Unknown error:", {
        errorData: error.data,
        signature: errorSignature,
      });
    }

    // Check if it's an execution reverted error
    if (error.message && error.message.includes("execution reverted")) {
      return "The transaction was rejected by the contract. Please check your inputs and try again.";
    }

    // Return the original error message if we can't decode it
    return error.message || "Transaction failed";
  } catch (e) {
    console.error("Error decoding contract error:", e);
    return error.message || "Transaction failed";
  }
}

/**
 * Handles contract errors with more context
 *
 * @param {Error} error - The error from a contract call
 * @param {object} context - Additional context about the operation
 * @returns {string} - User-friendly error message
 */
export function handleContractError(error, context = {}) {
  const decodedError = decodeContractError(error);

  // Log the error with context
  console.log("[CONTRACT ERROR] Error handled:", {
    context,
    originalError: error?.message,
    decodedError,
  });

  // Define common error patterns to check
  const isAlreadyContributed =
    error.message &&
    (error.message.toLowerCase().includes("already contributed") ||
      error.message.toLowerCase().includes("already paid"));

  const isNotMember =
    error.message &&
    (error.message.toLowerCase().includes("not a member") ||
      error.message.toLowerCase().includes("membership required"));

  const isInsufficientBalance =
    error.message &&
    (error.message.toLowerCase().includes("insufficient") ||
      error.message.toLowerCase().includes("balance too low"));

  // Return a more user-friendly message based on the error and context
  if (decodedError.includes("Circle name already exists")) {
    return `A circle with this name already exists. Please choose a different name.`;
  }

  // Handle specific contribution errors
  if (context.operation === "contribute") {
    if (isAlreadyContributed) {
      return "You have already contributed for this period.";
    }

    if (isNotMember) {
      return "You are not a member of this circle.";
    }

    if (isInsufficientBalance) {
      return "You don't have enough funds. Please check your balance and try again.";
    }

    return "Failed to contribute. Please check your inputs and try again.";
  }

  // Handle transaction revert errors by operation type
  if (decodedError.includes("execution reverted")) {
    // For create adashe context
    if (context.operation === "createAdashe") {
      return "Failed to create circle. Please check your inputs and try again.";
    }

    // For join adashe context
    if (context.operation === "joinAdashe") {
      return "Failed to join circle. The circle may not exist or you may already be a member.";
    }

    // For withdraw context
    if (context.operation === "withdraw") {
      return "Failed to withdraw. You may not have any funds to withdraw or need to wait until the appropriate time.";
    }
  }

  return decodedError;
}
