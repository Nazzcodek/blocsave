import { ethers } from "ethers";
import quicksave from "../../ABI/QuickSave.json";
import { BrowserProvider, Contract } from "ethers";

const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const QUICK_SAVE_CONTRACT_ABI = quicksave.abi;
const QUICK_SAVE_CONTRACT_ADDRESS =
  "0x4aA1fe43615476ff7Ee4913D71806D90419B8eb6";

const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
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
    const contract = new Contract(
      QUICK_SAVE_CONTRACT_ADDRESS,
      QUICK_SAVE_CONTRACT_ABI,
      signer
    );

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

export async function withdrawQuickSave(
  embeddedWallet,
  amount,
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
    const amountInUSDCUnits = ethers.parseUnits(amount, 6);

    const contract = new Contract(
      QUICK_SAVE_CONTRACT_ADDRESS,
      QUICK_SAVE_CONTRACT_ABI,
      signer
    );

    const tx = await contract.withdraw(amountInUSDCUnits);

    const receipt = await tx.wait();

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error("Failed to withdraw USDC:", error);
    if (onError) onError(error);
    throw error;
  }
}

export async function emergencyWithdraw(embeddedWallet, onSuccess, onError) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const contract = new Contract(
      QUICK_SAVE_CONTRACT_ADDRESS,
      QUICK_SAVE_CONTRACT_ABI,
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
