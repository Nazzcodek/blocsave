import { BrowserProvider, Contract } from "ethers";
import { formatUnits } from "ethers";
import safelock from "../../ABI/SafeLock.json";

const SAFE_LOCK_CONTRACT_ABI = safelock.abi;
const SAFE_LOCK_CONTRACT_ADDRESS =
  "0x862473108b70afc86861e0cf4101010B95554184";
const USDC_CONTRACT = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const erc20ABI = [
  "function balanceOf(address account) external view returns (uint256)",
];


export async function quickSafeLock(embeddedWallet, amount, daysInNUmber) {
  try {
      if (!embeddedWallet) {
          throw new Error("Embedded wallet not found");
        }
    
        const provider = await embeddedWallet.getEthereumProvider();
        const ethersProvider = new BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const usdcContract = new Contract(USDC_CONTRACT, erc20ABI, signer);
        const amountInUSDCUnits = ethers.parseUnits(amount, 6);

        const safelockfactoryContract = new Contract(SAFE_LOCK_CONTRACT_ADDRESS, safelock.abi, signer);

        const tx = safelockfactoryContract.createSafeLock(daysInNUmber);

        const receipt = await tx.wait();

        if (onSuccess) {
          onSuccess(receipt);

          const depositTx =  safelockfactoryContract.deposit(amount);
          const depositReceipt = await depositTx.wait();

          if (onSuccess){
            onSuccess(depositReceipt );
          }
        }

  } catch (error) {
    console.error("Failed to create lock save:", error);
    if (onError) onError(error);
    throw error;
  }
}

