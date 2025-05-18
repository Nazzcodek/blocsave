import { BrowserProvider, Contract } from "ethers";
import { formatUnits } from "ethers";

const USDC_CONTRACT = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const erc20ABI = [
  "function balanceOf(address account) external view returns (uint256)",
];

/**
 * Fetches the wallet USDC balance for a user
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @returns {Promise<number>} - USDC balance in user's wallet
 */
export async function getWalletUSDCBalance(embeddedWallet) {
  try {
    if (!embeddedWallet) {
      return 0;
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    // Call the USDC contract to get user's balance
    const usdcContract = new Contract(USDC_CONTRACT, erc20ABI, signer);
    const balance = await usdcContract.balanceOf(userAddress);

    // Convert from wei to USDC (assuming 6 decimals for USDC)
    return Number(formatUnits(balance, 6));
  } catch (error) {
    console.error("Failed to fetch wallet USDC balance:", error);
    return 0;
  }
}
