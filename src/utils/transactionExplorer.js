/**
 * Utility functions to handle blockchain explorer links
 */

// Known chain IDs mapped to their block explorer URLs
const BLOCK_EXPLORERS = {
  // Ethereum Mainnet
  1: "https://etherscan.io/tx/",

  // Polygon (Matic) Mainnet
  137: "https://polygonscan.com/tx/",

  // Polygon Mumbai Testnet
  80001: "https://mumbai.polygonscan.com/tx/",

  // Base Mainnet
  8453: "https://basescan.org/tx/",

  // Base Goerli Testnet
  84531: "https://goerli.basescan.org/tx/",
};

/**
 * Get the transaction URL for a given chain ID and transaction hash
 *
 * @param {number} chainId - The blockchain network ID
 * @param {string} txHash - The transaction hash
 * @returns {string} - The full URL to the transaction on a block explorer
 */
export function getTransactionUrl(chainId, txHash) {
  const baseUrl = BLOCK_EXPLORERS[chainId] || BLOCK_EXPLORERS[1]; // Default to Ethereum
  return `${baseUrl}${txHash}`;
}

/**
 * Open a transaction in a new browser tab
 *
 * @param {number} chainId - The blockchain network ID
 * @param {string} txHash - The transaction hash
 */
export function openTransactionInExplorer(chainId, txHash) {
  const url = getTransactionUrl(chainId, txHash);
  window.open(url, "_blank");
}

/**
 * Format an address for display (shortens it)
 *
 * @param {string} address - The blockchain address
 * @param {number} prefixLength - Number of chars to show at the beginning
 * @param {number} suffixLength - Number of chars to show at the end
 * @returns {string} - Formatted address
 */
export function formatAddress(address, prefixLength = 6, suffixLength = 4) {
  if (!address) return "";
  if (address.length <= prefixLength + suffixLength) return address;

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

export default {
  getTransactionUrl,
  openTransactionInExplorer,
  formatAddress,
};
