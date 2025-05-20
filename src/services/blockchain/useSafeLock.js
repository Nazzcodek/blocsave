import { ethers } from "ethers";
import safelock from "@/ABI/SafeLock.json";
import safelockFactory from "@/ABI/SafeLockFactory.json";
import { BrowserProvider, Contract } from "ethers";

const USDC_CONTRACT = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const SAFE_LOCK_FACTORY_ADDRESS = "0x862473108b70afc86861e0cf4101010B95554184";

const SAFE_LOCK_CONTRACT_ABI = safelock.abi;
const SAFE_LOCK_FACTORY_ABI = safelockFactory.abi;

const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
];

/**
 * Creates a new SafeLock contract through the factory
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {number} durationDays - Duration in days for the SafeLock
 * @param {Function} onSuccess - Callback function on successful creation
 * @param {Function} onError - Callback function on error
 * @returns {Promise<string>} New SafeLock address
 */
export async function createSafelockAddress(
  embeddedWallet,
  durationDays,
  onSuccess,
  onError
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log(
      "[createSafelockAddress] Starting with duration:",
      durationDays
    );

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const walletAddress = await signer.getAddress();
    console.log("[createSafelockAddress] Using wallet address:", walletAddress);

    // Create a new SafeLock contract through the factory
    const factoryContract = new Contract(
      SAFE_LOCK_FACTORY_ADDRESS,
      SAFE_LOCK_FACTORY_ABI,
      signer
    );

    console.log(
      "[createSafelockAddress] Factory contract address:",
      SAFE_LOCK_FACTORY_ADDRESS
    );
    console.log(
      "[createSafelockAddress] Calling createSafeLock with duration:",
      durationDays
    );

    // Create the SafeLock contract
    const tx = await factoryContract.createSafeLock(durationDays);
    console.log("[createSafelockAddress] Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("[createSafelockAddress] Receipt:", receipt);

    // Get the created address from logs or events
    // Note: This implementation depends on your contract emitting an event with the created address
    // If your contract doesn't have such an event, you'll need to get addresses and find the new one
    const event = receipt.logs
      .filter(
        (log) =>
          log.address.toLowerCase() === SAFE_LOCK_FACTORY_ADDRESS.toLowerCase()
      )
      .map((log) => {
        try {
          return factoryContract.interface.parseLog(log);
        } catch (e) {
          console.log("[createSafelockAddress] Failed to parse log:", e);
          return null;
        }
      })
      .find((event) => event?.name === "SafeLockCreated"); // Assuming there's an event named SafeLockCreated

    console.log("[createSafelockAddress] Parsed event:", event);
    let newSafeLockAddress = event?.args?.safeLockAddress;
    console.log(
      "[createSafelockAddress] New address from event:",
      newSafeLockAddress
    );

    if (!newSafeLockAddress) {
      // Fallback method if event not found: get the latest address
      const safeLockAddresses = await factoryContract.getSafeLocks();
      if (safeLockAddresses && safeLockAddresses.length > 0) {
        newSafeLockAddress = safeLockAddresses[safeLockAddresses.length - 1];
        console.log(
          "[createSafelockAddress] Using last address:",
          newSafeLockAddress
        );
      } else {
        console.log("[createSafelockAddress] No SafeLock addresses found");
      }
    }

    if (onSuccess) onSuccess(newSafeLockAddress);
    console.log(
      "[createSafelockAddress] Returning address:",
      newSafeLockAddress
    );
    return newSafeLockAddress;
  } catch (error) {
    console.error("[createSafelockAddress] Failed to create SafeLock:", error);
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Deposit USDC tokens to a specific SafeLock contract
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {string} amount - Amount of USDC to deposit
 * @param {string} safeLockAddress - Address of the SafeLock contract to deposit to
 * @param {Function} onSuccess - Callback function on successful deposit
 * @param {Function} onError - Callback function on error
 * @returns {Promise} Transaction receipt
 */
export async function safeLockToken(
  embeddedWallet,
  amount,
  safeLockAddress, // Pass the SafeLock address explicitly
  onSuccess,
  onError
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    if (!safeLockAddress) {
      throw new Error("SafeLock address not provided");
    }

    console.log("[safeLockToken] Starting with amount:", amount);
    console.log("[safeLockToken] Using SafeLock address:", safeLockAddress);

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const walletAddress = await signer.getAddress();
    console.log("[safeLockToken] Using wallet address:", walletAddress);

    const usdcContract = new Contract(USDC_CONTRACT, erc20ABI, signer);

    const amountInUSDCUnits = ethers.parseUnits(amount, 6);
    console.log(
      "[safeLockToken] Amount in USDC units:",
      amountInUSDCUnits.toString()
    );

    // Approve the SafeLock contract to spend USDC
    console.log(
      "[safeLockToken] Approving USDC spend for SafeLock address:",
      safeLockAddress
    );
    const approveTx = await usdcContract.approve(
      safeLockAddress,
      amountInUSDCUnits
    );
    console.log("[safeLockToken] Approval transaction hash:", approveTx.hash);
    await approveTx.wait();
    console.log("[safeLockToken] Approval confirmed");

    // Deposit USDC to the SafeLock contract
    const contract = new Contract(
      safeLockAddress,
      SAFE_LOCK_CONTRACT_ABI,
      signer
    );

    console.log("[safeLockToken] Depositing to SafeLock contract");
    const tx = await contract.deposit(amountInUSDCUnits);
    console.log("[safeLockToken] Deposit transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("[safeLockToken] Deposit receipt:", receipt);

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error("[safeLockToken] Failed to deposit USDC to SafeLock:", error);
    if (onError) onError(error);
    throw error;
  }
}

export async function withdrawSafeLock(
  embeddedWallet,
  safeLockAddress,
  index,
  onSuccess,
  onError
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const contract = new Contract(
      safeLockAddress,
      SAFE_LOCK_CONTRACT_ABI,
      signer
    );

    const tx = await contract.withdraw(index);
    const receipt = await tx.wait();

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error("Failed to withdraw from SafeLock:", error);
    if (onError) onError(error);
    throw error;
  }
}

export async function emergencyWithdraw(
  embeddedWallet,
  safeLockAddress,
  onSuccess,
  onError
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const contract = new Contract(
      safeLockAddress,
      SAFE_LOCK_CONTRACT_ABI,
      signer
    );

    const tx = await contract.EmergencyWithdrawal();
    const receipt = await tx.wait();

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error("Failed to execute emergency withdrawal:", error);
    if (onError) onError(error);
    throw error;
  }
}

export async function getSafeLockInfo(embeddedWallet, safeLockAddress) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const contract = new Contract(
      safeLockAddress,
      SAFE_LOCK_CONTRACT_ABI,
      signer
    );

    const lockedSavings = await contract.getLockedSaving();
    return lockedSavings;
  } catch (error) {
    console.error("Failed to get SafeLock info:", error);
    throw error;
  }
}

export async function getLockedProgress(
  embeddedWallet,
  safeLockAddress,
  index
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const contract = new Contract(
      safeLockAddress,
      SAFE_LOCK_CONTRACT_ABI,
      signer
    );

    const progress = await contract.getLockedProgress(index);
    return {
      daysPassed: progress[0],
      totalDays: progress[1],
      daysRemaining: progress[2],
    };
  } catch (error) {
    console.error("Failed to get locked progress:", error);
    throw error;
  }
}
