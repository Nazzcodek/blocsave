import { ethers } from "ethers";
import adashe from "@/ABI/Adashe.json";
import { BrowserProvider, Contract } from "ethers";
import { getAllAdasheAddresses } from "./useAdasheFactory";

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

    // Starting createAdasheCircle process

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const walletAddress = await signer.getAddress();
    // Using wallet address for transaction

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Parse the weekly contribution to proper units (assuming USDC with 6 decimals)
    const contributionInUnits = ethers.parseUnits(
      weeklyContribution.toString(),
      6
    );

    // Creating Adashe circle with parameters

    // Create the Adashe circle
    const tx = await contract.createAdashe(
      circleName,
      contributionInUnits,
      noOfMembers,
      frequency,
      creatorName
    );

    // Transaction submitted
    const receipt = await tx.wait();
    // Transaction receipt received

    // Check if transaction was successful
    if (receipt.status === 1) {
      // Transaction succeeded
      if (onSuccess) onSuccess(receipt);
      return receipt;
    } else {
      const error = new Error("Transaction failed");
      // Transaction failed
      if (onError) onError(error);
      throw error;
    }
  } catch (error) {
    // Failed to create Adashe circle
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Join an existing Adashe circle by contract address with pre-flight checks
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} contractAddress - Address of the Adashe contract to join
 * @param {string} userName - Name of the user joining
 * @param {Function} onSuccess - Callback function on successful join
 * @param {Function} onError - Callback function on error
 * @returns {Promise} Transaction receipt or status message
 */
