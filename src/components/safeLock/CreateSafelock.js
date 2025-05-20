import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWallets } from "@privy-io/react-auth";
import {
  createSafeLockAddress,
  depositToSafeLock,
  resetSafeLockCreation,
  setDuration,
} from "@/redux/slices/safelockSlice";
import getWalletUSDCBalance from "@/services/blockchain/useWalletUSDCBalance";
import LockDurationOptions from "./LockDurationOptions";
import ExpectedReturns from "./ExpectedReturns";
import { formatCurrency, calculateReturns } from "@/utils/formatters";
import { openModal } from "@/redux/slices/modalSlice";

const CreateSafelock = ({ setShowActivity }) => {
  const dispatch = useDispatch();
  const { wallets } = useWallets();
  const safelockState = useSelector((state) => state.safelock) || {};
  const {
    isSubmitting,
    creationStep,
    currentSafeLockAddress,
    durationDays,
    error,
  } = safelockState;

  const [amount, setAmount] = useState("");
  const [returns, setReturns] = useState({
    daily: 0,
    total: 0,
    maturityAmount: 0,
    maturityDate: "",
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  // Get embeddedWallet from Privy
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  // Fetch wallet USDC balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!embeddedWallet) {
        setIsLoadingBalance(false);
        setWalletBalance(0);
        return;
      }

      setIsLoadingBalance(true);
      try {
        const walletUsdcBalance = await getWalletUSDCBalance(embeddedWallet);
        setWalletBalance(walletUsdcBalance);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchWalletBalance();

    // Refresh balance every 30 seconds
    const intervalId = setInterval(fetchWalletBalance, 30000);
    return () => clearInterval(intervalId);
  }, [embeddedWallet]);

  // Calculate expected returns whenever amount or duration changes
  useEffect(() => {
    if (amount && !isNaN(amount) && amount > 0) {
      const calculatedReturns = calculateReturns(
        parseFloat(amount),
        durationDays
      );
      setReturns(calculatedReturns);
    } else {
      setReturns({ daily: 0, total: 0, maturityAmount: 0, maturityDate: "" });
    }
  }, [amount, durationDays]);

  // Reset creation state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetSafeLockCreation());
    };
  }, [dispatch]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleDurationChange = (days) => {
    dispatch(setDuration(days));
  };

  // Step 1: Create SafeLock address with selected duration
  const handleCreateSafeLockAddress = async () => {
    if (!embeddedWallet) {
      dispatch(
        openModal({
          modalType: "INFO_MODAL",
          modalProps: {
            title: "Wallet Not Connected",
            message: "Please connect your wallet to create a SafeLock.",
          },
        })
      );
      return;
    }

    console.log(
      "Step 1 - Creating SafeLock address with duration:",
      durationDays
    );
    console.log("Step 1 - Using embedded wallet");

    const result = await dispatch(
      createSafeLockAddress({
        embeddedWallet,
        durationDays,
      })
    );

    console.log(
      "Step 1 - Result after createSafeLockAddress dispatch:",
      result
    );
    console.log("Step 1 - Current safelockState after dispatch:", {
      creationStep: safelockState.creationStep,
      currentSafeLockAddress: safelockState.currentSafeLockAddress,
      durationDays: safelockState.durationDays,
      error: safelockState.error,
    });
  };

  // Step 2: Deposit funds into the created SafeLock
  const handleDepositToSafeLock = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum > walletBalance) {
      alert(
        `Insufficient balance in your wallet. Available: ${formatCurrency(
          walletBalance
        )}`
      );
      return;
    }

    console.log("Step 2 - Depositing to SafeLock with amount:", amountNum);
    console.log("Step 2 - Using SafeLock address:", currentSafeLockAddress);
    console.log("Step 2 - Current state values:", {
      creationStep,
      currentSafeLockAddress,
      durationDays,
    });

    // Deposit funds to the SafeLock
    const result = await dispatch(
      depositToSafeLock({
        embeddedWallet,
        amount: amountNum,
        safeLockAddress: currentSafeLockAddress,
      })
    );

    console.log("Step 2 - Deposit result:", result);
    console.log("Step 2 - Error if any:", result.error);

    // If successful, show success modal
    if (!result.error) {
      dispatch(
        openModal({
          modalType: "SAFELOCK_ACTIVATED",
          modalProps: {
            amount: parseFloat(amount),
            currency: "USDC",
            duration: durationDays,
            returns,
          },
        })
      );

      // Reset the form to prevent double deposits
      setAmount("");
    }
  };

  // Handle back button in step 2
  const handleBackToStep1 = () => {
    dispatch(resetSafeLockCreation());
  };

  // Render step 1: Duration selection
  if (creationStep === 1) {
    return (
      <>
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">
            Step 1: Choose Lock Duration
          </label>
          <LockDurationOptions
            duration={durationDays}
            onChange={handleDurationChange}
          />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg mb-6">
          <p className="text-sm">
            Choose how long you want to lock your funds. Longer duration may
            offer better returns.
          </p>
        </div>

        <button
          className="w-full bg-[#079669] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors duration-200 mt-6"
          onClick={handleCreateSafeLockAddress}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
          ) : (
            <img
              src="/icons/lock_white.svg"
              alt="Lock Icon"
              className="w-4 h-4 mr-2"
            />
          )}
          Continue
        </button>
      </>
    );
  }

  // Render step 2: Amount selection
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Step 2: Lock Amount</h3>
        <button
          onClick={handleBackToStep1}
          className="text-sm text-blue-600 hover:underline"
          disabled={isSubmitting}
        >
          Back
        </button>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg mb-6">
        <p className="text-sm font-medium">Duration: {durationDays} days</p>
        <p className="text-xs text-gray-600">
          SafeLock address: {currentSafeLockAddress?.substring(0, 8)}...
          {currentSafeLockAddress?.substring(currentSafeLockAddress.length - 6)}
        </p>
      </div>

      <div className="mb-6">
        <label
          htmlFor="lockAmount"
          className="block text-sm text-gray-600 mb-2"
        >
          Lock Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500">$</span>
          <input
            id="lockAmount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            onFocus={() => setShowActivity(false)}
            onBlur={() => setShowActivity(true)}
            className="w-full p-2 pl-8 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#079669] focus:border-transparent"
            placeholder="0.00"
          />
          <button
            className="absolute right-3 top-2.5 text-[#079669] text-xs font-medium"
            onClick={() =>
              walletBalance > 0 && setAmount(walletBalance.toString())
            }
            disabled={isLoadingBalance || walletBalance <= 0}
          >
            MAX
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Wallet Balance:{" "}
          {isLoadingBalance ? (
            <span className="inline-block w-16 h-3 bg-gray-200 animate-pulse rounded"></span>
          ) : (
            formatCurrency(walletBalance)
          )}
        </div>
      </div>

      {parseFloat(amount) > 0 && (
        <ExpectedReturns amount={parseFloat(amount)} returns={returns} />
      )}

      <button
        className="w-full bg-[#079669] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors duration-200 mt-6"
        onClick={handleDepositToSafeLock}
        disabled={
          isSubmitting ||
          isLoadingBalance ||
          !amount ||
          parseFloat(amount) <= 0 ||
          parseFloat(amount) > walletBalance
        }
      >
        {isSubmitting ? (
          <span className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
        ) : (
          <img
            src="/icons/lock_white.svg"
            alt="Lock Icon"
            className="w-4 h-4 mr-2"
          />
        )}
        Create Safelock
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}
    </>
  );
};

export default CreateSafelock;
