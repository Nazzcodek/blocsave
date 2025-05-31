import { BrowserProvider } from "ethers";
import { getQuickSaveBalance } from "./useQuickSaveBalance";
import { getAllTransactionHistory as QuickSave } from "./useQuickSaveHistory";
import { getAllTransactionHistory as SafeLock } from "./useSafeLockHistory";
import { getAllAdasheAddresses } from "./useAdasheFactory";
import { getUserAdasheTransactionHistory } from "./useAdasheHistory";

// Base block explorer API URL for Sepolia testnet
const BASE_API_URL = "https://sepolia.base.org";

/**
 * Fetches all wallet transactions including USDC transfers, QuickSave, SafeLock, and Adashe transactions
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {number} limit - Maximum number of transactions to return (default 20)
 * @returns {Promise<Array>} - Array of all wallet transactions
 */
export async function fetchWalletTransactions(embeddedWallet, limit = 20) {
  if (!embeddedWallet) {
    return [];
  }

  try {
    // Get wallet address
    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    // Get QuickSave transactions (these are already formatted properly)
    const quickSaveTransactions = await QuickSave(embeddedWallet);

    // Get SafeLock transactions (these are already formatted properly)
    const safeLockTransactions = await SafeLock(embeddedWallet);

    // Fetch Adashe transactions for all user's Adashe circles
    const adasheAddresses = await getAllAdasheAddresses(embeddedWallet);
    let adasheTransactions = [];
    if (adasheAddresses && adasheAddresses.length > 0) {
      const adasheTxPromises = adasheAddresses.map((adasheAddress) =>
        getUserAdasheTransactionHistory(embeddedWallet, adasheAddress)
      );
      const adasheTxResults = await Promise.all(adasheTxPromises);
      adasheTransactions = adasheTxResults.flat();
    }

    // Format Adashe transactions into the same standard format
    const formattedAdasheTransactions = adasheTransactions.map((tx) => ({
      id: tx.id,
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      date: tx.date,
      transactionId: tx.transactionId,
      status: "Completed",
      type: tx.type,
    }));

    // Format transactions into standard format
    const formattedQuickSaveTransactions = quickSaveTransactions.map((tx) => ({
      id: tx.id,
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      date: tx.date,
      transactionId: tx.transactionId,
      status: "Completed",
      type: tx.type,
    }));

    const formattedSafeLockTransactions = safeLockTransactions.map((tx) => ({
      id: tx.id,
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      date: tx.date,
      transactionId: tx.transactionId,
      status: "Completed",
      type: tx.type,
    }));

    // Combine all transactions
    const allTransactions = [
      ...formattedQuickSaveTransactions,
      ...formattedSafeLockTransactions,
      ...formattedAdasheTransactions,
    ];

    // Sort by date (newest first) and limit results
    return allTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    return [];
  }
}
