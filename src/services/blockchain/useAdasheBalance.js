import { BrowserProvider, Contract } from "ethers";
import { formatUnits } from "ethers";
import adashe from "../../ABI/Adashe.json";

const ADASHE_CONTRACT_ABI = adashe.abi;

/**
 * Fetches the adashe contribution progress and balance for a user
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - Address of the Adashe contract
 * @returns {Promise<object>} - Adashe progress and balance information
 */
export async function getAdasheBalance(embeddedWallet, adasheAddress) {
  try {
    if (!embeddedWallet || !adasheAddress) {
      throw new Error("Wallet or Adashe address not provided");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    console.log("[getAdasheBalance] Starting for user:", userAddress);
    console.log("[getAdasheBalance] Using Adashe address:", adasheAddress);

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Get contribution progress
    const progress = await contract.getContributionProgress(userAddress);
    console.log("[getAdasheBalance] Progress:", progress);

    const contributedWeeks = Number(progress[0]);
    const totalContribution = Number(formatUnits(progress[1], 6)); // Assuming 6 decimals for USDC

    // Get current week
    const currentWeek = await contract.getCurrentWeek();
    console.log("[getAdasheBalance] Current week:", currentWeek);

    return {
      contributedWeeks,
      totalContribution,
      currentWeek: Number(currentWeek),
      isCompleted: contributedWeeks >= Number(currentWeek),
    };
  } catch (error) {
    console.error("[getAdasheBalance] Failed to fetch adashe balance:", error);
    return {
      contributedWeeks: 0,
      totalContribution: 0,
      currentWeek: 0,
      isCompleted: false,
    };
  }
}

/**
 * Fetches multiple adashe balances for a user from an array of adashe contracts
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {Array<string>} adasheAddresses - Array of Adashe contract addresses
 * @returns {Promise<Array<object>>} - Array of Adashe progress and balance information
 */
export async function getAllAdasheBalances(embeddedWallet, adasheAddresses) {
  try {
    if (!embeddedWallet || !adasheAddresses || adasheAddresses.length === 0) {
      return [];
    }

    console.log(
      "[getAllAdasheBalances] Starting for addresses:",
      adasheAddresses
    );

    // Get balance info for each adashe contract
    const balancePromises = adasheAddresses.map((address) =>
      getAdasheBalance(embeddedWallet, address)
        .then((balanceInfo) => ({
          address,
          ...balanceInfo,
        }))
        .catch((error) => {
          console.error(
            `[getAllAdasheBalances] Error for address ${address}:`,
            error
          );
          return {
            address,
            contributedWeeks: 0,
            totalContribution: 0,
            currentWeek: 0,
            isCompleted: false,
            error: error.message,
          };
        })
    );

    const balances = await Promise.all(balancePromises);
    console.log("[getAllAdasheBalances] All balances:", balances);

    return balances;
  } catch (error) {
    console.error(
      "[getAllAdasheBalances] Failed to fetch all adashe balances:",
      error
    );
    return [];
  }
}
