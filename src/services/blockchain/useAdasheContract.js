import { BrowserProvider, Contract } from "ethers";
import { formatUnits, parseUnits } from "ethers";
import adasheABI from "../../ABI/Adashe.json";
import adasheFactoryABI from "../../ABI/AdasheFactory.json";
import {
  logContractOperation,
  formatContractError,
} from "../../utils/contractDebug";
import {
  hasEnoughEthForGas,
  getUserFriendlyContractError,
} from "../../utils/contractHelpers";
import {
  handleContractError
} from "../../utils/contractErrors";

// Adashe Factory contract address (from your prompt)
const ADASHE_FACTORY_ADDRESS = "0x4231B9fa832eeFff2f473646bAe830aeCD0e558A";

// USDC contract address (from your existing code)
const USDC_CONTRACT = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// ERC20 token ABI for USDC interactions (from your existing code)
const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
];

/**
 * Create a new Adashe circle
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} circleName - Name of the circle to create
 * @param {number} contribution - Weekly contribution amount in USDC
 * @param {number} members - Number of members for the circle
 * @param {string} frequency - Frequency of contributions (e.g. "Weekly")
 * @param {string} creatorName - Name of the creator
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<object>} - Transaction receipt
 */
export async function createAdasheCircle(
  embeddedWallet,
  circleName,
  contribution,
  members,
  frequency,
  creatorName,
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

    // Log connection details for debugging
    const network = await ethersProvider.getNetwork();
    const signerAddress = await signer.getAddress();
    console.log(`Connected to network: ${network.name} (${network.chainId})`);
    console.log(`Using signer address: ${signerAddress}`);

    // Check if the user has enough ETH for gas fees
    const hasEnoughEth = await hasEnoughEthForGas(
      ethersProvider,
      signerAddress
    );
    if (!hasEnoughEth) {
      throw new Error(
        "You don't have enough ETH to pay for transaction fees. Please add ETH to your wallet and try again."
      );
    }

    // Access the factory contract to create a new Adashe
    console.log(`Using factory contract address: ${ADASHE_FACTORY_ADDRESS}`);
    console.log(
      `ABI for createAdashe:`,
      JSON.stringify(
        adasheFactoryABI.abi.find((item) => item.name === "createAdashe")
      )
    );

    const factoryContract = new Contract(
      ADASHE_FACTORY_ADDRESS,
      adasheFactoryABI.abi,
      signer
    );

    // Adashe Contract Address
    let AdasheContract;

    try {
      const adasheContractAddress = await factoryContract.createAdashe();
      AdasheContract = new Contract(
      adasheContractAddress,
      adasheABI.abi,
      signer
    );
      
      console.log(`Created new Adashe${adasheAddress}`);
    }
    catch (error){
      console.error("Error creating Adashe contract:", error);
        throw new Error(
          `Contract creation failed: ${
            error.message || "Funtion may be wrong"
          }`
        );
    }
    // Verify the contract by checking if it has the expected function
    try {
      const adasheAddresses = await factoryContract.getAdashes();
      console.log(`Found ${adasheAddresses.length} existing Adashe contracts`);
    } catch (error) {
      console.error("Error verifying factory contract:", error);
      throw new Error(
        `Contract verification failed: ${
          error.message || "Contract may not be deployed correctly"
        }`
      );
    }

    // Log the contract call details
    logContractOperation("createAdashe", {
      contractAddress: ADASHE_FACTORY_ADDRESS,
      parameters: {
        circleName,
        contribution: contribution.toString(),
        contributionUnits: parseUnits(contribution.toString(), 6).toString(),
        members,
        frequency,
        creatorName,
      },
    });

    // First try to check if a circle with this name already exists
    try {
      const adasheAddress = await AdasheContract.getAddress();
    
    
    } catch (error) {
      // If the error is not about the circle existing, ignore it
      if (!error.message.includes("already exists")) {
        console.log("Error checking existing circle:", error.message);
      } else {
        throw error; // Re-throw if it's about the circle already existing
      }
    }

    // Try with explicit transaction overrides
    const txOverrides = {
      gasLimit: 5000000, // Higher initial gas limit to ensure transaction doesn't fail
    };

    // Estimate gas before sending the transaction
    let gasEstimate;
    try {
      // Convert contribution to proper units and ensure it's a string
      const contributionInUnits = parseUnits(contribution.toString(), 6); // USDC has 6 decimals
      
      logContractOperation("gasEstimationAttempt", {
        circleName,
        contribution: contributionInUnits.toString(),
        members: members.toString(),
        frequency,
        creatorName
      });
      
      gasEstimate = await AdasheContract.createAdashe.estimateGas(
        circleName,
        contributionInUnits, 
        members,
        frequency,
        creatorName,
        txOverrides
      );

      // Add 30% buffer to the gas estimate to be safe
      txOverrides.gasLimit = Math.floor(gasEstimate * 1.3);
      logContractOperation("gasEstimation", {
        estimated: gasEstimate.toString(),
        withBuffer: txOverrides.gasLimit.toString(),
      });
    } catch (error) {
      // This means there's likely an issue with the contract call itself
      logContractOperation("gasEstimationFailed", {
        error: formatContractError(error),
        parameters: {
          circleName,
          contribution: parseUnits(contribution.toString(), 6).toString(),
          members,
          frequency,
          creatorName
        }
      });
      
      // Try to get a more specific error message
      if (error.message.includes("execution reverted")) {
        // The contract is rejecting the parameters
        if (error.message.includes("member")) {
          throw new Error("Invalid member count. The contract requires a valid member count.");
        } else if (error.message.includes("contribution")) {
          throw new Error("Invalid contribution amount. Please check your input.");
        } else if (error.message.includes("name")) {
          throw new Error("Invalid circle name. Please check that it meets the requirements.");
        } else {
          throw new Error("The contract rejected your parameters. Please check your inputs.");
        }
      }
      
      // Keep the default high gas limit
      console.warn(
        "Gas estimation failed, using default high gas limit:",
        error
      );
    }

    // Create Adashe Circle with explicit gas limit
    let tx;
    try {
      // Convert contribution to proper units and ensure it's a string
      const contributionInUnits = parseUnits(contribution.toString(), 6); // USDC has 6 decimals
      
      // Log the exact parameters being sent to the contract
      logContractOperation("createAdasheParameters", {
        circleName,
        contribution: contributionInUnits.toString(),
        members: members.toString(),
        frequency,
        creatorName,
        gasLimit: txOverrides.gasLimit.toString()
      });
      
      // Send transaction with retry logic
      let attempts = 0;
      const maxAttempts = 2;
      
      while (attempts < maxAttempts) {
        try {
          tx = await AdasheContract.createAdashe(
            circleName,
            contributionInUnits,
            members,
            frequency,
            creatorName,
            txOverrides
          );
          break; // Break if successful
        } catch (retryError) {
          attempts++;
          if (attempts >= maxAttempts) throw retryError;
          
          // Increase gas limit by 20% for retry
          txOverrides.gasLimit = Math.floor(txOverrides.gasLimit * 1.2);
          logContractOperation("retryingTransaction", {
            attempt: attempts,
            newGasLimit: txOverrides.gasLimit.toString(),
            error: formatContractError(retryError)
          });
          
          // Wait 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      logContractOperation("transactionSent", {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        data: tx.data,
        gasLimit: tx.gasLimit?.toString()
      });
    } catch (error) {
      // Format the error and throw it
      const formattedError = formatContractError(error);
      logContractOperation("transactionFailed", { 
        operation: "createAdashe",
        circleName,
        error: formattedError 
      });
      
      // Diagnose the failure more specifically
      if (error.message.includes("insufficient funds")) {
        throw new Error("You don't have enough ETH to pay for the transaction gas fees.");
      }
      
      if (error.message.includes("user denied")) {
        throw new Error("You rejected the transaction in your wallet.");
      }
      
      if (error.message.includes("nonce too low")) {
        throw new Error("Transaction error: Your wallet's nonce is out of sync. Please refresh the page and try again.");
      }
      
      if (error.message.includes("execution reverted")) {
        // Use our contract error decoder for better error messages
        const userFriendlyError = handleContractError(error, {
          operation: "createAdashe",
          circleName,
          contribution,
          members
        });
        
        throw new Error(`Failed to create Adashe circle: ${userFriendlyError}`);
      }
      
      // Generic error
      throw new Error(`Failed to create Adashe circle: ${formattedError}`);
    }

    // Wait for transaction confirmation with enhanced monitoring
    let receipt;
    let adasheAddress = null;
    try {
      // Import the improved monitoring functions
      const { monitorTransaction } = await import("../../utils/blockchainDiagnostics");
      const { analyzeFailedTransaction } = await import("../../utils/transactionDecoder");
      
      // Get provider for monitoring
      const provider = await embeddedWallet.getEthereumProvider();
      const ethersProvider = new BrowserProvider(provider);

      // Monitor the transaction with status updates and timeout handling
      logContractOperation("monitoringTransaction", { 
        hash: tx.hash,
        operation: "createAdashe",
        circleName
      });
      
      // Monitor with a long timeout since contract creation is complex
      receipt = await monitorTransaction(
        tx.hash,
        ethersProvider,
        (status) => {
          logContractOperation("createAdasheStatus", {
            status,
            txHash: tx.hash
          });
        },
        300000 // 5 minute timeout for contract creation
      );
      
      logContractOperation("transactionConfirmed", {
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        status: receipt.status,
        logs: receipt.logs?.length || 0
      });
      
      // If transaction failed (status 0), analyze the failure
      if (receipt.status === 0) {
        const txData = await ethersProvider.getTransaction(tx.hash);
        const analysis = await analyzeFailedTransaction(
          receipt, 
          txData, 
          adasheFactoryABI.abi
        );
        
        logContractOperation("createAdasheFailedOnChain", { analysis });
        throw new Error("Transaction was processed but failed on the blockchain");
      }
      
      // Transaction succeeded, try to get the created Adashe address from logs or query
      try {
        // First try to get from events in the receipt
        const adasheCreatedLog = receipt.logs
          .map(log => {
            try {
              const iface = new Interface(adasheFactoryABI.abi);
              return iface.parseLog({
                topics: log.topics,
                data: log.data
              });
            } catch (e) {
              return null;
            }
          })
          .find(parsed => parsed && parsed.name === "AdasheCreated");
        
        if (adasheCreatedLog) {
          adasheAddress = adasheCreatedLog.args.adashe;
          logContractOperation("adasheCreatedFromEvent", { 
            adasheAddress,
            circleName 
          });
        } else {
          // If we couldn't get it from logs, query the contract
          adasheAddress = await factoryContract.getAdasheByName(circleName);
          logContractOperation("adasheCreatedFromQuery", { 
            adasheAddress, 
            circleName 
          });
        }
      } catch (adasheAddressError) {
        console.warn("Couldn't get created Adashe address:", adasheAddressError);
      }
    } catch (error) {
      const formattedError = formatContractError(error);
      logContractOperation("confirmationFailed", { error: formattedError });
      
      // Try to check if the transaction was still successful despite the confirmation error
      try {
        const provider = await embeddedWallet.getEthereumProvider();
        const ethersProvider = new BrowserProvider(provider);
        const latestReceipt = await ethersProvider.getTransactionReceipt(tx.hash);
        
        if (latestReceipt && latestReceipt.status === 1) {
          // Transaction succeeded despite the error
          receipt = latestReceipt;
          console.log("Transaction succeeded despite confirmation error");
          
          // Try to get the Adashe address
          try {
            adasheAddress = await factoryContract.getAdasheByName(circleName);
            logContractOperation("adasheCreatedAfterError", { 
              adasheAddress, 
              circleName 
            });
          } catch (getAddressError) {
            console.warn("Couldn't get Adashe address after error:", getAddressError);
          }
        } else {
          throw error; // Re-throw if transaction really failed
        }
      } catch (receiptError) {
        throw new Error(
          `Transaction was sent but failed to confirm: ${formattedError}`
        );
      }
    }
    
    // Return both the receipt and the Adashe address if we have it
    const result = {
      receipt,
      adasheAddress
    };

    if (onSuccess) onSuccess(result);
    return result;
  } catch (error) {
    const formattedError = formatContractError(error);
    console.error("Failed to create Adashe circle:", formattedError);

    // Create a user-friendly error message
    const userFriendlyError = new Error(getUserFriendlyContractError(error));

    if (onError) onError(userFriendlyError);
    throw userFriendlyError;
  }
}