export async function joinAdasheCircle(
  embeddedWallet,
  contractAddress,
  userName,
  onSuccess,
  onError
) {
  try {
    if (!embeddedWallet) throw new Error("Embedded wallet not found");
    if (!contractAddress || typeof contractAddress !== "string")
      throw new Error("Contract address is required");
    if (!userName || typeof userName !== "string")
      throw new Error("User name is required");

    // Joining circle at specified address

    // Validate contract address format
    if (!contractAddress.startsWith("0x") || contractAddress.length !== 42) {
      throw new Error("Invalid contract address format");
    }

    // Connect to the contract directly using the provided address
    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const walletAddress = await signer.getAddress();
    const contract = new Contract(contractAddress, ADASHE_CONTRACT_ABI, signer);

    // User wallet address retrieved

    // Verify the contract exists and is valid by checking the adashe details
    try {
      const details = await contract.adashe();
      // Contract details retrieved
    } catch (error) {
      throw new Error("Invalid contract address or contract not found");
    }

    // PRE-FLIGHT CHECKS: Check membership status before attempting to join
    // Performing pre-flight membership checks...

    try {
      // Check if user is the owner/creator
      const owner = await contract.owner();
      // Contract owner retrieved

      if (owner.toLowerCase() === walletAddress.toLowerCase()) {
        const message =
          "You are the creator of this circle and are already a member.";
        // User is creator and already member
        return { message, alreadyMember: true, isOwner: true };
      }

      // Check if user is already a member
      const members = await contract.getMembers();
      // Current members retrieved

      const isMember = members.some(
        (member) => member.toLowerCase() === walletAddress.toLowerCase()
      );

      if (isMember) {
        const message = "You are already a member of this circle.";
        // User is already a member
        return { message, alreadyMember: true, isOwner: false };
      }

      // Check if circle is full
      const circleDetails = await contract.adashe();
      const maxMembers = Number(circleDetails[2]); // noOfMembers is the 3rd element

      if (members.length >= maxMembers) {
        throw new Error("This circle is full and cannot accept new members.");
      }

      // Pre-flight checks passed. User can join.
    } catch (error) {
      // If it's a specific error we threw, re-throw it
      if (error.message.includes("circle is full")) {
        throw error;
      }

      // Pre-flight check failed
      // Continue with the transaction if pre-flight checks fail due to network issues
      // Continuing with join attempt despite pre-flight check failure
    }

    // Attempt to join the Adashe circle with the user's name
    try {
      // Attempting to join circle...
      const tx = await contract.joinAdashe(userName);
      console.log("[joinAdasheCircle] Join transaction submitted:", tx.hash);

      const receipt = await tx.wait();
      console.log("[joinAdasheCircle] Successfully joined circle:", receipt);

      if (onSuccess) onSuccess(receipt);
      return receipt;
    } catch (joinError) {
      console.error("[joinAdasheCircle] Join transaction failed:", joinError);

      // Import our enhanced error handling
      const { handleContractError } = await import("@/utils/contractErrors");

      // Handle the error with context
      const userFriendlyError = handleContractError(joinError, {
        operation: "joinAdashe",
        contractAddress,
        userAddress: walletAddress,
      });

      // Create a more descriptive error
      const enhancedError = new Error(userFriendlyError);
      enhancedError.originalError = joinError;

      if (onError) onError(enhancedError);
      throw enhancedError;
    }
  } catch (error) {
    console.error("[joinAdasheCircle] Error:", error);
    if (onError) onError(error);
    throw error;
  }
}
/**
 * Contribute to an Adashe circle for a specific week with enhanced validation
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

    // Connect to the Adashe contract for pre-flight checks
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Pre-flight validation
    try {
      console.log("[contributeToAdashe] Performing pre-flight checks...");

      // Check if user is a member
      const members = await contract.getMembers();
      const isMember = members.some(
        (member) => member.toLowerCase() === walletAddress.toLowerCase()
      );

      if (!isMember) {
        throw new Error("You are not a member of this Adashe circle");
      }

      // Check if user has already contributed for this week
      const contribution = await contract.contributions(
        walletAddress,
        weekNumber
      );
      if (contribution.paid) {
        throw new Error(`You have already contributed for week ${weekNumber}`);
      }

      // Get circle details to validate contribution amount
      const adasheDetails = await contract.adashe();
      const expectedAmount = adasheDetails.weeklyContribution;

      if (amountInUnits.toString() !== expectedAmount.toString()) {
        const expectedInUsdc = ethers.formatUnits(expectedAmount, 6);
        throw new Error(
          `Incorrect contribution amount. Expected: ${expectedInUsdc} USDC, Got: ${amount} USDC`
        );
      }

      console.log("[contributeToAdashe] Pre-flight checks passed");
    } catch (preflightError) {
      console.error(
        "[contributeToAdashe] Pre-flight check failed:",
        preflightError
      );
      throw preflightError;
    }

    // Check USDC balance
    const usdcContract = new Contract(USDC_CONTRACT, erc20ABI, signer);
    const balance = await usdcContract.balanceOf(walletAddress);

    if (balance < amountInUnits) {
      const balanceInUsdc = ethers.formatUnits(balance, 6);
      throw new Error(
        `Insufficient USDC balance. Required: ${amount} USDC, Available: ${balanceInUsdc} USDC`
      );
    }

    // Approve the Adashe contract to spend USDC
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

    // Contribute to the Adashe
    console.log("[contributeToAdashe] Executing contribution transaction...");
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
 * Withdraw from an Adashe circle with enhanced validation
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
    const walletAddress = await signer.getAddress();

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Pre-flight checks before withdrawal
    try {
      console.log("[withdrawFromAdashe] Performing pre-flight checks...");

      // Check if user is a member
      const members = await contract.getMembers();
      const isMember = members.some(
        (member) => member.toLowerCase() === walletAddress.toLowerCase()
      );

      if (!isMember) {
        throw new Error("You are not a member of this Adashe circle");
      }

      // Get current week and user's position
      const currentWeek = await contract.getCurrentWeek();
      const memberIndex = members.findIndex(
        (member) => member.toLowerCase() === walletAddress.toLowerCase()
      );

      console.log("[withdrawFromAdashe] Current week:", currentWeek.toString());
      console.log("[withdrawFromAdashe] Member index:", memberIndex);
      console.log(
        "[withdrawFromAdashe] Expected recipient week:",
        memberIndex + 1
      );

      // Check if it's the user's turn to withdraw (their week)
      if (Number(currentWeek) !== memberIndex + 1) {
        throw new Error(
          `It's not your turn to withdraw. Current week is ${currentWeek}, your turn is week ${
            memberIndex + 1
          }`
        );
      }

      // Check if user has already withdrawn for this week
      const hasWithdrawn = await contract.memberWeekWithdrawals(
        walletAddress,
        currentWeek
      );

      if (hasWithdrawn) {
        throw new Error("You have already withdrawn for this week");
      }

      console.log("[withdrawFromAdashe] Pre-flight checks passed");
    } catch (preflightError) {
      console.error(
        "[withdrawFromAdashe] Pre-flight check failed:",
        preflightError
      );
      throw preflightError;
    }

    // Perform the withdrawal
    console.log("[withdrawFromAdashe] Executing withdrawal transaction...");
    const tx = await contract.withdraw();
    console.log("[withdrawFromAdashe] Transaction submitted, hash:", tx.hash);

    // Notify that transaction is being processed on blockchain
    console.log("[withdrawFromAdashe] Waiting for blockchain confirmation...");

    const receipt = await tx.wait();
    console.log(
      "[withdrawFromAdashe] Transaction confirmed! Receipt:",
      receipt
    );

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

    // Convert array-like Proxy result to a proper array to avoid "out of result range" errors
    // This ensures we can safely work with the array in the frontend
    const memberArray = [];
    for (let i = 0; i < members.length; i++) {
      // Only add the member if it exists and is a valid address
      if (
        members[i] &&
        typeof members[i] === "string" &&
        members[i].startsWith("0x")
      ) {
        memberArray.push(members[i]);
      }
    }

    console.log("[getAdasheMembers] Processed member array:", memberArray);
    return memberArray;
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
      console.warn("[getCurrentWeek] Embedded wallet not found");
      return 0;
    }

    if (!adasheAddress) {
      console.warn("[getCurrentWeek] No address provided");
      return 0; // Return 0 as default week if no address
    }

    console.log("[getCurrentWeek] Starting");
    console.log("[getCurrentWeek] Using Adashe address:", adasheAddress);

    // Get provider with timeout protection
    const providerPromise = embeddedWallet.getEthereumProvider();
    const provider = await Promise.race([
      providerPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Provider connection timeout")), 5000)
      ),
    ]).catch((error) => {
      console.error("[getCurrentWeek] Provider connection failed:", error);
      return null;
    });

    // If provider connection failed, return 0
    if (!provider) {
      return 0;
    }

    const ethersProvider = new BrowserProvider(provider);

    // Check if contract exists with timeout and error handling
    let code = "0x";
    try {
      const codePromise = ethersProvider.getCode(adasheAddress);
      code = await Promise.race([
        codePromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("getCode timeout")), 5000)
        ),
      ]);
    } catch (codeError) {
      console.warn(
        "[getCurrentWeek] Failed to check contract code:",
        codeError.message
      );
      // Continue execution even if code check fails - we'll try to call the contract anyway
    }

    // If code check succeeded and contract doesn't exist, return 0
    if (code === "0x") {
      console.warn(
        `[getCurrentWeek] No contract found at address: ${adasheAddress}`
      );
      return 0;
    }

    // Get signer with timeout protection
    const signerPromise = ethersProvider.getSigner();
    const signer = await Promise.race([
      signerPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Signer retrieval timeout")), 5000)
      ),
    ]).catch((error) => {
      console.error("[getCurrentWeek] Failed to get signer:", error);
      return null;
    });

    // If signer retrieval failed, return 0
    if (!signer) {
      return 0;
    }

    // Connect to the Adashe contract
    const contract = new Contract(adasheAddress, ADASHE_CONTRACT_ABI, signer);

    // Get current week with a timeout to prevent hanging
    try {
      const currentWeek = await Promise.race([
        contract.getCurrentWeek(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Contract call timeout")), 10000)
        ),
      ]);

      console.log("[getCurrentWeek] Current week:", currentWeek);
      return Number(currentWeek);
    } catch (contractError) {
      console.error(
        "[getCurrentWeek] Contract call failed:",
        contractError.message
      );
      // Return 0 if contract call fails
      return 0;
    }
  } catch (error) {
    console.error("[getCurrentWeek] Failed to get current week:", error);
    // Instead of throwing, return a default value
    return 0;
  }
}

export const getAdasheDetails = async (embeddedWallet, adasheAddress) => {
  try {
    // Import contract validation utility
    const { contractExistsAtAddress } = await import(
      "@/utils/contractValidation"
    );

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);

    // Validate contract address (fix: pass provider as first argument)
    const isValidContract = await contractExistsAtAddress(
      ethersProvider,
      adasheAddress
    );
    if (!isValidContract) {
      console.warn(`No valid contract found at address ${adasheAddress}`);
      return null;
    }

    const web3Provider = ethersProvider;
    const signer = await web3Provider.getSigner();

    // Create contract instance
    const adasheContract = new Contract(
      adasheAddress,
      ADASHE_CONTRACT_ABI,
      signer
    );

    // Set timeout to prevent hanging calls
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Timeout: getAdasheDetails call took too long")),
        15000
      )
    );

    // Fetch Adashe details with timeout
    const adasheDetails = await Promise.race([
      adasheContract.adashe(),
      timeoutPromise,
    ]);

    return adasheDetails;
  } catch (error) {
    console.error("Failed to get Adashe details:", error);
    // Return null instead of throwing to prevent UI crashes
    return null;
  }
};

/**
 * Get member names from the blockchain contract
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} adasheAddress - Address of the Adashe contract
 * @param {Array} memberAddresses - Array of member addresses
 * @returns {Promise<Array>} Array of member objects with address and name
 */
