// Blockchain Explorer and Debugging Tool
import { BrowserProvider } from "ethers";
import { logContractOperation } from "./contractDebug";

/**
 * Fetches transaction data from the blockchain
 *
 * @param {string} txHash - Transaction hash
 * @param {object} provider - Ethers provider
 * @returns {Promise<object|null>} - Transaction data or null if not found
 */
export async function getTransactionDetails(txHash, provider) {
  try {
    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);

    // Get transaction
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      return null;
    }

    // Log transaction data
    logContractOperation("transactionInspection", {
      hash: txHash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      data: tx.data,
      gasLimit: tx.gasLimit?.toString(),
      status: receipt ? (receipt.status ? "Success" : "Failed") : "Pending",
      gasUsed: receipt?.gasUsed?.toString() || "N/A",
      blockNumber: receipt?.blockNumber || "Pending",
    });

    return {
      tx,
      receipt,
      status: receipt ? (receipt.status ? "Success" : "Failed") : "Pending",
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return null;
  }
}

/**
 * Monitors a transaction until it's mined
 *
 * @param {string} txHash - Transaction hash to monitor
 * @param {object} provider - Ethers provider
 * @param {Function} onMined - Callback when mined
 * @returns {Promise<object>} - Final receipt
 */
export async function monitorTransaction(
  txHash,
  provider,
  onStatusUpdate = null,
  timeoutMs = 120000
) {
  let timeoutId;

  const monitorPromise = new Promise((resolve, reject) => {
    const startTime = Date.now();
    let confirmationBlock = null;
    let checkCount = 0;

    // Initial status update
    if (onStatusUpdate) onStatusUpdate("pending");

    const checkReceipt = async () => {
      try {
        checkCount++;
        const timePassed = Date.now() - startTime;

        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);

        // Log monitoring data periodically
        if (checkCount % 5 === 0) {
          logContractOperation("transactionMonitoring", {
            txHash,
            checkCount,
            timePassed: `${(timePassed / 1000).toFixed(1)}s`,
            receipt: receipt ? "found" : "pending",
          });
        }

        if (receipt) {
          // Once we have a receipt, check for confirmations
          if (!confirmationBlock) {
            confirmationBlock = receipt.blockNumber;

            // Log confirmation data
            logContractOperation("transactionConfirmation", {
              txHash,
              blockNumber: receipt.blockNumber,
              status: receipt.status,
              gasUsed: receipt.gasUsed?.toString(),
              timePassed: `${(timePassed / 1000).toFixed(1)}s`,
            });

            // For confirmed transactions (status 1), resolve immediately
            if (receipt.status === 1) {
              if (onStatusUpdate) onStatusUpdate("confirmed");
              clearTimeout(timeoutId);
              resolve(receipt);
              return;
            } else if (receipt.status === 0) {
              // For failed transactions (status 0), resolve but indicate failure
              if (onStatusUpdate) onStatusUpdate("failed");
              clearTimeout(timeoutId);
              resolve(receipt); // Don't reject so caller can examine the failure
              return;
            }
          }

          // Get the latest block to check confirmations
          const latestBlock = await provider.getBlockNumber();
          const confirmations = latestBlock - confirmationBlock + 1;

          if (confirmations >= 1) {
            if (onStatusUpdate) onStatusUpdate("confirmed");
            clearTimeout(timeoutId);
            resolve(receipt);
            return;
          }
        }

        // Check again after a short delay (increase delay as time passes)
        const baseDelay = 2000;
        const dynamicDelay = Math.min(
          baseDelay + Math.floor(timePassed / 10000) * 1000, // Add 1s for every 10s elapsed
          10000 // Cap at 10s
        );

        setTimeout(checkReceipt, dynamicDelay);
      } catch (error) {
        console.error("Error monitoring transaction:", error);

        logContractOperation("transactionMonitoringError", {
          txHash,
          error: error.message,
        });

        // For network errors, keep trying
        if (
          error.code === "NETWORK_ERROR" ||
          error.message.includes("network")
        ) {
          setTimeout(checkReceipt, 5000);
        } else {
          clearTimeout(timeoutId);
          reject(error);
        }
      }
    };

    // Start checking
    checkReceipt();
  });

  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      if (onStatusUpdate) onStatusUpdate("timeout");
      reject(
        new Error(
          `Transaction monitoring timed out after ${timeoutMs / 1000} seconds`
        )
      );
    }, timeoutMs);
  });

  // Race between monitoring and timeout
  return Promise.race([monitorPromise, timeoutPromise]);
}

/**
 * Emergency function to help diagnose wallet connection issues
 *
 * @param {object} wallet - Wallet object to diagnose
 * @returns {Promise<object>} - Diagnostic information
 */
