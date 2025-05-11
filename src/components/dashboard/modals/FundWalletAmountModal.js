import React, { useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";

const FundWalletAmountModal = ({ isOpen, onClose, onConfirm, source }) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountChange = (e) => {
    // Only allow numbers and a single decimal point
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    setIsLoading(true);

    // Simulate API call with a timeout
    setTimeout(() => {
      setIsLoading(false);
      // Pass the amount to parent component or Redux action
      onConfirm(parseFloat(amount));
      // Reset amount after confirming
      setAmount("");
    }, 500);
  };

  const handleClose = () => {
    setAmount("");
    onClose();
  };

  const getSourceTitle = () => {
    switch (source) {
      case "bank":
        return "Fund from Bank Account";
      case "external":
        return "Fund from External Wallet";
      default:
        return "Fund Wallet";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getSourceTitle()}>
      <div className="py-4">
        <label className="block text-sm text-gray-600 mb-2">
          Amount (USDC)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500">$</span>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full p-3 pl-8 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="0.00"
            autoFocus
          />
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            className="flex-1"
            isLoading={isLoading}
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FundWalletAmountModal;
