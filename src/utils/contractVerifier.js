import { logContractOperation } from "./contractDebug";

/**
 * Verifies the state of a contract after a transaction completes
 * This helps ensure that the transaction had the expected effect
 *
 * @param {object} contract - Ethers contract instance
 * @param {string} methodName - Name of the method to call to verify state
 * @param {Array} params - Parameters to pass to the verification method
 * @param {Function} validator - Function that validates the result (returns boolean)
 * @param {object} options - Additional options
 * @returns {Promise<boolean>} - Whether the verification passed
 */
export async function verifyContractState(
  contract,
  methodName,
  params = [],
  validator,
  options = {}
) {
  const { retryCount = 3, retryDelay = 2000, context = {} } = options;

  const verificationId = `${contract.target}_${methodName}`;

  // Start logging
  logContractOperation("contractVerificationStart", {
    contract: contract.target,
    method: methodName,
    params: params.map((param) => String(param)),
    ...context,
  });

  // Try to verify, with retries
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      // Call the contract method
      const result = await contract[methodName](...params);

      // Validate the result
      const isValid = validator(result);

      // Log the verification result
      logContractOperation(
        isValid ? "contractVerificationSuccess" : "contractVerificationFailed",
        {
          contract: contract.target,
          method: methodName,
          result:
            typeof result === "object"
              ? Object.fromEntries(
                  Object.entries(result).map(([key, value]) => [
                    key,
                    String(value),
                  ])
                )
              : String(result),
          attempt: attempt + 1,
          passed: isValid,
          ...context,
        }
      );

      // If verification passed, return true
      if (isValid) {
        return true;
      }

      // If not the last attempt, wait before retrying
      if (attempt < retryCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    } catch (error) {
      // Log error
      logContractOperation("contractVerificationError", {
        contract: contract.target,
        method: methodName,
        error: error.message,
        attempt: attempt + 1,
        ...context,
      });

      // If not the last attempt, wait before retrying
      if (attempt < retryCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  // If we got here, all verification attempts failed
  logContractOperation("contractVerificationFinalFailed", {
    contract: contract.target,
    method: methodName,
    attempts: retryCount,
    ...context,
  });

  return false;
}

/**
 * Verifies the Adashe contribution was recorded correctly
 *
 * @param {object} adasheContract - Adashe contract instance
 * @param {string} userAddress - Address of the user who contributed
 * @param {number} expectedWeek - Expected week number of the contribution
 * @returns {Promise<boolean>} - Whether the verification passed
 */
export async function verifyAdasheContribution(
  adasheContract,
  userAddress,
  expectedWeek
) {
  return verifyContractState(
    adasheContract,
    "getContributionProgress",
    [userAddress],
    (result) => {
      // Check if the contributedWeeks is >= expectedWeek
      const contributedWeeks = Number(result.contributedWeeks);
      return contributedWeeks >= expectedWeek;
    },
    {
      context: {
        userAddress,
        expectedWeek,
      },
    }
  );
}

/**
 * Verifies an Adashe circle's membership for a user
 *
 * @param {object} adasheContract - Adashe contract instance
 * @param {string} userAddress - Address to check
 * @returns {Promise<boolean>} - Whether the user is a member
 */
export async function verifyAdasheMembership(adasheContract, userAddress) {
  try {
    // Get all members
    const members = await adasheContract.getMembers();

    // Check if user is a member (case-insensitive)
    const isMember = members.some(
      (member) => member.toLowerCase() === userAddress.toLowerCase()
    );

    logContractOperation("membershipVerification", {
      userAddress,
      isMember,
      memberCount: members.length,
    });

    return isMember;
  } catch (error) {
    logContractOperation("membershipVerificationError", {
      userAddress,
      error: error.message,
    });

    return false;
  }
}

export default {
  verifyContractState,
  verifyAdasheContribution,
  verifyAdasheMembership,
};