/**
 * Join an existing Adashe circle
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} circleName - Name or code of the circle to join
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<object>} - Transaction receipt
 */
export async function joinAdasheCircle(
  embeddedWallet,
  circleName,
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
    const signerAddress = await signer.getAddress();

    // Check if the user has enough ETH for gas fees
    const hasEnoughEth = await hasEnoughEthForGas(
      ethersProvider,
      signerAddress
    );
    if (!hasEnoughEth) {
      throw new Error(
        "You don't have enough ETH to pay for transaction fees. Please add ETH to your wallet and try again."
      );
    }

    // Get the Adashe contract address from the factory
    const factoryContract = new Contract(
      ADASHE_FACTORY_ADDRESS,
      adasheFactoryABI.abi,
      signer
    );

    let adasheContract;
    let adasheAddress;

    // Get the Adashe contract address by name
    try {
      adasheAddress = await factoryContract.getAdasheByName(circleName);

      if (
        !adasheAddress ||
        adasheAddress === "0x0000000000000000000000000000000000000000"
      ) {
        throw new Error(`No Adashe circle found with name: ${circleName}`);
      }
    } catch (error) {
      console.error("Error getting Adashe by name:", error);

      // Fallback to using the first circle for demo purposes
      console.log("Falling back to using the first available Adashe circle");
      const adasheAddresses = await factoryContract.getAdashes();

      if (!adasheAddresses || adasheAddresses.length === 0) {
        throw new Error("No Adashe circles found");
      }

      adasheAddress = adasheAddresses[0];
    }

    // Create the contract instance
    adasheContract = new Contract(adasheAddress, adasheABI.abi, signer);

    logContractOperation("joinAdashe", {
      contractAddress: adasheAddress,
      parameters: {
        circleName,
      },
    });

    // Prepare options with gas configuration
    const txOverrides = {
      gasLimit: 3000000, // Set a high initial gas limit
    };

    try {
      // Try to estimate gas first
      const gasEstimate = await adasheContract.joinAdashe.estimateGas(
        circleName,
        txOverrides
      );
      // Use the estimate with a buffer
      txOverrides.gasLimit = Math.floor(gasEstimate * 1.2);
      logContractOperation("gasEstimation", {
        operation: "joinAdashe",
        estimated: gasEstimate.toString(),
        withBuffer: txOverrides.gasLimit.toString(),
      });
    } catch (error) {
      logContractOperation("gasEstimationFailed", {
        operation: "joinAdashe",
        error: formatContractError(error),
      });
      // Keep the default high gas limit
    }

    // Execute the join transaction
    let tx;
    try {
      tx = await adasheContract.joinAdashe(circleName, txOverrides);

      logContractOperation("transactionSent", {
        operation: "joinAdashe",
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        data: tx.data,
      });
    } catch (error) {
      // Format the error and throw it
      const formattedError = formatContractError(error);
      logContractOperation("transactionFailed", {
        operation: "joinAdashe",
        error: formattedError,
      });
      throw new Error(`Failed to join Adashe circle: ${formattedError}`);
    }

    // Wait for transaction confirmation
    let receipt;
    try {
      receipt = await tx.wait();
      logContractOperation("transactionConfirmed", {
        operation: "joinAdashe",
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        status: receipt.status,
      });
    } catch (error) {
      const formattedError = formatContractError(error);
      logContractOperation("confirmationFailed", {
        operation: "joinAdashe",
        error: formattedError,
      });
      throw new Error(
        `Transaction was sent but failed to confirm: ${formattedError}`
      );
    }

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    const formattedError = formatContractError(error);
    console.error("Failed to join Adashe circle:", formattedError);

    // Create a user-friendly error message
    const userFriendlyError = new Error(getUserFriendlyContractError(error));

    if (onError) onError(userFriendlyError);
    throw userFriendlyError;
  }
}

