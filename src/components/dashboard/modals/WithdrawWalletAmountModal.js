import React, { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { useSelector } from "react-redux";

const WithdrawWalletAmountModal = ({
  isOpen,
  onClose,
  onConfirm,
  destination,
}) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const { walletBalance } = useSelector((state) => state.dashboard);
  const availableBalance = walletBalance?.amount || 0;

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError("");
    }
  }, [isOpen]);

  const handleAmountChange = (e) => {
    const value = e.target.value;

    // Only allow numbers and decimals
    if (!/^\d*\.?\d*$/.test(value) && value !== "") {
      return;
    }

    setAmount(value);
    setError("");
  };

  const handleMaxAmount = () => {
    setAmount(availableBalance.toString());
    setError("");
  };

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount);

    // Validation checks
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parsedAmount > parseFloat(availableBalance)) {
      setError("Amount exceeds available balance");
      return;
    }

    // Proceed with confirmation
    onConfirm(parsedAmount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Funds">
      <div className="space-y-6">
        {destination && (
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full mr-3">
              <Image
                src={destination.icon}
                alt={destination.title}
                width={20}
                height={20}
              />
            </div>
            <div>
              <p className="text-sm text-gray-700">Withdrawing to</p>
              <p className="font-medium">{destination.title}</p>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="amount" className="text-sm text-gray-600">
              Amount
            </label>
            <span className="text-sm text-gray-600">
              Available: ${availableBalance}
            </span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="block w-full pl-8 pr-20 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="button"
              onClick={handleMaxAmount}
              className="absolute inset-y-0 right-0 px-4 py-1 mr-1 my-1.5 text-sm text-green-600 bg-green-50 rounded hover:bg-green-100 focus:outline-none"
            >
              MAX
            </button>
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-4">
            {destination?.id === "bank"
              ? "Bank withdrawals typically take 1-3 business days to process."
              : "Crypto withdrawals are processed within minutes, but may take longer depending on network congestion."}
          </p>

          <Button onClick={handleConfirm} className="w-full" disabled={!amount}>
            Continue
          </Button>
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WithdrawWalletAmountModal;
