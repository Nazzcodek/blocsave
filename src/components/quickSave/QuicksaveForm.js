import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  saveToQuicksave,
  withdrawFromQuicksave,
} from "../../redux/slices/quicksaveSlice";
import { openModal } from "../../redux/slices/modalSlice";
import { quickSave } from "@/services/blockchain/useCreateQuickSave";
import { useWallets } from "@privy-io/react-auth";

import useQuicksaveForm from "../../redux/hooks/quicksaveForm";

const QuicksaveForm = ({ balance }) => {
  // Use custom hook with appropriate max amount based on active tab
  const dispatch = useDispatch();
  const { activeTab, walletBalance, isSubmitting } = useSelector(
    (state) => state.quicksave
  );
  const maxAmount = activeTab === "save" ? walletBalance : balance;
  const { amount, error, isValid, handleAmountChange, handleMaxAmount, setError, setTxHash } =
    useQuicksaveForm({
      maxAmount,
    });

  const { wallets } = useWallets();
  const embeddedWallet = wallets?.find(wallet => wallet.walletClientType === 'privy');

  const handleQuickSave = async () => {
    console.log(embeddedWallet);
    if (!embeddedWallet) {
      setError('Embedded wallet not found. Please login with Privy first.');
      return;
    }

    // try{
      await quickSave(
          embeddedWallet, 
          amount,
          (receipt) => {
            // setTxHash(receipt.transactionHash);
            console.log(receipt.transactionHash);
            console.log('Transaction successful:', receipt);
          },
          (err) => {
            console.log(`Transaction failed: ${err.message}`);
            console.error('Transaction error:', err);
          }
        );

    // } catch{
    //   setError(`Error: ${err.message}`);
    // }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    handleQuickSave();

    if (!isValid) return;

    if (activeTab === "save") {
      dispatch(
        saveToQuicksave(amount),
        openModal({
          modalType: "QUICKSAVE",
          modalProps: {},
        })
      );
    } else {
      dispatch(
        withdrawFromQuicksave(amount),
        openModal({
          modalType: "QUICKSAVE_WITHDRAWAL",
          modalProps: { amount: amount, currency: "USDC" },
        })
      );
    }
  };

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
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={handleMaxAmount}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#079669] font-medium text-sm"
            disabled={isSubmitting || !maxAmount}
          >
            MAX
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="mb-6">
        <p className="text-sm rounded-2 text-gray-600">
          {activeTab === "save" ? "Wallet" : "Quicksave"} Balance: $
          {(activeTab === "save" ? walletBalance : balance)?.toFixed(2) ||
            "0.00"}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isValid}
        className={`w-full py-3 rounded-xl font-medium ${
          isSubmitting || !isValid
            ? "bg-[#079669] text-white cursor-not-allowed"
            : "bg-[#079669] text-white hover:bg-[#079669]"
        }`}
      >
        {isSubmitting ? (
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
