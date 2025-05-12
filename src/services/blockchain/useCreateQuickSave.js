import { ethers } from 'ethers';
import quicksave from "../../ABI/QuickSave.json";
import { BrowserProvider,Contract } from 'ethers';

const USDC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)"
];

const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const QUICK_SAVE_CONTRACT_ABI = quicksave.abi;
const QUICK_SAVE_CONTRACT_ADDRESS = "0xbDE2aDD49ff49B9Ad17DB6303eA4b5A830fe198A";
const baseSepoliaChainId = 84532;

export async function quickSave(embeddedWallet, amount, onSuccess, onError) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }
    
    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    
    const amountInUSDCUnits = ethers.parseUnits(amount, 6);
    const contract = new Contract(QUICK_SAVE_CONTRACT_ADDRESS, QUICK_SAVE_CONTRACT_ABI, signer);
    
    const tx = await contract.save(amountInUSDCUnits);
    
    const receipt = await tx.wait();
    
    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error("Failed to send USDC:", error);
    if (onError) onError(error);
    throw error;
  }
}