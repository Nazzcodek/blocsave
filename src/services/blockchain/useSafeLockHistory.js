import { BrowserProvider, Contract } from "ethers";
import safelock from "../../ABI/SafeLock.json";
import safelockFactory from "../../ABI/SafeLockFactory.json";

const SAFE_LOCK_CONTRACT_ABI = safelock.abi;
const SAFE_LOCK_FACTORY_ABI = safelockFactory.abi;
const SAFE_LOCK_FACTORY_ADDRESS = "0x862473108b70afc86861e0cf4101010B95554184";

/**
 * Get the saving history for a user from the SafeLock contract
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @returns {Promise<Array>} - Array of saving transactions
 */
export async function getLockedSaving(embeddedWallet) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    // First get all SafeLock addresses from the factory
    const factoryContract = new Contract(
      SAFE_LOCK_FACTORY_ADDRESS,
      SAFE_LOCK_FACTORY_ABI,
      signer
    );

    // Get the user's SafeLock addresses
    const safeLockAddresses = await factoryContract.getSafeLocks();

    // If no SafeLocks, return empty array
    if (!safeLockAddresses || safeLockAddresses.length === 0) {
      return [];
    }

    // Process all SafeLocks and combine their data
    let allSavingHistory = [];

    for (let i = 0; i < safeLockAddresses.length; i++) {
      try {
        const safeLockAddress = safeLockAddresses[i];
        const contract = new Contract(
          safeLockAddress,
          SAFE_LOCK_CONTRACT_ABI,
          signer
        );

        // Get locked savings for this specific contract
        const savingHistory = await contract.getLockedSaving();

        // Format the data from this contract
        const formattedHistory = savingHistory.map((item, idx) => {
          // Ensure we have a valid date by checking if timestamp is valid
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
              : `SAFE-${userAddress.slice(0, 6)}-${Date.now()}-${idx}`;

          return {
            id: `SAFE-${safeLockAddress.slice(0, 8)}-${idx}`,
            from: "Wallet",
            to: "SafeLock",
            amount: Number(item.amount) / 10 ** 6, // Assuming USDC with 6 decimals
            date: date,
            transactionId: txHash,
            type: "deposit",
            safeLockAddress: safeLockAddress,
            withdrawn: item.withdrawn || false,
            lockPeriod: Number(item.lockPeriod) || 0,
            daysPassed: Number(item.daysPassed) || 0,
          };
        });

        // Add to our combined results
        allSavingHistory = [...allSavingHistory, ...formattedHistory];
      } catch (err) {
        console.log(
          `Error fetching data for SafeLock ${safeLockAddresses[i]}: ${err.message}`
        );
        // Continue to the next SafeLock address
      }
    }

    return allSavingHistory;
  } catch (error) {
    console.error("Failed to fetch saving history:", error);
    return [];
  }
}

/**
 * Get the withdrawal history for a user from the SafeLock contract
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

    // First get all SafeLock addresses from the factory
    const factoryContract = new Contract(
      SAFE_LOCK_FACTORY_ADDRESS,
      SAFE_LOCK_FACTORY_ABI,
      signer
    );

    // Get the user's SafeLock addresses
    const safeLockAddresses = await factoryContract.getSafeLocks();

    // If no SafeLocks, return empty array
    if (!safeLockAddresses || safeLockAddresses.length === 0) {
      return [];
    }

    // Process all SafeLocks and combine their data
    let allWithdrawalHistory = [];

    for (let i = 0; i < safeLockAddresses.length; i++) {
      try {
        const safeLockAddress = safeLockAddresses[i];
        const contract = new Contract(
          safeLockAddress,
          SAFE_LOCK_CONTRACT_ABI,
          signer
        );

        // Get withdrawal history for this specific contract
        const withdrawalHistory = await contract.getWithdrawalHistory();

        // Format the data from this contract
        const formattedHistory = withdrawalHistory.map((item, idx) => {
          // Ensure we have a valid date by checking if timestamp is valid
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
              : `withdraw-${userAddress.slice(0, 6)}-${Date.now()}-${idx}`;

          return {
            id: `WITHDRAW-${safeLockAddress.slice(0, 8)}-${idx}`,
            from: "SafeLock",
            to: "Wallet",
            amount: Number(item.amount) / 10 ** 6, // Assuming USDC with 6 decimals
            date: date,
            transactionId: txHash,
            type: "withdraw",
            safeLockAddress: safeLockAddress,
            lockPeriod: Number(item.lockPeriod) || 0,
          };
        });

        // Add to our combined results
        allWithdrawalHistory = [...allWithdrawalHistory, ...formattedHistory];
      } catch (err) {
        console.log(
          `Error fetching withdrawal data for SafeLock ${safeLockAddresses[i]}: ${err.message}`
        );
        // Continue to the next SafeLock address
      }
    }

    return allWithdrawalHistory;
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
    const savings = await getLockedSaving(embeddedWallet);
    const withdrawals = await getWithdrawalHistory(embeddedWallet);

    // Combine and sort by date (newest first)
    return [...savings, ...withdrawals].sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error("Failed to fetch transaction history:", error);
    return [];
  }
}

/**
 * Calculate safelock summary including total balance and active locks
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @returns {Promise<Object>} - Object with totalBalance and activeLocks
 */
export async function getSafelockSummary(embeddedWallet) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const lockedSavings = await getLockedSaving(embeddedWallet);

    // Filter for active locks (not withdrawn) and calculate total
    const activeLocks = lockedSavings.filter((lock) => !lock.withdrawn);
    const totalBalance = activeLocks.reduce(
      (sum, lock) => sum + lock.amount,
      0
    );

    return {
      totalBalance,
      activeLocks: activeLocks.length,
      isLoading: false,
    };
  } catch (error) {
    console.error("Failed to calculate safelock summary:", error);
    return {
      totalBalance: 0,
      activeLocks: 0,
      isLoading: false,
      error: error.message,
    };
  }
}