export async function getMemberNames(
  embeddedWallet,
  adasheAddress,
  memberAddresses
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log("[getMemberNames] Starting for addresses:", memberAddresses);

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const contract = new Contract(
      adasheAddress,
      ADASHE_CONTRACT_ABI,
      ethersProvider
    );

    const membersWithNames = [];

    for (const address of memberAddresses) {
      try {
        // Call the names mapping to get the name for this address
        const name = await contract.names(address);
        membersWithNames.push({
          address,
          name: name || address, // Fallback to address if name is empty
        });
      } catch (error) {
        console.warn(
          `[getMemberNames] Failed to get name for ${address}:`,
          error
        );
        // Fallback to address if name lookup fails
        membersWithNames.push({
          address,
          name: address,
        });
      }
    }

    console.log("[getMemberNames] Members with names:", membersWithNames);
    return membersWithNames;
  } catch (error) {
    console.error("[getMemberNames] Failed to get member names:", error);
    throw error;
  }
}

/**
 * Get the owner/creator of the Adashe circle
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} adasheAddress - Address of the Adashe contract
 * @returns {Promise<string>} Address of the owner/creator
 */
export async function getAdasheOwner(embeddedWallet, adasheAddress) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log("[getAdasheOwner] Getting owner for contract:", adasheAddress);

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const contract = new Contract(
      adasheAddress,
      ADASHE_CONTRACT_ABI,
      ethersProvider
    );

    // Call the owner function to get the creator's address
    const owner = await contract.owner();
    console.log("[getAdasheOwner] Owner address:", owner);

    return owner;
  } catch (error) {
    console.error("[getAdasheOwner] Failed to get owner:", error);
    throw error;
  }
}

