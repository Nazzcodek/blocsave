import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  saveToQuicksave,
  withdrawFromQuicksave,
} from "../../redux/slices/quicksaveSlice";
import { openModal } from "../../redux/slices/modalSlice";
import {
  quickSave,
  withdrawQuickSave,
} from "@/services/blockchain/useCreateQuickSave";
import { getWalletUSDCBalance } from "@/services/blockchain/useWalletUSDCBalance";
import { getQuickSaveBalance } from "@/services/blockchain/useQuickSaveBalance";
import { useWallets } from "@privy-io/react-auth";
import WithdrawalConfirmation from "./WithdrawalConfirmation";

import useQuicksaveForm from "../../redux/hooks/quicksaveForm";

const QuicksaveForm = ({ balance }) => {
  const dispatch = useDispatch();
  const { activeTab, isSubmitting } = useSelector((state) => state.quicksave);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [quicksaveBalance, setQuicksaveBalance] = useState(balance || 0);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [showWithdrawalConfirmation, setShowWithdrawalConfirmation] =
    useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState("");
  const [txError, setTxError] = useState(null);

  const { wallets } = useWallets();
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  // Fetch wallet and quicksave balances
  useEffect(() => {
    async function fetchBalances() {
      if (!embeddedWallet) {
        setIsLoadingBalances(false);
        return;
      }

      setIsLoadingBalances(true);
      try {
        const walletUsdcBalance = await getWalletUSDCBalance(embeddedWallet);
        setWalletBalance(walletUsdcBalance);

        const quicksaveUsdcBalance = await getQuickSaveBalance(embeddedWallet);
        setQuicksaveBalance(quicksaveUsdcBalance);
      } catch (error) {
        console.error("Error fetching balances:", error);
      } finally {
        setIsLoadingBalances(false);
      }
    }

    fetchBalances();

    // Refresh balances every 30 seconds
    const intervalId = setInterval(fetchBalances, 30000);
    return () => clearInterval(intervalId);
  }, [embeddedWallet, balance]);

  // Determine the maximum amount for the current tab
  const maxAmount = activeTab === "save" ? walletBalance : quicksaveBalance;

  const {
    amount,
    error,
    isValid,
    handleAmountChange,
    handleMaxAmount,
    setError,
  } = useQuicksaveForm({
    maxAmount,
  });

  const handleQuickSave = async () => {
    if (!embeddedWallet) {
      setError("Embedded wallet not found. Please login with Privy first.");
      return false;
    }

    // Validate amount is not greater than wallet balance
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return false;
    }

    if (amountNum > walletBalance) {
      setError(
        `Insufficient balance. Maximum available: $${walletBalance.toFixed(2)}`
      );
      return false;
    }

    setIsProcessing(true);

    try {
      await quickSave(
        embeddedWallet,
        amount,
        (receipt) => {
          setTransactionHash(receipt.transactionHash);
          console.log("Transaction successful:", receipt);

          // Update local balances after successful transaction
          setWalletBalance((prev) => prev - amountNum);
          setQuicksaveBalance((prev) => prev + amountNum);

          // Dispatch Redux action
          dispatch(saveToQuicksave(amount));

          // Show success modal
          dispatch(
            openModal({
              modalType: "QUICKSAVE",
              modalProps: {
                amount: amount,
                currency: "USDC",
                transactionHash: receipt.transactionHash,
              },
            })
          );

          return true;
        },
        (err) => {
          console.error("Transaction error:", err);
          setError(`Transaction failed: ${err.message}`);
          return false;
        }
      );

      return true;
    } catch (error) {
      setError(`Error: ${error.message}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmWithdrawal = async () => {
    // User has confirmed withdrawal in the confirmation UI
    setWithdrawalStatus("processing");
    setTxError(null);

    const amountNum = parseFloat(amount);
    try {
      await withdrawQuickSave(
        embeddedWallet,
        amount,
        (receipt) => {
          setTransactionHash(receipt.transactionHash);
          console.log("Withdrawal successful:", receipt);

          // Update local balances after successful transaction
          setWalletBalance((prev) => prev + amountNum);
          setQuicksaveBalance((prev) => prev - amountNum);

          // Set state to show success
          setWithdrawalStatus("success");

          // Dispatch Redux action
          dispatch(withdrawFromQuicksave(amount));

          // Show success modal
          dispatch(
            openModal({
              modalType: "QUICKSAVE_WITHDRAWAL",
              modalProps: {
                amount: amount,
                currency: "USDC",
                transactionHash: receipt.transactionHash,
              },
            })
          );

          // Reset state after showing success
          setTimeout(() => {
            setShowWithdrawalConfirmation(false);
            setWithdrawalStatus("");
          }, 2000);

          return true;
        },
        (err) => {
          console.error("Withdrawal error:", err);
          setWithdrawalStatus("error");
          setTxError(err.message || "Transaction failed");
          return false;
        }
      );
    } catch (error) {
      console.error("Withdrawal execution error:", error);
      setWithdrawalStatus("error");
      setTxError(error.message || "Failed to process withdrawal");
    }
  };

  const handleCancelWithdrawal = () => {
    setShowWithdrawalConfirmation(false);
    setWithdrawalStatus("");
    setTxError(null);
  };

  const handleQuickWithdraw = async () => {
    if (!embeddedWallet) {
      setError("Embedded wallet not found. Please login with Privy first.");
      return false;
    }

    // Validate amount is not greater than quicksave balance
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return false;
    }

    if (amountNum > quicksaveBalance) {
      setError(
        `Insufficient QuickSave balance. Maximum available: $${quicksaveBalance.toFixed(
          2
        )}`
      );
      return false;
    }

    // Show confirmation UI instead of immediately processing
    setShowWithdrawalConfirmation(true);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) return;

    let success;

    if (activeTab === "save") {
      success = await handleQuickSave();
    } else {
      success = await handleQuickWithdraw();
    }
  };

  // If showing the withdrawal confirmation UI
  if (showWithdrawalConfirmation) {
    return (
      <WithdrawalConfirmation
        amount={amount}
        currency="USDC"
        onConfirm={handleConfirmWithdrawal}
        onCancel={handleCancelWithdrawal}
        isProcessing={withdrawalStatus === "processing"}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How much do you want to{" "}
          {activeTab === "save" ? "Quicksave" : "withdraw"}?
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className={`border ${
              error
                ? "border-red-300 focus:ring-[#079669] focus:border-[#079669]"
                : "border-gray-300 focus:ring-[#079669] focus:border-[#079669]"
            } rounded-md p-3 w-full`}
            placeholder="0.00"
            step="0.01"
            min="0"
            disabled={isProcessing || isSubmitting}
          />
          <button
            type="button"
            onClick={handleMaxAmount}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#079669] font-medium text-sm"
            disabled={isProcessing || isSubmitting || !maxAmount}
          >
            MAX
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600">
          {isLoadingBalances ? (
            <span className="inline-block animate-pulse bg-gray-200 h-4 w-36 rounded"></span>
          ) : (
            <>
              {activeTab === "save" ? "Wallet" : "Quicksave"} Balance: $
              {(activeTab === "save"
                ? walletBalance
                : quicksaveBalance
              )?.toFixed(2) || "0.00"}
            </>
          )}
        </p>
      </div>

      <button
        type="submit"
        disabled={isProcessing || isSubmitting || !isValid}
        className={`w-full py-3 rounded-xl font-medium ${
          isProcessing || isSubmitting || !isValid
            ? "bg-[#079669] text-white cursor-not-allowed opacity-70"
            : "bg-[#079669] text-white hover:bg-[#079669]"
        }`}
      >
        {isProcessing || isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : activeTab === "save" ? (
          "Quick Save"
        ) : (
          "Withdraw to Wallet"
        )}
      </button>
    </form>
  );
};

export default QuicksaveForm;
