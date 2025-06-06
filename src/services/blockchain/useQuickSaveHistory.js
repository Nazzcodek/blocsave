import { BrowserProvider, Contract } from "ethers";
import quicksave from "../../ABI/QuickSave.json";

const QUICK_SAVE_CONTRACT_ABI = quicksave.abi;
const QUICK_SAVE_CONTRACT_ADDRESS =
  "0x4aA1fe43615476ff7Ee4913D71806D90419B8eb6";

/**
 * Get the saving history for a user from the QuickSave contract
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @returns {Promise<Array>} - Array of saving transactions
 */
export async function getSavingHistory(embeddedWallet) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    const contract = new Contract(
      QUICK_SAVE_CONTRACT_ADDRESS,
      QUICK_SAVE_CONTRACT_ABI,
      signer
    );
    const savingHistory = await contract.getSavingHistory(userAddress);

    // Format the response to match our application's expected format
    return savingHistory.map((item, index) => {
      // Ensure we have a valid date by checking if date field is valid
      let date = new Date();
      if (item.date && typeof item.date.toString === "function") {
        const timestamp = Number(item.date.toString());
        if (!isNaN(timestamp) && timestamp > 0) {
          date = new Date(timestamp * 1000); // Convert seconds to milliseconds
        }
      }

      // Ensure we have a valid transaction hash
      const txHash =
        item.txId && item.txId !== "0x"
          ? item.txId
          : `save-${userAddress.slice(0, 6)}-${Date.now()}-${index}`;

      return {
        id: item.id ? item.id.toString() : `save-${Date.now()}-${index}`,
        from: "Wallet",
        to: "QuickSave",
        amount: Number(item.amount) / 10 ** 6, // Assuming USDC with 6 decimals
        date: date,
        transactionId: txHash,
        type: "save",
      };
    });
  } catch (error) {
    console.error("Failed to fetch saving history:", error);
    return [];
  }
}

/**
 * Get the withdrawal history for a user from the QuickSave contract
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @returns {Promise<Array>} - Array of withdrawal transactions
 */
export async function getWithdrawalHistory(embeddedWallet) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    const contract = new Contract(
      QUICK_SAVE_CONTRACT_ADDRESS,
      QUICK_SAVE_CONTRACT_ABI,
      signer
    );
    const withdrawalHistory = await contract.getWithdrawalHistory(userAddress);

    // Format the response to match our application's expected format
    return withdrawalHistory.map((item, index) => {
      // Ensure we have a valid date by checking if date field is valid
      let date = new Date();
      if (item.date && typeof item.date.toString === "function") {
        const timestamp = Number(item.date.toString());
        if (!isNaN(timestamp) && timestamp > 0) {
          date = new Date(timestamp * 1000); // Convert seconds to milliseconds
        }
      }

      // Ensure we have a valid transaction hash
      const txHash =
        item.txId && item.txId !== "0x"
          ? item.txId
          : `withdraw-${userAddress.slice(0, 6)}-${Date.now()}-${index}`;

      return {
        id: item.id ? item.id.toString() : `withdraw-${Date.now()}-${index}`,
        from: "QuickSave",
        to: "Wallet",
        amount: Number(item.amount) / 10 ** 6, // Assuming USDC with 6 decimals
        date: date,
        transactionId: txHash,
        type: "withdraw",
      };
    });
  } catch (error) {
    console.error("Failed to fetch withdrawal history:", error);
    return [];
  }
}

/**
 * Get all transaction history (both savings and withdrawals)
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @returns {Promise<Array>} - Array of all transactions
 */
export async function getAllTransactionHistory(embeddedWallet) {
  try {
    const savings = await getSavingHistory(embeddedWallet);
    const withdrawals = await getWithdrawalHistory(embeddedWallet);

    // Combine and sort by date (newest first)
    return [...savings, ...withdrawals].sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error("Failed to fetch transaction history:", error);
    return [];
  }
}