/**
 * Get detailed member information including names and owner status
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} adasheAddress - Address of the Adashe contract
 * @param {string} currentUserAddress - Address of the current logged-in user
 * @returns {Promise<Array>} Array of detailed member objects
 */
export async function getDetailedMembers(
  embeddedWallet,
  adasheAddress,
  currentUserAddress
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log(
      "[getDetailedMembers] Getting detailed member info for:",
      adasheAddress
    );

    // Get member addresses
    const memberAddresses = await getAdasheMembers(
      embeddedWallet,
      adasheAddress
    );

    // Get owner address
    const ownerAddress = await getAdasheOwner(embeddedWallet, adasheAddress);

    // Get member names
    const membersWithNames = await getMemberNames(
      embeddedWallet,
      adasheAddress,
      memberAddresses
    );

    // Add additional metadata to each member
    const detailedMembers = membersWithNames.map((member) => ({
      ...member,
      isOwner: member.address.toLowerCase() === ownerAddress.toLowerCase(),
      isCurrentUser:
        member.address.toLowerCase() === currentUserAddress?.toLowerCase(),
      displayName:
        member.address.toLowerCase() === currentUserAddress?.toLowerCase()
          ? "you"
          : member.name,
    }));

    console.log("[getDetailedMembers] Detailed members:", detailedMembers);
    return detailedMembers;
  } catch (error) {
    console.error(
      "[getDetailedMembers] Failed to get detailed members:",
      error
    );
    throw error;
  }
}
