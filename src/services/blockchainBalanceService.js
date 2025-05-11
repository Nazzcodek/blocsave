import { parseUnits, formatUnits } from "viem";

/**
 * Service for handling interactions with blockchain contracts and assets
 */
const blockchainBalanceService = {
  /**
   * Get token balance for a specific address
   * @param {string} address - Wallet address to check balance for
   * @param {string} tokenAddress - Token contract address
   * @param {Object} client - Viem client instance
   * @returns {Promise<string>} Promise with token balance in human readable format
   */
  getTokenBalance: async (address, tokenAddress, client) => {
    try {
      // Simple example of checking an ERC20 balance
      // In a real app, you would call the balanceOf function on the token contract
      const balance = await client.readContract({
        address: tokenAddress,
        abi: [
          {
            name: "balanceOf",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "account", type: "address" }],
            outputs: [{ name: "balance", type: "uint256" }],
          },
        ],
        functionName: "balanceOf",
        args: [address],
      });

      // Convert from wei to token units
      return formatUnits(balance, 6); // Assuming USDC with 6 decimals
    } catch (error) {
      console.error("Error fetching token balance:", error);
      throw error;
    }
  },

  /**
   * Fund wallet by transferring tokens
   * @param {number|string} amount - Amount to transfer
   * @param {string} address - Destination address
   * @param {string} tokenAddress - Token contract address
   * @param {Object} client - Viem client instance
   * @param {Object} walletClient - Viem wallet client instance
   * @returns {Promise<string>} Promise with transaction hash
   */
  fundWallet: async (amount, address, tokenAddress, client, walletClient) => {
    try {
      // In a real app, you would handle the token transfer or deposit function
      const amountInWei = parseUnits(amount.toString(), 6); // Assuming USDC with 6 decimals

      const { request } = await client.simulateContract({
        address: tokenAddress,
        abi: [
          {
            name: "transfer",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ name: "success", type: "bool" }],
          },
        ],
        functionName: "transfer",
        args: [address, amountInWei],
      });

      return await walletClient.writeContract(request);
    } catch (error) {
      console.error("Error funding wallet:", error);
      throw error;
    }
  },

  /**
   * Withdraw from wallet
   * @param {number|string} amount - Amount to withdraw
   * @param {string} targetAddress - Destination address for withdrawal
   * @param {string} tokenAddress - Token contract address
   * @param {Object} client - Viem client instance
   * @param {Object} walletClient - Viem wallet client instance
   * @returns {Promise<string>} Promise with transaction hash
   */
  withdrawFromWallet: async (
    amount,
    targetAddress,
    tokenAddress,
    client,
    walletClient
  ) => {
    try {
      // In a real app, you would handle the token transfer or withdrawal function
      const amountInWei = parseUnits(amount.toString(), 6); // Assuming USDC with 6 decimals

      const { request } = await client.simulateContract({
        address: tokenAddress,
        abi: [
          {
            name: "transfer",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ name: "success", type: "bool" }],
          },
        ],
        functionName: "transfer",
        args: [targetAddress, amountInWei],
      });

      return await walletClient.writeContract(request);
    } catch (error) {
      console.error("Error withdrawing from wallet:", error);
      throw error;
    }
  },

  /**
   * Get transaction history for an address
   * @param {string} address - Wallet address to fetch transactions for
   * @param {Object} client - Viem client instance
   * @returns {Promise<Array>} Promise with transaction history
   */
  getTransactionHistory: async (address, client) => {
    try {
      // Note: This is a simplified example
      // In a real app, you would likely use an indexer API or subgraph
      const blockNumber = await client.getBlockNumber();
      const transactions = await client.getTransactionsByAddress({
        address,
        fromBlock: blockNumber - BigInt(1000), // Last 1000 blocks
        toBlock: blockNumber,
      });

      return transactions;
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw error;
    }
  },
};

export default blockchainBalanceService;