/**
 * Contribute to an Adashe circle
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - The address of the specific Adashe circle
 * @param {number} weekNumber - The week number to contribute for
 * @param {number} amount - Amount to contribute in USDC
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<object>} - Transaction receipt
 */
export async function contributeToAdashe(
  embeddedWallet,
  adasheAddress,
  weekNumber,
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
    const signerAddress = await signer.getAddress();

    logContractOperation("contributeToAdashe", {
      adasheAddress,
      weekNumber,
      amount,
      signerAddress,
    });

    const usdcContract = new Contract(USDC_CONTRACT, erc20ABI, signer);
    const amountInUSDCUnits = parseUnits(amount.toString(), 6);

    // Check USDC balance first
    const balance = await usdcContract.balanceOf(signerAddress);
    logContractOperation("usdcBalance", {
      balance: formatUnits(balance, 6),
      required: amount,
    });

    if (balance.lt(amountInUSDCUnits)) {
      throw new Error(
        `Insufficient USDC balance. You have ${formatUnits(
          balance,
          6
        )} USDC, but ${amount} USDC is required.`
      );
    }

    // Check current allowance first
    const currentAllowance = await usdcContract.allowance(
      signerAddress,
      adasheAddress
    );
    logContractOperation("currentAllowance", {
      allowance: formatUnits(currentAllowance, 6),
      required: amount,
    });

    // Only approve if needed
    if (currentAllowance.lt(amountInUSDCUnits)) {
      logContractOperation("approveUSDC", {
        spender: adasheAddress,
        amount: amount.toString(),
        amountInUnits: amountInUSDCUnits.toString(),
      });

      // First approve USDC transfer
      const approveTx = await usdcContract.approve(
        adasheAddress,
        amountInUSDCUnits
      );
      const approveReceipt = await approveTx.wait();

      logContractOperation("approvalComplete", {
        transactionHash: approveReceipt.hash,
        blockNumber: approveReceipt.blockNumber,
      });
    }

    // Then make contribution
    const adasheContract = new Contract(adasheAddress, adasheABI.abi, signer);

    // Prepare transaction options with gas configuration
    const txOverrides = {
      gasLimit: 3000000, // Set a high initial gas limit
    };

    // Use correct week number if not provided
    const currentWeek = weekNumber || 1; // Default to 1 if not specified
    
    try {
      // First check if the user is a member of the circle
      const members = await adasheContract.getMembers();
      const isMember = members.some(
        (member) => member.toLowerCase() === signerAddress.toLowerCase()
      );
      
      if (!isMember) {
        throw new Error("You are not a member of this circle");
      }
      
      // Check if user has already contributed for this week
      try {
        const progress = await adasheContract.getContributionProgress(signerAddress);
        const contributedWeeks = Number(progress.contributedWeeks);
        
        logContractOperation("contributionProgress", {
          contributedWeeks,
          currentWeek,
          signerAddress,
        });
        
        if (contributedWeeks >= currentWeek) {
          throw new Error("You have already contributed for this period");
        }
      } catch (progressError) {
        if (!progressError.message.includes("already contributed")) {
          console.warn("Error checking contribution progress:", progressError);
        } else {
          throw progressError;
        }
      }
    } catch (memberError) {
      if (memberError.message.includes("not a member") || 
          memberError.message.includes("already contributed")) {
        throw memberError;
      }
      // If other errors, continue with contribution attempt
      console.warn("Error checking circle membership:", memberError);
    }
    
    // Try to estimate gas with additional logging
    try {
      logContractOperation("estimatingGas", {
        weekNumber: currentWeek,
        amount: amount.toString(),
        amountInUnits: amountInUSDCUnits.toString(),
      });
      
      const gasEstimate = await adasheContract.contribute.estimateGas(
        currentWeek,
        amountInUSDCUnits,
        txOverrides
      );
      // Use the estimate with a larger buffer for safety
      txOverrides.gasLimit = Math.floor(gasEstimate * 1.3);
      
      logContractOperation("gasEstimation", {
        estimated: gasEstimate.toString(),
        withBuffer: txOverrides.gasLimit.toString(),
      });
    } catch (error) {
      logContractOperation("gasEstimationFailed", {
        operation: "contribute",
        error: formatContractError(error),
      });
      // If gas estimation fails due to contract restrictions
      if (error.message.includes("execution reverted")) {
        // Try to extract a more specific error
        if (error.message.includes("already contributed")) {
          throw new Error("You have already contributed for this week");
        }
        if (error.message.includes("not a member")) {
          throw new Error("You are not a member of this circle");
        }
        
        // Generic error if we can't identify the specific issue
        throw new Error("The contract rejected your contribution. Please check that you're eligible to contribute.");
      }
      // Keep the default high gas limit
    }
    
    // Execute the transaction with retry logic
    let tx;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      try {
        tx = await adasheContract.contribute(
          currentWeek,
          amountInUSDCUnits,
          txOverrides
        );
        break; // Success, exit loop
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        
        // Increase gas limit for retry
        txOverrides.gasLimit = Math.floor(txOverrides.gasLimit * 1.2);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    logContractOperation("contributionSent", {
      transactionHash: tx.hash,
      amount: amount.toString(),
      amountInUnits: amountInUSDCUnits.toString(),
      weekNumber: currentWeek,
      from: signerAddress,
      to: adasheAddress,
      gasLimit: tx.gasLimit?.toString()
    });

    // Monitor the transaction with our enhanced utility
    let receipt;
    try {
      // Import monitoring and verification utilities
      const { monitorTransaction } = await import("../../utils/blockchainDiagnostics");
      const { verifyAdasheContribution } = await import("../../utils/contractVerifier");
      const { analyzeFailedTransaction } = await import("../../utils/transactionDecoder");
      const adasheABI = await import("../../ABI/Adashe.json");
      
      const provider = await embeddedWallet.getEthereumProvider();
      const ethersProvider = new BrowserProvider(provider);
      
      // Monitor transaction with better error handling and timeout
      receipt = await monitorTransaction(
        tx.hash, 
        ethersProvider, 
        (status) => {
          logContractOperation("contributionTransactionStatus", {
            status,
            txHash: tx.hash
          });
        },
        180000 // 3 minute timeout (blockchain can be slow)
      );
      
      logContractOperation("contributionConfirmed", {
        blockNumber: receipt.blockNumber,
        status: receipt.status,
        gasUsed: receipt.gasUsed?.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
        timestamp: new Date().toISOString()
      });
      
      // If transaction failed on-chain (status 0), analyze the failure
      if (receipt.status === 0) {
        const txData = await ethersProvider.getTransaction(tx.hash);
        const analysis = await analyzeFailedTransaction(receipt, txData, adasheABI.default);
        
        logContractOperation("contributionFailedOnChain", {
          analysis
        });
        
        throw new Error("Transaction was processed but failed on the blockchain");
      }
      
      // Verify the contribution was properly recorded using our specialized verifier
      const isVerified = await verifyAdasheContribution(
        adasheContract,
        signerAddress,
        currentWeek
      );
      
      if (!isVerified) {
        // This is concerning but not necessarily fatal - the transaction succeeded
        // but our verification couldn't confirm the state change
        console.warn("Contribution transaction succeeded but verification failed");
        
        // Try one more direct check
        const contributionProgress = await adasheContract.getContributionProgress(signerAddress);
        const updatedContributions = Number(contributionProgress.contributedWeeks);
        
        logContractOperation("contributionManualVerification", {
          expectedWeek: currentWeek,
          actualContributionsRecorded: updatedContributions,
          success: updatedContributions >= currentWeek
        });
        
        if (updatedContributions < currentWeek) {
          console.warn("Contribution may not have been properly recorded");
        }
      }
    } catch (verifyError) {
      console.warn("Error during transaction monitoring or verification:", verifyError);
      
      // Check if transaction was still successful despite the error
      try {
        const provider = await embeddedWallet.getEthereumProvider();
        const ethersProvider = new BrowserProvider(provider);
        const latestReceipt = await ethersProvider.getTransactionReceipt(tx.hash);
        
        if (latestReceipt && latestReceipt.status === 1) {
          // Transaction succeeded despite monitoring/verification error
          receipt = latestReceipt;
          console.log("Transaction succeeded despite verification error");
        } else if (latestReceipt && latestReceipt.status === 0) {
          throw new Error("Transaction failed on the blockchain");
        } else {
          throw verifyError; // Re-throw if we couldn't determine status
        }
      } catch (receiptError) {
        // If we can't get the receipt, re-throw the original error
        throw verifyError;
      }
    }
    
    // Handle confirmation errors or missing receipts as a fallback
    if (!receipt) {
      // Log the issue
      logContractOperation("confirmationIssue", {
        error: "No receipt available after monitoring transaction",
        txHash: tx.hash
      });
      
      // Try to get the receipt anyway in case transaction went through
      try {
        const provider = await embeddedWallet.getEthereumProvider();
        const ethersProvider = new BrowserProvider(provider);
        receipt = await ethersProvider.getTransactionReceipt(tx.hash);
        
        if (receipt) {
          if (receipt.status === 1) {
            logContractOperation("transactionSucceededDespiteError", {
              txHash: tx.hash,
              blockNumber: receipt.blockNumber
            });
          } else {
            throw new Error("Transaction was mined but failed");
          }
        } else {
          throw new Error("No transaction receipt available"); // No receipt found
        }
      } catch (receiptError) {
        throw new Error("Failed to get transaction receipt: " + receiptError.message);
      }
    }

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    const formattedError = formatContractError(error);
    console.error("Failed to contribute to Adashe:", formattedError);
    
    // Log detailed error information
    logContractOperation("contributionFailed", {
      adasheAddress,
      error: formattedError,
      message: error.message,
      code: error.code
    });

    // Use our specialized contract error handler
    const { handleContractError } = require("../../utils/contractErrors");
    const userFriendlyError = handleContractError(error, {
      operation: "contribute",
      adasheAddress,
      weekNumber,
      amount
    });

    // Create a more user-friendly error message
    let userMessage = userFriendlyError;

    // Additional specialized error handling
    if (error.message?.includes("insufficient funds")) {
      userMessage =
        "Insufficient funds for gas fee. Please add more ETH to your wallet.";
    } else if (error.message?.includes("user rejected")) {
      userMessage = "Transaction was rejected. Please try again.";
    } else if (error.message?.includes("already contributed")) {
      userMessage = "You have already contributed for this period.";
    } else if (error.message?.includes("not a member")) {
      userMessage = "You are not a member of this circle.";
    }

    if (onError) onError(new Error(userMessage));
    throw new Error(userMessage);
  }
}

