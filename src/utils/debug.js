// Debug utilities to help diagnose contract issues
import { logContractOperation } from "./contractDebug";

// Flag to enable/disable extended debug mode
export const DEBUG_MODE = process.env.NODE_ENV !== "production";

/**
 * Logs detailed debug information about a contract call
 *
 * @param {string} operation - Name of the operation being performed
 * @param {object} params - Parameters to log
 * @param {object} options - Additional options
 */
export function debugContractCall(operation, params, options = {}) {
  if (!DEBUG_MODE) return;

  logContractOperation(`debug_${operation}`, {
    timestamp: new Date().toISOString(),
    params,
    ...options,
  });
}

/**
 * Logs the start of a contract operation
 *
 * @param {string} operation - Name of the operation being performed
 * @param {object} params - Parameters to log
 */
export function debugStart(operation, params = {}) {
  if (!DEBUG_MODE) return;

  console.group(`🔍 DEBUG: ${operation}`);
  console.log("Parameters:", params);
  console.time(`${operation}_duration`);

  debugContractCall(`${operation}_start`, params);
}

/**
 * Logs the end of a contract operation
 *
 * @param {string} operation - Name of the operation being performed
 * @param {object} result - Result of the operation
 */
export function debugEnd(operation, result = {}) {
  if (!DEBUG_MODE) return;

  console.timeEnd(`${operation}_duration`);
  console.log("Result:", result);
  console.groupEnd();

  debugContractCall(`${operation}_end`, result);
}

/**
 * Logs an error during a contract operation
 *
 * @param {string} operation - Name of the operation being performed
 * @param {Error} error - Error that occurred
 */
export function debugError(operation, error) {
  if (!DEBUG_MODE) return;

  console.error(`❌ ERROR in ${operation}:`, error);

  debugContractCall(`${operation}_error`, {
    message: error.message,
    stack: error.stack,
  });
}

/**
 * Creates a debug logger for contract operations
 *
 * @param {string} moduleName - Name of the module (for grouping logs)
 * @returns {object} - Debug logger methods
 */
export function createContractDebugger(moduleName) {
  return {
    start: (operation, params) =>
      debugStart(`${moduleName}_${operation}`, params),
    end: (operation, result) => debugEnd(`${moduleName}_${operation}`, result),
    error: (operation, error) =>
      debugError(`${moduleName}_${operation}`, error),
    log: (message, data) => {
      if (!DEBUG_MODE) return;
      console.log(`[${moduleName}] ${message}`, data);
    },
  };
}

export default {
  DEBUG_MODE,
  debugContractCall,
  debugStart,
  debugEnd,
  debugError,
  createContractDebugger,
};
