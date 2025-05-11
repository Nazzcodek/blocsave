import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSafelock } from "../../redux/slices/safelockSlice";
import LockDurationOptions from "./LockDurationOptions";
import ExpectedReturns from "./ExpectedReturns";
import { formatCurrency } from "../../utils/formatters";
import { calculateReturns } from "../../utils/formatters";
import { openModal } from "@/redux/slices/modalSlice";

const CreateSafelock = ({ setShowActivity }) => {
  const dispatch = useDispatch();
  const safelockState = useSelector((state) => state.safelock) || {};
  const walletBalance = safelockState.walletBalance || 0;
  const isSubmitting = safelockState.isSubmitting || false;

  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState(30);
  const [returns, setReturns] = useState({
    daily: 0,
    total: 0,
    maturityAmount: 0,
    maturityDate: "",
  });

  // Calculate expected returns whenever amount or duration changes
  useEffect(() => {
    if (amount && !isNaN(amount) && amount > 0) {
      const calculatedReturns = calculateReturns(parseFloat(amount), duration);
      setReturns(calculatedReturns);
    } else {
      setReturns({ daily: 0, total: 0, maturityAmount: 0, maturityDate: "" });
    }
  }, [amount, duration]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleDurationChange = (days) => {
    setDuration(days);
  };

  const handleCreateSafelock = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    // First dispatch the createSafelock action
    await dispatch(
      createSafelock({
        amount: parseFloat(amount),
        duration,
      })
    );

    // Then dispatch the openModal action
    dispatch(
      openModal({
        modalType: "SAFELOCK_ACTIVATED",
        modalProps: {
          amount: parseFloat(amount),
          currency: "USDC",
          duration,
          returns,
        },
      })
    );
  };

  return (
    <>
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
            onClick={() => walletBalance && setAmount(walletBalance.toString())}
            disabled={!walletBalance}
          >
            MAX
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Wallet Balance: {formatCurrency(walletBalance)}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-600 mb-2">
          Lock Duration
        </label>
        <LockDurationOptions
          duration={duration}
          onChange={handleDurationChange}
        />
      </div>

      {parseFloat(amount) > 0 && (
        <ExpectedReturns amount={parseFloat(amount)} returns={returns} />
      )}

      <button
        className="w-full bg-[#079669] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors duration-200 mt-6"
        onClick={handleCreateSafelock}
        disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
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
    </>
  );
};

export default CreateSafelock;