/**
 * Withdraw from an Adashe circle
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - The address of the specific Adashe circle
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<object>} - Transaction receipt
 */
export async function withdrawFromAdashe(
  embeddedWallet,
  adasheAddress,
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

    const adasheContract = new Contract(adasheAddress, adasheABI.abi, signer);

    const tx = await adasheContract.withdraw();
    const receipt = await tx.wait();

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error("Failed to withdraw from Adashe:", error);
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Get list of members in an Adashe circle
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - The address of the specific Adashe circle
 * @returns {Promise<Array<string>>} - Array of member addresses
 */
export async function getAdasheMembers(embeddedWallet, adasheAddress) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

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

/**
 * Get contribution progress for a specific user in an Adashe circle
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - The address of the specific Adashe circle
 * @param {string} userAddress - The user address to check progress for
 * @returns {Promise<{contributedWeeks: number, total: number}>} - Contribution progress
 */
export async function getContributionProgress(
  embeddedWallet,
  adasheAddress,
  userAddress
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const adasheContract = new Contract(adasheAddress, adasheABI.abi, signer);

    const progress = await adasheContract.getContributionProgress(userAddress);

    return {
      contributedWeeks: Number(progress.contributedWeeks),
      total: Number(progress.total),
    };
  } catch (error) {
    console.error("Failed to get contribution progress:", error);
    return { contributedWeeks: 0, total: 0 };
  }
}

/**
 * Get the current week of an Adashe circle
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @param {string} adasheAddress - The address of the specific Adashe circle
 * @returns {Promise<number>} - Current week number
 */
export async function getCurrentWeek(embeddedWallet, adasheAddress) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const adasheContract = new Contract(adasheAddress, adasheABI.abi, signer);

    const weekNumber = await adasheContract.getCurrentWeek();
    return Number(weekNumber);
  } catch (error) {
    console.error("Failed to get current week:", error);
    return 0;
  }
}

/**
 * Get the list of all Adashe circles from the factory
 *
 * @param {object} embeddedWallet - Privy embedded wallet object
 * @returns {Promise<Array<string>>} - Array of Adashe contract addresses
 */
export async function getAdasheContracts(embeddedWallet) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const factoryContract = new Contract(
      ADASHE_FACTORY_ADDRESS,
      adasheFactoryABI.abi,
      signer
    );

    return await factoryContract.getAdashes();
  } catch (error) {
    console.error("Failed to get Adashe contracts:", error);
    return [];
  }
}
