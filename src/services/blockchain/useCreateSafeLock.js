import { ethers } from "ethers";
import safelock from "../../ABI/SafeLock.json";
import { BrowserProvider, Contract } from "ethers";

const USDC_CONTRACT = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const SAFE_LOCK_CONTRACT_ABI = safelock.abi;
const SAFE_LOCK_CONTRACT_ADDRESS = "0x862473108b70afc86861e0cf4101010B95554184";

const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
];

export async function safeLock(embeddedWallet, amount, onSuccess, onError) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const usdcContract = new Contract(USDC_CONTRACT, erc20ABI, signer);
    const amountInUSDCUnits = ethers.parseUnits(amount, 6);

    await usdcContract.approve(SAFE_LOCK_CONTRACT_ADDRESS, amountInUSDCUnits);
    const contract = new Contract(
      SAFE_LOCK_CONTRACT_ADDRESS,
      SAFE_LOCK_CONTRACT_ABI,
      signer
    );

    const tx = await contract.deposit(amountInUSDCUnits);

    const receipt = await tx.wait();

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error("Failed to send USDC:", error);
    if (onError) onError(error);
    throw error;
  }
}

export async function withdrawSafeLock(
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
      SAFE_LOCK_CONTRACT_ADDRESS,
      SAFE_LOCK_CONTRACT_ABI,
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
      SAFE_LOCK_CONTRACT_ADDRESS,
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
