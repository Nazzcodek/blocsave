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

    // Starting getAdasheBalance for user

    // Check if contract exists at address
    const code = await ethersProvider.getCode(adasheAddress);
    if (!code || code === "0x") {
      // No contract deployed at address
      return {
        contributedWeeks: 0,
        totalContribution: 0,
        currentWeek: 0,
        isMember: false,
        memberDetails: null,
        isCompleted: false,
        canContribute: false,
        status: "invalid_contract",
      };
    }

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Check if user is a member first
    let isMember = false;
    try {
      isMember = await Promise.race([
        contract.isMember(userAddress),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("isMember timeout")), 10000)
        ),
      ]);
      // Is member check completed
    } catch (memberError) {
      // Error checking membership
    }

    // Get contribution progress safely
    let contributedWeeks = 0;
    let totalContribution = 0;

    try {
      const progress = await Promise.race([
        contract.getContributionProgress(userAddress),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("getContributionProgress timeout")),
            10000
          )
        ),
      ]);
      // Progress retrieved

      contributedWeeks = Number(progress[0]);
      totalContribution = Number(formatUnits(progress[1], 6)); // Assuming 6 decimals for USDC
    } catch (progressError) {
      // Error fetching contribution progress
      // Continue with default values if not a member
      if (!isMember) {
        // User is not a member, using default values
      }
    }

    // Get current week separately to isolate potential issues
    let currentWeek = 0;
    try {
      currentWeek = await Promise.race([
        contract.getCurrentWeek(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("getCurrentWeek timeout")), 10000)
        ),
      ]);
      // Current week retrieved
      currentWeek = Number(currentWeek);
    } catch (weekError) {
      // Error fetching current week
      // Use default value of 0
    }

    // Get additional member details if user is a member
    let memberDetails = null;
    if (isMember) {
      try {
        memberDetails = await Promise.race([
          contract.getMemberDetails(userAddress),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("getMemberDetails timeout")),
              10000
            )
          ),
        ]);
      } catch (detailsError) {
        console.error(
          "[getAdasheBalance] Error fetching member details:",
          detailsError
        );
      }
    }

    return {
      contributedWeeks,
      totalContribution,
      currentWeek,
      isMember,
      memberDetails,
      isCompleted: contributedWeeks >= currentWeek && currentWeek > 0,
      canContribute: isMember && contributedWeeks < currentWeek,
      status: "success",
    };
  } catch (error) {
    return {
      contributedWeeks: 0,
      totalContribution: 0,
      currentWeek: 0,
      isMember: false,
      memberDetails: null,
      isCompleted: false,
      canContribute: false,
      status: "error",
      error: error.message,
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
            isMember: false,
            memberDetails: null,
            isCompleted: false,
            canContribute: false,
            status: "error",
            error: error.message,
          };
        })
    );

    const balances = await Promise.all(balancePromises);

    return balances;
  } catch (error) {
    console.error(
      "[getAllAdasheBalances] Failed to fetch all adashe balances:",
      error
    );
    return [];
  }
}
