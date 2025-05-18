import { BrowserProvider, Contract } from "ethers";
import { formatUnits } from "ethers";
import safelock from "../../ABI/SafeLock.json";

const SAFE_LOCK_CONTRACT_ABI = safelock.abi;
const SAFE_LOCK_CONTRACT_ADDRESS = "0x862473108b70afc86861e0cf4101010B95554184";

/**
 * Fetches the safelock balance for a user from the blockchain
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @returns {Promise<number>} - safelock balance in USDC
 */
export async function getSafeLockBalance(embeddedWallet) {
  try {
    if (!embeddedWallet) {
      return 0;
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    // Call the contract to get user's safelock balance
    const contract = new Contract(
      SAFE_LOCK_CONTRACT_ADDRESS,
      SAFE_LOCK_CONTRACT_ABI,
      signer
    );

    // Use the userBalance function or any appropriate function from your contract
    // Based on your safelock contract interface
    const balance = await contract.userBalance(userAddress);

    // Convert from wei to USDC (assuming 6 decimals for USDC)
    return Number(formatUnits(balance, 6));
  } catch (error) {
    console.error("Failed to fetch safelock balance:", error);

    // Try alternative methods if the first one fails
    try {
      const provider = await embeddedWallet.getEthereumProvider();
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const userAddress = await signer.getAddress();

      const contract = new Contract(
        SAFE_LOCK_CONTRACT_ADDRESS,
        SAFE_LOCK_CONTRACT_ABI,
        signer
      );

      // Try alternative function names that might exist in the contract
      // If your contract has a different function name to get user balance, use it here
      const savingsHistory = await contract.getLockedSaving(userAddress);
      const withdrawalHistory = await contract.getWithdrawalHistory(
        userAddress
      );

      // Calculate balance from transaction history
      let totalSAFEd = 0;
      let totalWithdrawn = 0;

      for (const saving of savingsHistory) {
        totalSAFEd += Number(formatUnits(saving.amount, 6));
      }

      for (const withdrawal of withdrawalHistory) {
        totalWithdrawn += Number(formatUnits(withdrawal.amount, 6));
      }

      return totalSAFEd - totalWithdrawn;
    } catch (fallbackError) {
      console.error("Failed to calculate balance from history:", fallbackError);
      return 0;
    }
  }
}
