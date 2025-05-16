import { BrowserProvider, Contract } from "ethers";
import adasheABI from "../../ABI/Adashe.json";
import adasheFactoryABI from "../../ABI/AdasheFactory.json";
import { getAdasheContracts } from "./useAdasheContract";

// Adashe Factory contract address
const ADASHE_FACTORY_ADDRESS = "0x4231B9fa832eeFff2f473646bAe830aeCD0e558A";

/**
 * Get circle metadata for an Adashe contract
 * This function would normally be implemented in the smart contract
 * For this implementation, we'll need to build it from contract calls and events
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - The address of the Adashe contract
 * @returns {Promise<object>} - Circle metadata
 */
export async function getAdasheCircleMetadata(embeddedWallet, adasheAddress) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    const adasheContract = new Contract(adasheAddress, adasheABI.abi, signer);

    // Get members
    const members = await adasheContract.getMembers();

    // Get current week
    const currentWeek = await adasheContract.getCurrentWeek();

    // Get user's contribution progress
    const progress = await adasheContract.getContributionProgress(userAddress);

    // For demonstration purposes, we'll create a structured object with this data
    // In a real implementation, these values would be retrieved from the contract
    const metadata = {
      address: adasheAddress,
      membersCount: members.length,
      currentWeek: Number(currentWeek),
      totalContributedWeeks: Number(progress.contributedWeeks),
      totalWeeks: Number(progress.total),
      memberAddresses: members,
    };

    return metadata;
  } catch (error) {
    console.error("Failed to get Adashe circle metadata:", error);
    return null;
  }
}

/**
 * Get all Adashe circles that the user is part of
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @returns {Promise<Array<object>>} - Array of circle data
 */
export async function getAllUserAdasheCircles(embeddedWallet) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    // Get all contract addresses from factory
    const adasheAddresses = await getAdasheContracts(embeddedWallet);

    // Get metadata for each contract
    const circles = await Promise.all(
      adasheAddresses.map(async (address) => {
        return await getAdasheCircleMetadata(embeddedWallet, address);
      })
    );

    // Filter out null values from any failed requests
    return circles.filter((circle) => circle !== null);
  } catch (error) {
    console.error("Failed to get user's Adashe circles:", error);
    return [];
  }
}

/**
 * Format Adashe events into transaction history
 *
 * @param {Array<object>} events - Events from the blockchain
 * @param {object} members - Mapping of addresses to member info
 * @returns {Array<object>} - Formatted transaction history
 */
function formatAdasheTransactions(events, members) {
  return events.map((event, index) => {
    const { user, amount, timestamp } = event;
    const eventType = event.name; // This would be the event name from the contract

    // Format transaction data
    return {
      id: `tx-${index}`,
      type: eventType === "Contribution" ? "Adashe" : "Payout",
      user: members[user]?.name || "Unknown Member",
      address: user,
      week: `Week ${Math.floor(index / members.length) + 1}`, // Just an example calculation
      date: new Date(Number(timestamp) * 1000).toLocaleString(),
      amount:
        eventType === "Contribution"
          ? -Number(amount) / 1e6
          : Number(amount) / 1e6, // Convert from USDC units
    };
  });
}

/**
 * Get transaction history for an Adashe circle
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - The address of the Adashe contract
 * @returns {Promise<Array<object>>} - Transaction history
 */
export async function getAdasheTransactionHistory(
  embeddedWallet,
  adasheAddress
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);

    // Note: In a real implementation, you would query contract events
    // As a placeholder, this returns a mock transaction history

    // Get members from the contract to map addresses to names
    const members = await getAdasheMembers(embeddedWallet, adasheAddress);

    // Create a simple mapping of addresses to member info
    const memberMap = members.reduce((map, address, index) => {
      map[address] = {
        name: index === 0 ? "You" : `Member ${index + 1}`,
        address,
      };
      return map;
    }, {});

    // Mock events that would come from contract events in a real implementation
    const mockEvents = [
      {
        name: "Contribution",
        user: members[1],
        amount: "100000000", // 100 USDC with 6 decimals
        timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
      },
      {
        name: "Contribution",
        user: members[2],
        amount: "100000000",
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 2, // 2 days ago
      },
      {
        name: "Payout",
        user: members[0],
        amount: "500000000", // 500 USDC
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 3, // 3 days ago
      },
    ];

    return formatAdasheTransactions(mockEvents, memberMap);
  } catch (error) {
    console.error("Failed to get Adashe transaction history:", error);
    return [];
  }
}

/**
 * Helper function to get members from an Adashe contract
 */
async function getAdasheMembers(embeddedWallet, adasheAddress) {
  try {
    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const adasheContract = new Contract(adasheAddress, adasheABI.abi, signer);

    return await adasheContract.getMembers();
  } catch (error) {
    console.error("Failed to get Adashe members:", error);
    return [];
  }
}
