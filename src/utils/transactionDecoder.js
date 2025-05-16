import { Interface } from "ethers";
import { logContractOperation } from "./contractDebug";

/**
 * Decode a transaction's input data using a contract ABI
 *
 * @param {string} inputData - Transaction input data hexstring
 * @param {Array} abi - Contract ABI
 * @returns {object|null} - Decoded transaction data or null if it can't be decoded
 */
export function decodeTransactionInput(inputData, abi) {
  try {
    if (!inputData || !abi) return null;

    const iface = new Interface(abi);

    try {
      const decoded = iface.parseTransaction({ data: inputData });

      if (decoded) {
        // Create a readable object with function name and parameters
        const params = {};
        decoded.args.forEach((arg, index) => {
          const paramName =
            decoded.fragment.inputs[index]?.name || `param${index}`;
          params[paramName] = arg.toString();
        });

        return {
          functionName: decoded.name,
          functionSelector: decoded.selector,
          params,
          signature: decoded.signature,
        };
      }
    } catch (parseError) {
      console.warn("Failed to parse transaction data:", parseError);
    }

    return null;
  } catch (error) {
    console.error("Error decoding transaction input:", error);
    return null;
  }
}

/**
 * Decode transaction logs using a contract ABI
 *
 * @param {Array} logs - Array of transaction logs
 * @param {Array} abi - Contract ABI
 * @returns {Array} - Array of decoded logs
 */
export function decodeTransactionLogs(logs, abi) {
  try {
    if (!logs || !abi) return [];

    const iface = new Interface(abi);
    const decodedLogs = [];

    for (const log of logs) {
      try {
        // Try to decode this log
        const decoded = iface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        if (decoded) {
          // Create a readable object with event name and parameters
          const params = {};
          decoded.args.forEach((arg, index) => {
            const paramName =
              decoded.fragment.inputs[index]?.name || `param${index}`;
            params[paramName] = arg.toString();
          });

          decodedLogs.push({
            eventName: decoded.name,
            params,
            logIndex: log.logIndex,
            signature: decoded.signature,
          });
        }
      } catch (parseError) {
        // Skip logs that can't be decoded with this ABI
      }
    }

    return decodedLogs;
  } catch (error) {
    console.error("Error decoding transaction logs:", error);
    return [];
  }
}

/**
 * Analyze a failed transaction to provide helpful diagnostic information
 *
 * @param {object} receipt - Transaction receipt
 * @param {object} tx - Transaction data
 * @param {Array} abi - Contract ABI
 * @returns {object} - Diagnostics information
 */
export function analyzeFailedTransaction(receipt, tx, abi) {
  try {
    const diagnostics = {
      receipt: {
        status: receipt.status,
        gasUsed: receipt.gasUsed?.toString(),
        gasLimit: tx.gasLimit?.toString(),
        gasUtilization:
          receipt.gasUsed && tx.gasLimit
            ? `${(
                (Number(receipt.gasUsed) / Number(tx.gasLimit)) *
                100
              ).toFixed(2)}%`
            : "unknown",
      },
      possibleIssues: [],
      decodedInput: null,
      decodedLogs: [],
    };

    // Check if transaction ran out of gas
    if (
      receipt.gasUsed &&
      tx.gasLimit &&
      Number(receipt.gasUsed) >= Number(tx.gasLimit) * 0.95
    ) {
      diagnostics.possibleIssues.push("OUT_OF_GAS");
    }

    // Check if there were any events emitted despite failure
    if (receipt.logs && receipt.logs.length > 0) {
      diagnostics.possibleIssues.push("REVERTED_WITH_LOGS");
    } else {
      diagnostics.possibleIssues.push("SILENT_REVERT");
    }

    // Try to decode the input
    if (tx.data && abi) {
      diagnostics.decodedInput = decodeTransactionInput(tx.data, abi);
    }

    // Try to decode any logs
    if (receipt.logs && receipt.logs.length > 0 && abi) {
      diagnostics.decodedLogs = decodeTransactionLogs(receipt.logs, abi);
    }

    // Log the diagnostics
    logContractOperation("transactionFailureAnalysis", diagnostics);

    return diagnostics;
  } catch (error) {
    console.error("Error analyzing failed transaction:", error);
    return { error: error.message };
  }
}

export default {
  decodeTransactionInput,
  decodeTransactionLogs,
  analyzeFailedTransaction,
};
