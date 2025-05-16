import { BrowserProvider } from "ethers";
import { getQuickSaveBalance } from "./useQuickSaveBalance";
import { getAllTransactionHistory } from "./useQuickSaveHistory";

// Base block explorer API URL for Sepolia testnet
const BASE_API_URL = "https://sepolia.base.org";

/**
 * Fetches all wallet transactions including USDC transfers and QuickSave transactions
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
    const quickSaveTransactions = await getAllTransactionHistory(
      embeddedWallet
    );

    // Format transactions into standard format
    const formattedTransactions = quickSaveTransactions.map((tx) => ({
      id: tx.id,
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      date: tx.date,
      transactionId: tx.transactionId,
      status: "Completed",
      type: tx.type,
    }));

    // Sort by date (newest first) and limit results
    return formattedTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    return [];
  }
}
