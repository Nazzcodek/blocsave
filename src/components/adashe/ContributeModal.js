import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { contributeToCircle } from "../../redux/slices/adasheSlice";
import { closeModal, openModal } from "../../redux/slices/modalSlice";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { BrowserProvider } from "ethers";

const ContributeModal = ({ circle, onClose = () => {} }) => {
  const [mounted, setMounted] = useState(false);
  const [isContributing, setIsContributing] = useState(false);
  const [amount, setAmount] = useState(circle?.weeklyAmount || 0);
  const [transactionHash, setTransactionHash] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null); // 'pending', 'confirmed', 'failed'
  const [balanceChecked, setBalanceChecked] = useState(false);
  const [hasEnoughBalance, setHasEnoughBalance] = useState(true);

  const dispatch = useDispatch();
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    setMounted(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Add a new effect to check balance when the component mounts
  useEffect(() => {
    const checkBalance = async () => {
      if (!authenticated || !wallets || !amount) return;

      try {
        const embeddedWallet = wallets?.find(
          (wallet) => wallet.walletClientType === "privy"
        );

        if (!embeddedWallet) return;

        // Import utility functions
        const { checkTokenBalance } = await import(
          "../../utils/blockchainDiagnostics"
        );

        const provider = await embeddedWallet.getEthereumProvider();
        const ethersProvider = new BrowserProvider(provider);
        const address = await embeddedWallet.address;

        // USDC contract address - should be environment specific
        const usdcAddress =
          process.env.REACT_APP_USDC_ADDRESS ||
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Default to Polygon USDC

        const balance = await checkTokenBalance(
          address,
          usdcAddress,
          ethersProvider
        );
        const amountWei =
          BigInt(Math.floor(amount * 1000000)) * BigInt(10 ** 6); // Convert to wei (USDC has 6 decimals)

        setBalanceChecked(true);
        setHasEnoughBalance(balance >= amountWei);
      } catch (error) {
        console.error("Failed to check balance:", error);
        setBalanceChecked(true);
        // Default to true to avoid blocking contribution attempts
        setHasEnoughBalance(true);
      }
    };

    if (authenticated && wallets) {
      checkBalance();
    }
  }, [authenticated, wallets, amount]);

  // Function to check transaction status
  const checkTransactionStatus = useCallback(async (txHash, wallet) => {
    if (!txHash || !wallet) return;

    try {
      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new BrowserProvider(provider);

      // Set initial status
      setTransactionStatus("pending");

      // Poll for transaction receipt
      const receipt = await ethersProvider.waitForTransaction(txHash, 1); // Wait for 1 confirmation

      if (receipt.status === 1) {
        setTransactionStatus("confirmed");
        return receipt;
      } else {
        setTransactionStatus("failed");
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Transaction status check failed:", error);
      setTransactionStatus("failed");
      throw error;
    }
  }, []);

  const handleContribute = async (e) => {
    e.preventDefault();

    // Pre-validation checks
    if (!authenticated) {
      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: "Authentication Required",
            message: "Please connect your wallet to contribute",
            solutions: ["Sign in with your wallet to continue"],
          },
        })
      );
      return;
    }

    // Validate contribution amount
    if (!amount || amount <= 0) {
      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: "Invalid Amount",
            message: "Please enter a valid contribution amount greater than 0",
          },
        })
      );
      return;
    }

    // Check if balance has been checked and is insufficient
    if (balanceChecked && !hasEnoughBalance) {
      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: "Insufficient Balance",
            message: "You don't have enough USDC for this contribution",
            solutions: [
              "Add more USDC to your wallet",
              "Try a smaller contribution amount",
            ],
          },
        })
      );
      return;
    }

    setIsContributing(true);
    setTransactionStatus(null);
    setTransactionHash(null);

    try {
      // Import debug utilities
      const { debugStart, debugEnd, debugError } = await import(
        "../../utils/debug"
      );
      const { diagnoseWalletConnection, monitorTransaction } = await import(
        "../../utils/blockchainDiagnostics"
      );
      const { analyzeFailedTransaction } = await import(
        "../../utils/transactionDecoder"
      );

      // Start debugging
      debugStart("contributeToCircle", {
        circleId: circle.id,
        amount,
        circleName: circle.name,
        weekNumber: circle?.currentRound || 1,
      });

      const embeddedWallet = wallets?.find(
        (wallet) => wallet.walletClientType === "privy"
      );

      if (!embeddedWallet) {
        throw new Error("Embedded wallet not found");
      }

      // Show in-progress modal
      dispatch(
        openModal({
          modalType: "INFO_MODAL",
          modalProps: {
            title: "Preparing Transaction",
            message:
              "Verifying wallet connection and preparing your contribution...",
            showSpinner: true,
          },
        })
      );

      // Check wallet health before proceeding
      const diagnostics = await diagnoseWalletConnection(embeddedWallet);

      if (diagnostics.wallet.errors.length > 0) {
        console.warn(
          "Wallet diagnosis found issues:",
          diagnostics.wallet.errors
        );
        // Don't block execution but log issues
      }

      if (!diagnostics.wallet.providerAvailable) {
        throw new Error("Wallet provider not available");
      }

      // Set to percentage-based fee amount
      const result = await dispatch(
        contributeToCircle({
          embeddedWallet: embeddedWallet,
          circleId: circle.id,
          amount,
        })
      ).unwrap();

      // If we have a transaction hash, save it for reference
      if (result?.receipt?.hash) {
        setTransactionHash(result.receipt.hash);

        // Update the modal to show transaction is processing
        dispatch(
          openModal({
            modalType: "INFO_MODAL",
            modalProps: {
              title: "Transaction Processing",
              message: `Your contribution of ${amount} USDC is being processed on the blockchain.`,
              subMessage: `Transaction Hash: ${result.receipt.hash.slice(
                0,
                10
              )}...${result.receipt.hash.slice(-8)}`,
              showSpinner: true,
            },
          })
        );

        try {
          // Get provider from wallet
          const provider = await embeddedWallet.getEthereumProvider();
          const ethersProvider = new BrowserProvider(provider);

          // Monitor the transaction with enhanced feedback
          const receipt = await monitorTransaction(
            result.receipt.hash,
            ethersProvider,
            (status) => {
              // Update status as monitoring progresses
              if (status === "pending") {
                setTransactionStatus("pending");
              } else if (status === "confirmed") {
                setTransactionStatus("confirmed");
                dispatch(closeModal());
              }
            }
          );

          if (receipt.status === 0) {
            // Transaction failed on-chain
            setTransactionStatus("failed");

            // Analyze why it failed
            const txData = await ethersProvider.getTransaction(
              result.receipt.hash
            );
            const adasheABI = await import("../../ABI/Adashe.json");

            const analysis = await analyzeFailedTransaction(
              receipt,
              txData,
              adasheABI.default
            );
            console.warn("Transaction failed analysis:", analysis);

            throw new Error(
              "Transaction was processed but failed on the blockchain"
            );
          }

          // Transaction successful!
          setTransactionStatus("confirmed");
        } catch (monitorError) {
          console.error("Error monitoring transaction:", monitorError);
          setTransactionStatus("failed");
          throw monitorError;
        }
      }

      // End debugging
      debugEnd("contributeToCircle", { success: true });

      // Show success message
      dispatch(
        openModal({
          modalType: "QUICKSAVE",
          modalProps: {
            amount: amount,
            currency: "USDC",
            transactionHash: transactionHash,
          },
        })
      );

      onClose();
    } catch (error) {
      // Log detailed error info
      console.error("Failed to contribute:", error);

      // Close any pending modals
      dispatch(closeModal());

      // Import debug utilities if not already imported
      const { debugError } = await import("../../utils/debug");
      debugError("contributeToCircle", error);

      // Create user-friendly error messages based on error type
      let errorMessage = error.message || "Unknown error";
      let possibleSolutions = [];

      if (errorMessage.includes("execution reverted")) {
        errorMessage = "The transaction was rejected by the blockchain.";
        possibleSolutions = [
          "Check that you have enough USDC in your wallet",
          "Verify that you are a member of this circle",
          "Make sure you haven't already contributed for this period",
        ];
      } else if (errorMessage.includes("insufficient funds")) {
        errorMessage = "You don't have enough ETH for transaction fees.";
        possibleSolutions = ["Add more ETH to your wallet for gas fees"];
      } else if (errorMessage.includes("user denied")) {
        errorMessage = "You rejected the transaction in your wallet.";
      }

      // Use modal instead of alert
      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: "Failed to Contribute",
            message: errorMessage,
            solutions: possibleSolutions,
          },
        })
      );

      setIsContributing(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Modal content
  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8">
          {/* Title */}
          <h2 className="text-[16px] font-semibold text-center mb-6">
            Contribute to {circle?.name || "Circle"}
          </h2>

          <form onSubmit={handleContribute}>
            {/* Input Label */}
            <label
              htmlFor="amount"
              className="block text-[14px] font-medium text-gray-700 mb-2"
            >
              Contribution Amount (USDC)
            </label>

            {/* Input Field */}
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => {
                const value = Number(e.target.value);
                // Ensure value is non-negative
                setAmount(value < 0 ? 0 : value);
              }}
              className={`w-full p-3 border rounded-md mb-1 ${
                amount <= 0 ? "border-red-300" : "border-gray-300"
              }`}
              required
              min="0.01"
              step="any"
              placeholder="Enter amount in USDC"
            />
            {amount <= 0 && (
              <p className="text-red-500 text-xs mb-6">
                Please enter a valid amount greater than 0
              </p>
            )}
            {amount > 0 && (
              <p className="text-gray-500 text-xs mb-6">
                Your contribution will be made in USDC
              </p>
            )}

            <p className="text-[12px] text-gray-600 mb-6">
              You are contributing to week {circle?.currentRound || 1} of your
              Adashe circle. This amount will be deducted from your wallet.
            </p>

            {/* Balance warning if applicable */}
            {balanceChecked && !hasEnoughBalance && (
              <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                <p className="flex items-center">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Insufficient USDC balance for this contribution
                </p>
              </div>
            )}

            {/* Transaction status feedback */}
            {transactionStatus && (
              <div
                className={`mb-4 p-2 border rounded text-sm ${
                  transactionStatus === "pending"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : transactionStatus === "confirmed"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <p className="flex items-center">
                  {transactionStatus === "pending" && (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Transaction in progress...
                    </>
                  )}
                  {transactionStatus === "confirmed" && (
                    <>
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Transaction confirmed!
                    </>
                  )}
                  {transactionStatus === "failed" && (
                    <>
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Transaction failed. Please try again.
                    </>
                  )}
                </p>
                {transactionHash && (
                  <p className="text-xs mt-1 font-mono">
                    TX: {transactionHash.slice(0, 10)}...
                    {transactionHash.slice(-8)}
                  </p>
                )}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={
                isContributing ||
                !authenticated ||
                (balanceChecked && !hasEnoughBalance)
              }
              className={`w-full bg-[#079669] text-white font-medium py-3 px-4 rounded-lg transition duration-200 ${
                isContributing ||
                !authenticated ||
                (balanceChecked && !hasEnoughBalance)
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-[#06805a]"
              }`}
            >
              {isContributing ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {transactionStatus === "pending"
                    ? "Processing on blockchain..."
                    : "Processing..."}
                </div>
              ) : (
                `Contribute ${amount > 0 ? `${amount} USDC` : ""}`
              )}
            </button>

            {/* Help text */}
            {!isContributing && (
              <div className="mt-2 text-xs text-gray-500">
                <p>
                  Make sure you have enough USDC in your wallet for this
                  contribution.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );

  // Use portal to mount modal at the end of the document body
  return mounted && typeof window !== "undefined"
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
};

export default ContributeModal;
