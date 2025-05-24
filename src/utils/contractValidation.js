/**
 * Utilities for validating contracts before interaction
 */

/**
 * Checks if a contract exists at a given address on the blockchain
 *
 * @param {object} provider - Ethers provider
 * @param {string} address - Contract address to check
 * @returns {Promise<boolean>} True if a valid contract exists at the address
 */
export const contractExistsAtAddress = async (provider, address) => {
  try {
    if (!address || !address.startsWith("0x") || address.length !== 42) {
      return false;
    }

    const code = await provider.getCode(address);
    return code && code !== "0x";
  } catch (error) {
    console.error(
      `[contractExistsAtAddress] Error checking contract at ${address}:`,
      error
    );
    return false;
  }
};

/**
 * Safely calls a contract view method with timeout protection
 *
 * @param {object} contract - Ethers contract instance
 * @param {string} methodName - Name of the method to call
 * @param {Array} params - Parameters to pass to the method
 * @param {number} timeoutMs - Timeout in milliseconds (default: 10000)
 * @param {*} defaultValue - Default value to return on error or timeout (default: null)
 * @returns {Promise<*>} The result of the contract call or defaultValue on error/timeout
 */
export const safeContractCall = async (
  contract,
  methodName,
  params = [],
  timeoutMs = 10000,
  defaultValue = null
) => {
  try {
    // Make sure method exists on contract
    if (typeof contract[methodName] !== "function") {
      console.error(
        `[safeContractCall] Method '${methodName}' does not exist on contract`
      );
      return defaultValue;
    }

    // Call the method with timeout protection
    const result = await Promise.race([
      contract[methodName](...params),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Contract call to ${methodName} timed out`)),
          timeoutMs
        )
      ),
    ]);

    return result;
  } catch (error) {
    console.error(`[safeContractCall] Error calling ${methodName}:`, error);
    return defaultValue;
  }
};

/**
 * Batch version of safeContractCall for multiple contracts
 *
 * @param {Array<{contract: object, methodName: string, params: Array}>} calls - Array of contract call configs
 * @param {number} timeoutMs - Timeout in milliseconds (default: 15000)
 * @returns {Promise<Array<*>>} Array of results or nulls for failed calls
 */
export const batchSafeContractCalls = async (calls, timeoutMs = 15000) => {
  const results = await Promise.all(
    calls.map(({ contract, methodName, params = [], defaultValue = null }) =>
      safeContractCall(contract, methodName, params, timeoutMs, defaultValue)
    )
  );

  return results;
};
