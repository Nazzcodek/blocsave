import { BrowserProvider, Contract } from "ethers";
import { formatUnits } from "ethers";
import quicksave from "../../ABI/QuickSave.json";

const QUICK_SAVE_CONTRACT_ABI = quicksave.abi;
const QUICK_SAVE_CONTRACT_ADDRESS =
  "0x4aA1fe43615476ff7Ee4913D71806D90419B8eb6";

/**
 * Fetches the QuickSave balance for a user from the blockchain
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @returns {Promise<number>} - QuickSave balance in USDC
 */
export async function getQuickSaveBalance(embeddedWallet) {
  try {
    if (!embeddedWallet) {
      return 0;
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    // Call the contract to get user's QuickSave balance
    const contract = new Contract(
      QUICK_SAVE_CONTRACT_ADDRESS,
      QUICK_SAVE_CONTRACT_ABI,
      signer
    );

    // Use the correct function from the contract ABI: balances(address)
    const balance = await contract.balances(userAddress);

    // Convert from wei to USDC (assuming 6 decimals for USDC)
    return Number(formatUnits(balance, 6));
  } catch (error) {
    console.error("Failed to fetch QuickSave balance:", error);

    // Try alternative methods if the first one fails
    try {
      const provider = await embeddedWallet.getEthereumProvider();
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const userAddress = await signer.getAddress();

      const contract = new Contract(
        QUICK_SAVE_CONTRACT_ADDRESS,
        QUICK_SAVE_CONTRACT_ABI,
        signer
      );

      // Try alternative function names that might exist in the contract
      // If your contract has a different function name to get user balance, use it here
      const savingsHistory = await contract.getSavingHistory(userAddress);
      const withdrawalHistory = await contract.getWithdrawalHistory(
        userAddress
      );

      // Calculate balance from transaction history
      let totalSaved = 0;
      let totalWithdrawn = 0;

      for (const saving of savingsHistory) {
        totalSaved += Number(formatUnits(saving.amount, 6));
      }

      for (const withdrawal of withdrawalHistory) {
        totalWithdrawn += Number(formatUnits(withdrawal.amount, 6));
      }

      return totalSaved - totalWithdrawn;
    } catch (fallbackError) {
      console.error("Failed to calculate balance from history:", fallbackError);
      return 0;
    }
  }
}
