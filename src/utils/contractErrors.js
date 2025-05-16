// Utility for handling and decoding contract errors
import { Interface } from "ethers";
import { logContractOperation } from "./contractDebug";

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

  // Custom project errors - add your contract-specific errors here
  "Circle name already exists": "0xa123b456", // Example - replace with actual signature
  "Invalid parameter": "0xb123c456", // Example - replace with actual signature
  "Not a member": "0xc123d456", // Example - replace with actual signature
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
      logContractOperation("unknownContractError", {
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
  logContractOperation("contractErrorHandled", {
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
