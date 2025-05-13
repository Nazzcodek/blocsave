import { ethers } from 'ethers';
import quicksave from "../../ABI/QuickSave.json";
import { BrowserProvider,Contract } from 'ethers';

const USDC_CONTRACT = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const QUICK_SAVE_CONTRACT_ABI = quicksave.abi;
const QUICK_SAVE_CONTRACT_ADDRESS = "0x1712ba39632f01d236cd1084f771a679b7cbd846";

const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
];

export async function quickSave(embeddedWallet, amount, onSuccess, onError) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }
    
    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const usdcContract = new Contract(USDC_CONTRACT, erc20ABI, signer);
    const amountInUSDCUnits = ethers.parseUnits(amount, 6);
    
    await usdcContract.approve(QUICK_SAVE_CONTRACT_ADDRESS, amountInUSDCUnits);
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