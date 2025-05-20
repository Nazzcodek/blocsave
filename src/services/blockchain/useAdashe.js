import { ethers } from "ethers";
import adashe from "@/ABI/Adashe.json";
import { BrowserProvider, Contract } from "ethers";

const USDC_CONTRACT = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const ADASHE_CONTRACT_ABI = adashe.abi;

const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
];

/**
 * Creates a new Adashe circle with the provided parameters
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} adasheAddress - Address of the Adashe contract (created by factory)
 * @param {string} circleName - Name of the Adashe circle
 * @param {number} weeklyContribution - Weekly contribution amount
 * @param {number} noOfMembers - Number of members for the circle
 * @param {string} frequency - Frequency of contributions
 * @param {string} creatorName - Name of the creator
 * @param {Function} onSuccess - Callback function on successful creation
 * @param {Function} onError - Callback function on error
 * @returns {Promise} Transaction receipt
 */
export async function createAdasheCircle(
  embeddedWallet,
  adasheAddress,
  circleName,
  weeklyContribution,
  noOfMembers,
  frequency,
  creatorName,
  onSuccess,
  onError
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    if (!adasheAddress) {
      throw new Error("Adashe address not provided");
    }

    console.log("[createAdasheCircle] Starting with circle name:", circleName);
    console.log("[createAdasheCircle] Using Adashe address:", adasheAddress);

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const walletAddress = await signer.getAddress();
    console.log("[createAdasheCircle] Using wallet address:", walletAddress);

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Parse the weekly contribution to proper units (assuming USDC with 6 decimals)
    const contributionInUnits = ethers.parseUnits(
      weeklyContribution.toString(),
      6
    );

    console.log("[createAdasheCircle] Creating Adashe circle with params:", {
      circleName,
      weeklyContribution: contributionInUnits.toString(),
      noOfMembers,
      frequency,
      creatorName,
    });

    // Create the Adashe circle
    const tx = await contract.createAdashe(
      circleName,
      contributionInUnits,
      noOfMembers,
      frequency,
      creatorName
    );

    console.log("[createAdasheCircle] Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("[createAdasheCircle] Receipt:", receipt);

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error(
      "[createAdasheCircle] Failed to create Adashe circle:",
      error
    );
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Join an existing Adashe circle
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} adasheAddress - Address of the Adashe contract
 * @param {string} name - Name of the member joining
 * @param {Function} onSuccess - Callback function on successful join
 * @param {Function} onError - Callback function on error
 * @returns {Promise} Transaction receipt
 */
export async function joinAdasheCircle(
  embeddedWallet,
  adasheAddress,
  name,
  onSuccess,
  onError
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log("[joinAdasheCircle] Starting with name:", name);
    console.log("[joinAdasheCircle] Using Adashe address:", adasheAddress);

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const walletAddress = await signer.getAddress();
    console.log("[joinAdasheCircle] Using wallet address:", walletAddress);

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Join the Adashe circle
    const tx = await contract.joinAdashe(name);
    console.log("[joinAdasheCircle] Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("[joinAdasheCircle] Receipt:", receipt);

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error("[joinAdasheCircle] Failed to join Adashe circle:", error);
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Contribute to an Adashe circle for a specific week
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} adasheAddress - Address of the Adashe contract
 * @param {number} weekNumber - Week number to contribute for
 * @param {string} amount - Amount to contribute
 * @param {Function} onSuccess - Callback function on successful contribution
 * @param {Function} onError - Callback function on error
 * @returns {Promise} Transaction receipt
 */
export async function contributeToAdashe(
  embeddedWallet,
  adasheAddress,
  weekNumber,
  amount,
  onSuccess,
  onError
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log("[contributeToAdashe] Starting with amount:", amount);
    console.log("[contributeToAdashe] For week number:", weekNumber);
    console.log("[contributeToAdashe] Using Adashe address:", adasheAddress);

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const walletAddress = await signer.getAddress();
    console.log("[contributeToAdashe] Using wallet address:", walletAddress);

    // Parse the amount to proper units (assuming USDC with 6 decimals)
    const amountInUnits = ethers.parseUnits(amount.toString(), 6);
    console.log(
      "[contributeToAdashe] Amount in USDC units:",
      amountInUnits.toString()
    );

    // Approve the Adashe contract to spend USDC
    const usdcContract = new Contract(USDC_CONTRACT, erc20ABI, signer);
    console.log(
      "[contributeToAdashe] Approving USDC spend for Adashe address:",
      adasheAddress
    );
    const approveTx = await usdcContract.approve(adasheAddress, amountInUnits);
    console.log(
      "[contributeToAdashe] Approval transaction hash:",
      approveTx.hash
    );
    await approveTx.wait();
    console.log("[contributeToAdashe] Approval confirmed");

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Contribute to the Adashe
    const tx = await contract.contribute(weekNumber, amountInUnits);
    console.log("[contributeToAdashe] Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("[contributeToAdashe] Receipt:", receipt);

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error(
      "[contributeToAdashe] Failed to contribute to Adashe:",
      error
    );
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Withdraw from an Adashe circle
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} adasheAddress - Address of the Adashe contract
 * @param {Function} onSuccess - Callback function on successful withdrawal
 * @param {Function} onError - Callback function on error
 * @returns {Promise} Transaction receipt
 */
export async function withdrawFromAdashe(
  embeddedWallet,
  adasheAddress,
  onSuccess,
  onError
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log("[withdrawFromAdashe] Starting withdrawal");
    console.log("[withdrawFromAdashe] Using Adashe address:", adasheAddress);

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Withdraw from the Adashe
    const tx = await contract.withdraw();
    console.log("[withdrawFromAdashe] Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("[withdrawFromAdashe] Receipt:", receipt);

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error(
      "[withdrawFromAdashe] Failed to withdraw from Adashe:",
      error
    );
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Get members of an Adashe circle
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} adasheAddress - Address of the Adashe contract
 * @returns {Promise<Array>} Array of member addresses
 */
export async function getAdasheMembers(embeddedWallet, adasheAddress) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log("[getAdasheMembers] Starting");
    console.log("[getAdasheMembers] Using Adashe address:", adasheAddress);

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Get members of the Adashe
    const members = await contract.getMembers();
    console.log("[getAdasheMembers] Members:", members);

    return members;
  } catch (error) {
    console.error("[getAdasheMembers] Failed to get Adashe members:", error);
    throw error;
  }
}

/**
 * Get contribution progress of a user in an Adashe circle
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} adasheAddress - Address of the Adashe contract
 * @param {string} userAddress - Address of the user to check
 * @returns {Promise<Object>} Contribution progress
 */
export async function getContributionProgress(
  embeddedWallet,
  adasheAddress,
  userAddress
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log("[getContributionProgress] Starting");
    console.log(
      "[getContributionProgress] Using Adashe address:",
      adasheAddress
    );
    console.log("[getContributionProgress] For user:", userAddress);

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Get contribution progress
    const progress = await contract.getContributionProgress(userAddress);
    console.log("[getContributionProgress] Progress:", progress);

    return {
      contributedWeeks: progress[0],
      total: progress[1],
    };
  } catch (error) {
    console.error(
      "[getContributionProgress] Failed to get contribution progress:",
      error
    );
    throw error;
  }
}

/**
 * Get current week of an Adashe circle
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} adasheAddress - Address of the Adashe contract
 * @returns {Promise<number>} Current week number
 */
export async function getCurrentWeek(embeddedWallet, adasheAddress) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log("[getCurrentWeek] Starting");
    console.log("[getCurrentWeek] Using Adashe address:", adasheAddress);

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Get current week
    const currentWeek = await contract.getCurrentWeek();
    console.log("[getCurrentWeek] Current week:", currentWeek);

    return currentWeek;
  } catch (error) {
    console.error("[getCurrentWeek] Failed to get current week:", error);
    throw error;
  }
}
