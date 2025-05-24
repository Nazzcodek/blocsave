import { BrowserProvider, Contract } from "ethers";
import { formatUnits } from "ethers";
import adashe from "../../ABI/Adashe.json";
import { getAllAdasheAddresses } from "./useAdasheFactory";

const ADASHE_CONTRACT_ABI = adashe.abi;

/**
 * Get contribution history for a user from a specific Adashe contract
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - Address of the Adashe contract
 * @returns {Promise<Array>} - Array of contribution transactions
 */
export async function getAdasheContributionHistory(
  embeddedWallet,
  adasheAddress
) {
  try {
    if (!embeddedWallet || !adasheAddress) {
      return [];
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    console.log(
      "[getAdasheContributionHistory] Getting history for:",
      adasheAddress
    );

    // Check if contract exists
    const code = await ethersProvider.getCode(adasheAddress);
    if (!code || code === "0x") {
      console.warn(
        `[getAdasheContributionHistory] No contract at address: ${adasheAddress}`
      );
      return [];
    }

    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Get contribution events - we'll use the contribution progress to simulate history
    // In a real implementation, you'd query blockchain events
    try {
      const progress = await contract.getContributionProgress(userAddress);
      const contributedWeeks = Number(progress[0]);
      const totalContribution = Number(formatUnits(progress[1], 6));

      // Get circle details for context
      let circleName = `Adashe ${adasheAddress.slice(0, 6)}`;
      let weeklyAmount = 0;

      try {
        const adasheDetails = await contract.adashe();
        circleName = adasheDetails.circleName || circleName;
        weeklyAmount = Number(formatUnits(adasheDetails.weeklyContribution, 6));
      } catch (detailsError) {
        console.warn(
          "[getAdasheContributionHistory] Could not get circle details:",
          detailsError
        );
        // Calculate weekly amount from total if we have contributions
        weeklyAmount =
          contributedWeeks > 0 ? totalContribution / contributedWeeks : 0;
      }

      // Generate contribution history based on contributed weeks
      const contributions = [];
      for (let week = 1; week <= contributedWeeks; week++) {
        // Simulate dates (in real implementation, you'd get from events)
        const contributionDate = new Date();
        contributionDate.setDate(
          contributionDate.getDate() - (contributedWeeks - week) * 7
        );

        contributions.push({
          id: `contribution-${adasheAddress.slice(0, 8)}-${week}`,
          type: "contribution",
          from: "Wallet",
          to: circleName,
          amount: weeklyAmount,
          date: contributionDate,
          week: `Week ${week}`,
          user: "You",
          address: `${userAddress.slice(0, 10)}...${userAddress.slice(-8)}`,
          contractAddress: adasheAddress,
          transactionId: `${adasheAddress.slice(0, 10)}...${adasheAddress.slice(
            -8
          )}-W${week}`,
        });
      }

      return contributions;
    } catch (progressError) {
      console.error(
        "[getAdasheContributionHistory] Error getting progress:",
        progressError
      );
      return [];
    }
  } catch (error) {
    console.error("[getAdasheContributionHistory] Error:", error);
    return [];
  }
}

/**
 * Get withdrawal history for a user from a specific Adashe contract
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - Address of the Adashe contract
 * @returns {Promise<Array>} - Array of withdrawal transactions
 */
export async function getAdasheWithdrawalHistory(
  embeddedWallet,
  adasheAddress
) {
  try {
    if (!embeddedWallet || !adasheAddress) {
      return [];
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    console.log(
      "[getAdasheWithdrawalHistory] Getting withdrawal history for:",
      adasheAddress
    );

    // Check if contract exists
    const code = await ethersProvider.getCode(adasheAddress);
    if (!code || code === "0x") {
      console.warn(
        `[getAdasheWithdrawalHistory] No contract at address: ${adasheAddress}`
      );
      return [];
    }

    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Get circle details
    let circleName = `Adashe ${adasheAddress.slice(0, 6)}`;
    let totalMembers = 0;
    let weeklyAmount = 0;

    try {
      const adasheDetails = await contract.adashe();
      circleName = adasheDetails.circleName || circleName;
      weeklyAmount = Number(formatUnits(adasheDetails.weeklyContribution, 6));

      // Get members to calculate total payout
      const members = await contract.getMembers();
      totalMembers = members.length;
    } catch (detailsError) {
      console.warn(
        "[getAdasheWithdrawalHistory] Could not get circle details:",
        detailsError
      );
    }

    // For demonstration, we'll check if user has eligible withdrawal
    // In a real implementation, you'd query withdrawal events from blockchain
    try {
      const currentWeek = await contract.getCurrentWeek();
      const members = await contract.getMembers();

      // Find user's position in the circle
      const userIndex = members.findIndex(
        (member) => member.toLowerCase() === userAddress.toLowerCase()
      );

      const withdrawals = [];

      // If user is eligible for withdrawal (it's their turn)
      if (userIndex !== -1 && Number(currentWeek) > userIndex) {
        const payoutAmount = weeklyAmount * totalMembers;
        const withdrawalDate = new Date();
        withdrawalDate.setDate(
          withdrawalDate.getDate() - (Number(currentWeek) - userIndex - 1) * 7
        );

        withdrawals.push({
          id: `withdrawal-${adasheAddress.slice(0, 8)}-${userIndex + 1}`,
          type: "withdrawal",
          from: circleName,
          to: "Wallet",
          amount: payoutAmount,
          date: withdrawalDate,
          week: `Week ${userIndex + 1}`,
          user: "You",
          address: `${userAddress.slice(0, 10)}...${userAddress.slice(-8)}`,
          contractAddress: adasheAddress,
          transactionId: `${adasheAddress.slice(0, 10)}...${adasheAddress.slice(
            -8
          )}-P${userIndex + 1}`,
        });
      }

      return withdrawals;
    } catch (withdrawalError) {
      console.error(
        "[getAdasheWithdrawalHistory] Error checking withdrawals:",
        withdrawalError
      );
      return [];
    }
  } catch (error) {
    console.error("[getAdasheWithdrawalHistory] Error:", error);
    return [];
  }
}

/**
 * Get all transaction history (contributions and withdrawals) for all user's Adashe circles
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @returns {Promise<Array>} - Array of all Adashe transactions
 */
export async function getAllAdasheTransactionHistory(embeddedWallet) {
  try {
    if (!embeddedWallet) {
      console.warn(
        "[getAllAdasheTransactionHistory] No embedded wallet provided"
      );
      return [];
    }

    console.log(
      "[getAllAdasheTransactionHistory] Starting to fetch all Adashe transaction history"
    );

    // Get all user's Adashe addresses
    const adasheAddresses = await getAllAdasheAddresses(embeddedWallet);

    if (!adasheAddresses || adasheAddresses.length === 0) {
      console.log("[getAllAdasheTransactionHistory] No Adashe addresses found");
      return [];
    }

    console.log(
      `[getAllAdasheTransactionHistory] Found ${adasheAddresses.length} Adashe contracts`
    );

    // Get transaction history for each Adashe contract
    const historyPromises = adasheAddresses.map(async (address) => {
      try {
        const [contributions, withdrawals] = await Promise.all([
          getAdasheContributionHistory(embeddedWallet, address),
          getAdasheWithdrawalHistory(embeddedWallet, address),
        ]);

        return [...contributions, ...withdrawals];
      } catch (error) {
        console.error(
          `[getAllAdasheTransactionHistory] Error for address ${address}:`,
          error
        );
        return [];
      }
    });

    const allHistories = await Promise.all(historyPromises);

    // Flatten and sort by date (newest first)
    const allTransactions = allHistories
      .flat()
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(
      `[getAllAdasheTransactionHistory] Found ${allTransactions.length} total transactions`
    );

    return allTransactions;
  } catch (error) {
    console.error(
      "[getAllAdasheTransactionHistory] Failed to fetch transaction history:",
      error
    );
    return [];
  }
}

/**
 * Get transaction history for a specific Adashe circle
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - Address of the specific Adashe contract
 * @returns {Promise<Array>} - Array of transactions for the specific circle
 */
export async function getAdasheCircleTransactionHistory(
  embeddedWallet,
  adasheAddress
) {
  try {
    if (!embeddedWallet || !adasheAddress) {
      return [];
    }

    console.log(
      `[getAdasheCircleTransactionHistory] Getting history for circle: ${adasheAddress}`
    );

    const [contributions, withdrawals] = await Promise.all([
      getAdasheContributionHistory(embeddedWallet, adasheAddress),
      getAdasheWithdrawalHistory(embeddedWallet, adasheAddress),
    ]);

    // Combine and sort by date (newest first)
    const allTransactions = [...contributions, ...withdrawals].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    console.log(
      `[getAdasheCircleTransactionHistory] Found ${allTransactions.length} transactions for circle`
    );

    return allTransactions;
  } catch (error) {
    console.error("[getAdasheCircleTransactionHistory] Error:", error);
    return [];
  }
}