export async function diagnoseWalletConnection(wallet) {
  const diagnostics = {
    wallet: {
      type: wallet?.walletClientType || "Unknown",
      address: null,
      chainId: null,
      connected: false,
      providerAvailable: false,
      signerAvailable: false,
      errors: [],
    },
  };

  try {
    // Check wallet object
    if (!wallet) {
      diagnostics.wallet.errors.push("Wallet object is null or undefined");
      return diagnostics;
    }

    // Check wallet address
    try {
      diagnostics.wallet.address = wallet.address;
    } catch (error) {
      diagnostics.wallet.errors.push(
        `Failed to get wallet address: ${error.message}`
      );
    }

    // Check provider
    try {
      const provider = await wallet.getEthereumProvider();
      diagnostics.wallet.providerAvailable = !!provider;

      if (provider) {
        // Create ethers provider from wallet provider
        try {
          const ethersProvider = new BrowserProvider(provider);
          diagnostics.wallet.providerType = "BrowserProvider";

          // Get network information
          try {
            const network = await ethersProvider.getNetwork();
            diagnostics.wallet.chainId = network.chainId;
            diagnostics.wallet.networkName = network.name;
          } catch (err) {
            diagnostics.wallet.errors.push(
              `Failed to get network: ${err.message}`
            );
          }

          // Check if we can get a signer
          try {
            const signer = await ethersProvider.getSigner();
            diagnostics.wallet.signerAvailable = !!signer;
            diagnostics.wallet.connected = true;
          } catch (err) {
            diagnostics.wallet.errors.push(
              `Failed to get signer: ${err.message}`
            );
          }
        } catch (err) {
          diagnostics.wallet.errors.push(
            `Failed to create ethers provider: ${err.message}`
          );
        }
      }
    } catch (error) {
      diagnostics.wallet.errors.push(
        `Failed to get Ethereum provider: ${error.message}`
      );
    }
  } catch (error) {
    diagnostics.wallet.errors.push(
      `Unexpected error during wallet diagnosis: ${error.message}`
    );
  }

  logContractOperation("walletDiagnosis", diagnostics);
  return diagnostics;
}

/**
 * Decodes transaction input data using a contract ABI
 *
 * @param {string} inputData - The transaction input data (hex string)
 * @param {Array} abi - The ABI array to use for decoding
 * @returns {object|null} - Decoded function call or null if not decodable
 */
export async function decodeTransactionInput(inputData, abi) {
  try {
    if (!inputData || !abi) return null;

    // Create interface from ABI
    const iface = new Interface(abi);

    // Get the function selector (first 4 bytes of input data)
    const selector = inputData.slice(0, 10);

    // Try to decode the function call
    try {
      const decoded = iface.parseTransaction({ data: inputData });

      if (decoded) {
        // Extract the named parameters and values
        const params = {};
        for (let i = 0; i < decoded.fragment.inputs.length; i++) {
          const input = decoded.fragment.inputs[i];
          params[input.name] = decoded.args[i].toString();
        }

        return {
          functionName: decoded.name,
          selector,
          params,
          raw: decoded,
        };
      }
    } catch (decodeError) {
      console.log("Failed to decode transaction:", decodeError);
    }

    return null;
  } catch (error) {
    console.error("Error decoding transaction:", error);
    return null;
  }
}

/**
 * Check an ERC20 token balance for a specific address
 *
 * @param {string} address - The address to check balance for
 * @param {string} tokenAddress - The ERC20 token contract address
 * @param {object} provider - Ethers provider
 * @returns {Promise<bigint>} - Token balance as BigInt
 */
export async function checkTokenBalance(address, tokenAddress, provider) {
  try {
    // Standard ERC20 balanceOf ABI
    const erc20ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
    ];

    // Create contract instance
    const { Contract } = await import("ethers");
    const tokenContract = new Contract(tokenAddress, erc20ABI, provider);

    // Get token information
    let symbol = "Unknown";
    let decimals = 18;

    try {
      symbol = await tokenContract.symbol();
      decimals = await tokenContract.decimals();
    } catch (infoError) {
      console.warn("Could not get token info:", infoError);
    }

    // Get balance
    const balance = await tokenContract.balanceOf(address);

    // Log details
    logContractOperation("tokenBalanceCheck", {
      address,
      tokenAddress,
      symbol,
      decimals: decimals.toString(),
      balance: balance.toString(),
      formattedBalance: (Number(balance) / 10 ** Number(decimals)).toString(),
    });

    return balance;
  } catch (error) {
    console.error("Error checking token balance:", error);

    // Log error details
    logContractOperation("tokenBalanceCheckFailed", {
      address,
      tokenAddress,
      error: error.message,
    });

    throw error;
  }
}
