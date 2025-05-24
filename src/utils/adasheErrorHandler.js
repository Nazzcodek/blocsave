import { ethers, Contract } from "ethers";
import { contractExistsAtAddress } from "./contractValidation";

/**
 * Error codes for Adashe contract interactions
 */
export const ADASHE_ERROR_CODES = {
  CONTRACT_NOT_FOUND: "CONTRACT_NOT_FOUND",
  INVALID_ABI: "INVALID_ABI",
  EXECUTION_REVERTED: "EXECUTION_REVERTED",
  METHOD_NOT_FOUND: "METHOD_NOT_FOUND",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

/**
 * Diagnoses Adashe contract issues
 *
 * @param {object} provider - Ethers provider
 * @param {string} contractAddress - Address of the contract to diagnose
 * @param {object} adasheABI - ABI of the Adashe contract
 * @returns {Promise<object>} Diagnostic information
 */
export const diagnoseAdasheContract = async (
  provider,
  contractAddress,
  adasheABI
) => {
  const result = {
    address: contractAddress,
    exists: false,
    hasValidCode: false,
    supportsCurrentWeekMethod: false,
    supportsContributionMethod: false,
    error: null,
    errorCode: null,
    isAccessible: false,
  };

  try {
    // Check if contract exists
    result.exists = await contractExistsAtAddress(provider, contractAddress);

    if (!result.exists) {
      result.errorCode = ADASHE_ERROR_CODES.CONTRACT_NOT_FOUND;
      result.error = `No contract found at address: ${contractAddress}`;
      return result;
    }

    // Contract exists, check if it has valid code
    const code = await provider.getCode(contractAddress);
    result.hasValidCode = code && code !== "0x";

    // Create a read-only instance to check ABI compatibility
    const readOnlyContract = new Contract(contractAddress, adasheABI, provider);

    // Check if methods exist by examining the functions of the contract
    result.supportsCurrentWeekMethod =
      typeof readOnlyContract.getCurrentWeek === "function";
    result.supportsContributionMethod =
      typeof readOnlyContract.getContributionProgress === "function";

    if (
      !result.supportsCurrentWeekMethod ||
      !result.supportsContributionMethod
    ) {
      result.errorCode = ADASHE_ERROR_CODES.INVALID_ABI;
      result.error = "Contract does not match expected ABI";
      return result;
    }

    // Contract exists and matches ABI - it's potentially working
    result.isAccessible = true;

    return result;
  } catch (error) {
    // Determine error type
    if (error.message?.includes("missing revert data")) {
      result.errorCode = ADASHE_ERROR_CODES.EXECUTION_REVERTED;
      result.error = "Contract call reverted without reason";
    } else if (error.message?.includes("call revert exception")) {
      result.errorCode = ADASHE_ERROR_CODES.EXECUTION_REVERTED;
      result.error = error.reason || "Contract call reverted";
    } else if (error.code === "NETWORK_ERROR") {
      result.errorCode = ADASHE_ERROR_CODES.NETWORK_ERROR;
      result.error = "Network error when accessing contract";
    } else {
      result.errorCode = ADASHE_ERROR_CODES.UNKNOWN_ERROR;
      result.error = error.message || "Unknown error accessing contract";
    }

    return result;
  }
};

/**
 * Provides user-friendly error messages for Adashe contract errors
 *
 * @param {string} errorCode - Error code from ADASHE_ERROR_CODES
 * @returns {object} User-friendly error information
 */
export const getUserFriendlyAdasheError = (errorCode) => {
  switch (errorCode) {
    case ADASHE_ERROR_CODES.CONTRACT_NOT_FOUND:
      return {
        title: "Contract Not Found",
        message:
          "The Adashe contract could not be found at the specified address. It may have been removed or deployed to a different address.",
        suggestion:
          "Please check your wallet connection and try again, or contact support if the issue persists.",
      };

    case ADASHE_ERROR_CODES.INVALID_ABI:
      return {
        title: "Contract Mismatch",
        message:
          "The contract at this address doesn't match the expected Adashe contract structure.",
        suggestion:
          "This may be due to a contract upgrade or wrong address. Please refresh the page or contact support.",
      };

    case ADASHE_ERROR_CODES.EXECUTION_REVERTED:
      return {
        title: "Contract Error",
        message:
          "The Adashe contract returned an error when trying to access it.",
        suggestion:
          "This could be due to network issues or contract state. Try again in a few minutes.",
      };

    case ADASHE_ERROR_CODES.NETWORK_ERROR:
      return {
        title: "Network Error",
        message: "Unable to connect to the blockchain network.",
        suggestion:
          "Please check your internet connection and wallet configuration.",
      };

    default:
      return {
        title: "Error Loading Adashe Data",
        message: "An unexpected error occurred while loading your Adashe data.",
        suggestion: "Try refreshing your browser or reconnecting your wallet.",
      };
  }
};
