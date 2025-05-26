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

    // Removed all console.log, console.warn, and console.error statements for security

    // Check if contract exists
    const code = await ethersProvider.getCode(adasheAddress);
    if (!code || code === "0x") {
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
      return [];
    }
  } catch (error) {
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

    // Removed all console.log, console.warn, and console.error statements for security

    // Check if contract exists
    const code = await ethersProvider.getCode(adasheAddress);
    if (!code || code === "0x") {
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
      // Do not return details on error for security
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
      return [];
    }
  } catch (error) {
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
      return [];
    }

    // Removed all console.log, console.warn, and console.error statements for security

    // Get all user's Adashe addresses
    const adasheAddresses = await getAllAdasheAddresses(embeddedWallet);

    if (!adasheAddresses || adasheAddresses.length === 0) {
      return [];
    }

    // Get transaction history for each Adashe contract
    const historyPromises = adasheAddresses.map(async (address) => {
      try {
        const [contributions, withdrawals] = await Promise.all([
          getAdasheContributionHistory(embeddedWallet, address),
          getAdasheWithdrawalHistory(embeddedWallet, address),
        ]);

        return [...contributions, ...withdrawals];
      } catch (error) {
        return [];
      }
    });

    const allHistories = await Promise.all(historyPromises);

    // Flatten and sort by date (newest first)
    const allTransactions = allHistories
      .flat()
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return allTransactions;
  } catch (error) {
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

    const [contributions, withdrawals] = await Promise.all([
      getAdasheContributionHistory(embeddedWallet, adasheAddress),
      getAdasheWithdrawalHistory(embeddedWallet, adasheAddress),
    ]);

    // Combine and sort by date (newest first)
    const allTransactions = [...contributions, ...withdrawals].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return allTransactions;
  } catch (error) {
    return [];
  }
}

/**
 * Get all contribute and payout transactions for a group from on-chain events
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - Address of the Adashe contract
 * @returns {Promise<Array>} - Array of all group transactions (contributions and payouts)
 */
export async function getAdasheGroupTransactionEvents(
  embeddedWallet,
  adasheAddress
) {
  try {
    // Use a public provider for group history, do NOT require wallet
    let ethersProvider;
    // Use window.ethereum if available, otherwise fallback to Base Sepolia testnet
    if (typeof window !== "undefined" && window.ethereum) {
      ethersProvider = new BrowserProvider(window.ethereum);
    } else {
      // Use Base Sepolia public RPC endpoint
      const { JsonRpcProvider } = await import("ethers");
      ethersProvider = new JsonRpcProvider("https://sepolia.base.org");
    }
    if (!adasheAddress) return [];
    const contract = new Contract(
      adasheAddress,
      ADASHE_CONTRACT_ABI,
      ethersProvider
    );

    // Get event topics using ethers.id (ethers v6)
    const { id } = await import("ethers");
    const depositTopic = id("AdasheDeposit(address,uint256,uint256)");
    const withdrawTopic = id("Withdraw(address,uint256,uint256)");

    // Query all AdasheDeposit events
    const depositLogs = await ethersProvider.getLogs({
      address: adasheAddress,
      topics: [depositTopic],
      fromBlock: 0,
      toBlock: "latest",
    });
    // Query all Withdraw events
    const withdrawLogs = await ethersProvider.getLogs({
      address: adasheAddress,
      topics: [withdrawTopic],
      fromBlock: 0,
      toBlock: "latest",
    });

    // Parse logs (ethers v6)
    const deposits = depositLogs.map((log) => {
      const parsed = contract.parseLog(log);
      return {
        id: `contribution-${log.transactionHash}`,
        type: "contribution",
        user: parsed.args.user,
        amount: Number(formatUnits(parsed.args.amount, 6)),
        date: new Date(Number(parsed.args.time) * 1000),
        txHash: log.transactionHash,
        contractAddress: adasheAddress,
      };
    });
    const payouts = withdrawLogs.map((log) => {
      const parsed = contract.parseLog(log);
      return {
        id: `payout-${log.transactionHash}`,
        type: "payout",
        user: parsed.args.user,
        amount: Number(formatUnits(parsed.args.amount, 6)),
        date: new Date(Number(parsed.args.time) * 1000),
        txHash: log.transactionHash,
        contractAddress: adasheAddress,
      };
    });
    // Combine and sort by date (newest first)
    const all = [...deposits, ...payouts].sort((a, b) => b.date - a.date);
    return all;
  } catch (error) {
    return [];
  }
}
