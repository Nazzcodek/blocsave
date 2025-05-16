// Utility functions for debugging contract interactions
import { DEBUG_MODE } from "./debug";

/**
 * Log contract operation details for debugging
 * @param {string} operation - The operation being performed
 * @param {object} details - Details about the operation
 */
export function logContractOperation(operation, details) {
  if (DEBUG_MODE) {
    console.log(`[CONTRACT DEBUG] ${operation}:`, details);
  }
}

/**
 * Format contract error for easier debugging
 * @param {Error} error - The error object
 * @returns {string} Formatted error message
 */
export function formatContractError(error) {
  if (!error) return "Unknown error";

  // Extract useful information from the error
  const errorInfo = {
    message: error.message || "No error message",
    code: error.code,
    reason: error.reason,
    action: error.action,
    data: error.data,
    transaction: error.transaction
      ? {
          data: error.transaction.data,
          from: error.transaction.from,
          to: error.transaction.to,
          value: error.transaction.value,
        }
      : "No transaction data",
  };

  if (DEBUG_MODE) {
    console.error("[CONTRACT ERROR]", errorInfo);
  }

  // Format a user-friendly error message
  let friendlyMessage = errorInfo.message;

  if (error.reason) {
    friendlyMessage = `${friendlyMessage} (${error.reason})`;
  }

  if (error.code === "CALL_EXCEPTION") {
    friendlyMessage = `Contract call failed: ${friendlyMessage}. This might be due to incorrect parameters or insufficient gas.`;
  }

  return friendlyMessage;
}
