import { BrowserProvider, Contract } from "ethers";
import { formatUnits } from "ethers";
import adashe from "../../ABI/Adashe.json";
import { getAllAdasheAddresses } from "./useAdasheFactory";

const ADASHE_CONTRACT_ABI = adashe.abi;

/**
 * Get contribution and withdrawal history for a user from a specific Adashe contract using transactions(address, uint256)
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - Address of the Adashe contract
 * @returns {Promise<Array>} - Array of contribution and withdrawal transactions
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
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Use transactions(address, uint256) to fetch all user transactions
    let transactions = [];
    let week = 1;
    let hasMore = true;
    while (hasMore) {
      let tx;
      try {
        tx = await contract.transactions(userAddress, week);
      } catch (e) {
        hasMore = false;
        break;
      }
      if (tx && tx.amount && tx.amount > 0) {
        transactions.push({
          id: `tx-${adasheAddress.slice(0, 8)}-${week}`,
          type: tx.txType === 0 ? "contribution" : "withdrawal",
          from:
            tx.txType === 0 ? "Wallet" : `Adashe ${adasheAddress.slice(0, 6)}`,
          to:
            tx.txType === 0 ? `Adashe ${adasheAddress.slice(0, 6)}` : "Wallet",
          amount: Number(tx.amount) / 1e6, // Assuming USDC 6 decimals
          date: tx.timestamp
            ? new Date(Number(tx.timestamp) * 1000)
            : undefined,
          week: `Week ${week}`,
          user: "You",
          address: `${userAddress.slice(0, 10)}...${userAddress.slice(-8)}`,
          contractAddress: adasheAddress,
          transactionId: `${adasheAddress.slice(0, 10)}...${adasheAddress.slice(
            -8
          )}-T${week}`,
        });
        week++;
      } else {
        hasMore = false;
      }
    }
    return transactions;
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
      // Use Base Mainnet public RPC endpoint
      const { JsonRpcProvider } = await import("ethers");
      ethersProvider = new JsonRpcProvider(`https://base-mainnet.g.alchemy.com/v2/${NEXT_PUBLIC_BASE_MAINNET_RPC_URL}`);
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

/**
 * Get all group transaction history (contributions and withdrawals) for all users in a group
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - Address of the Adashe contract
 * @returns {Promise<Array>} - Array of all group transactions
 */
export async function getAdasheGroupTransactionHistory(
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
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);
    // Get all members
    const members = await contract.getMembers();
    let allTransactions = [];
    for (const member of members) {
      let week = 1;
      let hasMore = true;
      while (hasMore) {
        let tx;
        try {
          tx = await contract.transactions(member, week);
        } catch (e) {
          hasMore = false;
          break;
        }
        if (tx && tx.amount && tx.amount > 0) {
          allTransactions.push({
            id: `tx-${adasheAddress.slice(0, 8)}-${member.slice(0, 8)}-${week}`,
            type: tx.txType === 0 ? "contribution" : "withdrawal",
            from:
              tx.txType === 0 ? member : `Adashe ${adasheAddress.slice(0, 6)}`,
            to:
              tx.txType === 0 ? `Adashe ${adasheAddress.slice(0, 6)}` : member,
            amount: Number(tx.amount) / 1e6, // Assuming USDC 6 decimals
            date: tx.timestamp
              ? new Date(Number(tx.timestamp) * 1000)
              : undefined,
            week: `Week ${week}`,
            user: member,
            address: member,
            contractAddress: adasheAddress,
            transactionId: `${adasheAddress.slice(
              0,
              10
            )}...${adasheAddress.slice(-8)}-T${week}-${member.slice(0, 6)}`,
          });
          week++;
        } else {
          hasMore = false;
        }
      }
    }
    // Sort by date (newest first)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    return allTransactions;
  } catch (error) {
    return [];
  }
}

/**
 * Get Adashe transaction history for a user using getUserTransactionHistory(address user)
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - Address of the Adashe contract
 * @returns {Promise<Array>} - Array of user Adashe transactions
 */
export async function getUserAdasheTransactionHistory(
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
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Call the ABI function getUserTransactionHistory(address user)
    const txs = await contract.getUserTransactionHistory(userAddress);
    if (!Array.isArray(txs)) return [];
    // Format each transaction
    return txs.map((tx, idx) => ({
      id: `adashe-user-${adasheAddress.slice(0, 8)}-${idx}`,
      type: tx.txType === 0 ? "contribution" : "withdrawal",
      from: tx.txType === 0 ? "Wallet" : `Adashe ${adasheAddress.slice(0, 6)}`,
      to: tx.txType === 0 ? `Adashe ${adasheAddress.slice(0, 6)}` : "Wallet",
      amount: Number(tx.amount) / 1e6, // Assuming USDC 6 decimals
      date: tx.timestamp ? new Date(Number(tx.timestamp) * 1000) : undefined,
      week: tx.week ? `Week ${tx.week}` : undefined,
      user: "You",
      address: `${userAddress.slice(0, 10)}...${userAddress.slice(-8)}`,
      contractAddress: adasheAddress,
      transactionId:
        tx.transactionId ||
        `${adasheAddress.slice(0, 10)}...${adasheAddress.slice(-8)}-U${idx}`,
    }));
  } catch (error) {
    return [];
  }
}
