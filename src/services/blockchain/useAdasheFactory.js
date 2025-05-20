import { BrowserProvider, Contract } from "ethers";
import adasheFactory from "@/ABI/AdasheFactory.json";

// The factory contract address as specified in the interface
const ADASHE_FACTORY_ADDRESS = "0x4231B9fa832eeFff2f473646bAe830aeCD0e558A";

const ADASHE_FACTORY_ABI = adasheFactory.abi;

/**
 * Creates a new Adashe contract through the factory
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @param {Function} onSuccess - Callback function on successful creation
 * @param {Function} onError - Callback function on error
 * @returns {Promise<string>} New Adashe address
 */
export async function createAdasheAddress(embeddedWallet, onSuccess, onError) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log("[createAdasheAddress] Starting creation process");

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const walletAddress = await signer.getAddress();
    console.log("[createAdasheAddress] Using wallet address:", walletAddress);

    // Create a new Adashe contract through the factory
    const factoryContract = new Contract(
      ADASHE_FACTORY_ADDRESS,
      ADASHE_FACTORY_ABI,
      signer
    );

    console.log(
      "[createAdasheAddress] Factory contract address:",
      ADASHE_FACTORY_ADDRESS
    );
    console.log("[createAdasheAddress] Calling createAdashe");

    // Create the Adashe contract
    const tx = await factoryContract.createAdashe();
    console.log("[createAdasheAddress] Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("[createAdasheAddress] Receipt:", receipt);

    // Get the created address from logs or events
    // Note: This implementation depends on your contract emitting an event with the created address
    // If your contract doesn't have such an event, you'll need to get addresses and find the new one
    const event = receipt.logs
      .filter(
        (log) =>
          log.address.toLowerCase() === ADASHE_FACTORY_ADDRESS.toLowerCase()
      )
      .map((log) => {
        try {
          return factoryContract.interface.parseLog(log);
        } catch (e) {
          console.log("[createAdasheAddress] Failed to parse log:", e);
          return null;
        }
      })
      .find((event) => event?.name === "AdasheCreated"); // Assuming there's an event named AdasheCreated

    console.log("[createAdasheAddress] Parsed event:", event);
    let newAdasheAddress = event?.args?.adasheAddress;
    console.log(
      "[createAdasheAddress] New address from event:",
      newAdasheAddress
    );

    if (!newAdasheAddress) {
      // Fallback method if event not found: get the latest address
      console.log(
        "[createAdasheAddress] No address in event, getting all adashes..."
      );
      const adasheAddresses = await factoryContract.getAdashes();
      console.log(
        "[createAdasheAddress] All adashe addresses:",
        adasheAddresses
      );
      if (adasheAddresses && adasheAddresses.length > 0) {
        newAdasheAddress = adasheAddresses[adasheAddresses.length - 1];
        console.log(
          "[createAdasheAddress] Using last address:",
          newAdasheAddress
        );
      } else {
        console.log("[createAdasheAddress] No Adashe addresses found");
      }
    }

    if (onSuccess) onSuccess(newAdasheAddress);
    console.log("[createAdasheAddress] Returning address:", newAdasheAddress);
    return newAdasheAddress;
  } catch (error) {
    console.error("[createAdasheAddress] Failed to create Adashe:", error);
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Get all the Adashe addresses created by the factory
 * @param {Object} embeddedWallet - User's embedded wallet from Privy
 * @returns {Promise<Array>} Array of Adashe addresses
 */
export async function getAllAdasheAddresses(embeddedWallet) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    console.log("[getAllAdasheAddresses] Starting");

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Get all Adashe addresses from the factory
    const factoryContract = new Contract(
      ADASHE_FACTORY_ADDRESS,
      ADASHE_FACTORY_ABI,
      signer
    );

    console.log("[getAllAdasheAddresses] Getting addresses from factory");
    const adasheAddresses = await factoryContract.getAdashes();
    console.log("[getAllAdasheAddresses] Addresses:", adasheAddresses);

    return adasheAddresses;
  } catch (error) {
    console.error(
      "[getAllAdasheAddresses] Failed to get Adashe addresses:",
      error
    );
    throw error;
  }
}
