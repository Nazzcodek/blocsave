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

    // Store addresses before transaction to compare later
    const addressesBefore = await factoryContract.getAdashes();
    const addressesBeforeSet = new Set(
      addressesBefore.map((addr) => addr.toLowerCase())
    );
    console.log(
      "[createAdasheAddress] Addresses before:",
      addressesBefore.length
    );

    // Create the Adashe contract
    const tx = await factoryContract.createAdashe();
    console.log("[createAdasheAddress] Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("[createAdasheAddress] Receipt:", receipt);

    // First attempt: Try to get the address from contract event
    let newAdasheAddress = null;

    // Get event from transaction logs
    for (const log of receipt.logs) {
      // Check if this log is from our factory contract
      if (log.address.toLowerCase() === ADASHE_FACTORY_ADDRESS.toLowerCase()) {
        try {
          // Use ethers v6 parseLog format
          const parsedLog = factoryContract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          // Check if this is the AdasheCreated event
          if (parsedLog && parsedLog.name === "AdasheCreated") {
            console.log(
              "[createAdasheAddress] Found AdasheCreated event:",
              parsedLog
            );

            // Try different argument formats based on your contract's event structure
            if (parsedLog.args) {
              if (parsedLog.args.adashe) {
                newAdasheAddress = parsedLog.args.adashe;
              } else if (parsedLog.args.adasheAddress) {
                newAdasheAddress = parsedLog.args.adasheAddress;
              } else if (
                parsedLog.args[0] &&
                typeof parsedLog.args[0] === "string"
              ) {
                newAdasheAddress = parsedLog.args[0];
              }
              break;
            }
          }
        } catch (parseError) {
          console.warn("[createAdasheAddress] Error parsing log:", parseError);
        }
      }
    }

    // Second attempt: Compare addresses before and after
    if (!newAdasheAddress) {
      console.log(
        "[createAdasheAddress] No address from event, comparing addresses before and after"
      );
      const addressesAfter = await factoryContract.getAdashes();
      console.log(
        "[createAdasheAddress] Addresses after:",
        addressesAfter.length
      );

      // Find new addresses that weren't there before
      const newAddresses = addressesAfter.filter(
        (addr) => !addressesBeforeSet.has(addr.toLowerCase())
      );

      console.log("[createAdasheAddress] New addresses found:", newAddresses);

      if (newAddresses.length === 1) {
        // If there's exactly one new address, it must be ours
        newAdasheAddress = newAddresses[0];
        console.log(
          "[createAdasheAddress] Found single new address:",
          newAdasheAddress
        );
      } else if (newAddresses.length > 1) {
        // Multiple new addresses found, we need to verify ownership
        console.log(
          "[createAdasheAddress] Multiple new addresses found, verifying ownership"
        );

        // Find the first address that has our wallet as owner
        for (const addr of newAddresses) {
          try {
            const ADASHE_CONTRACT_ABI = [
              "function owner() view returns (address)",
            ];
            const adasheContract = new Contract(
              addr,
              ADASHE_CONTRACT_ABI,
              signer
            );
            const owner = await adasheContract.owner();

            if (owner.toLowerCase() === walletAddress.toLowerCase()) {
              newAdasheAddress = addr;
              console.log(
                "[createAdasheAddress] Found address with matching owner:",
                newAdasheAddress
              );
              break;
            }
          } catch (error) {
            console.warn(
              `[createAdasheAddress] Error checking owner for ${addr}:`,
              error
            );
          }
        }
      }
    }

    // If we still couldn't find the address, throw an error
    if (!newAdasheAddress) {
      throw new Error("Failed to get the created Adashe address");
    }

    // Success callback if provided
    if (onSuccess) onSuccess(newAdasheAddress);

    console.log("[createAdasheAddress] Returning address:", newAdasheAddress);
    return newAdasheAddress;
  } catch (error) {
    console.error(
      "[createAdasheAddress] Error in Adashe creation process:",
      error
    );
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

    // Check if factory contract exists at address
    try {
      const code = await ethersProvider.getCode(ADASHE_FACTORY_ADDRESS);
      if (!code || code === "0x") {
        console.warn(
          `[getAllAdasheAddresses] No factory contract at address: ${ADASHE_FACTORY_ADDRESS}`
        );
        return [];
      }
    } catch (codeError) {
      console.error(
        "[getAllAdasheAddresses] Error checking contract code:",
        codeError
      );
      return [];
    }

    // Get all Adashe addresses from the factory
    const factoryContract = new Contract(
      ADASHE_FACTORY_ADDRESS,
      ADASHE_FACTORY_ABI,
      signer
    );

    console.log("[getAllAdasheAddresses] Getting addresses from factory");

    // Use a timeout to prevent hanging
    const adasheAddresses = await Promise.race([
      factoryContract.getAdashes(),
      new Promise((resolve, reject) =>
        setTimeout(() => {
          console.warn("[getAllAdasheAddresses] Request timed out");
          resolve([]); // Resolve with empty array on timeout rather than rejecting
        }, 15000)
      ),
    ]);

    console.log("[getAllAdasheAddresses] Addresses:", adasheAddresses);

    // Filter out any invalid addresses
    const validAddresses = adasheAddresses.filter(
      (addr) => addr && typeof addr === "string" && addr.startsWith("0x")
    );

    if (validAddresses.length < adasheAddresses.length) {
      console.warn(
        `[getAllAdasheAddresses] Filtered out ${
          adasheAddresses.length - validAddresses.length
        } invalid addresses`
      );
    }

    return validAddresses;
  } catch (error) {
    console.error(
      "[getAllAdasheAddresses] Failed to get Adashe addresses:",
      error
    );
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
}
