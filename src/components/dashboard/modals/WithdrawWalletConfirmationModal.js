import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";

const WithdrawWalletConfirmationModal = ({
  isOpen,
  onClose,
  onComplete,
  amount,
  destination,
  showSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const { ready, authenticated, user } = usePrivy();

  const handleConfirmWithdraw = async () => {
    setIsProcessing(true);
    setError("");

    try {
      // Perform different withdrawal operations based on destination type
      if (destination?.id === "bank") {
        // Bank withdrawal logic
        // This would integrate with your payment processor or banking API
        await simulateBankWithdrawal();
      } else if (destination?.id === "crypto") {
        // Crypto wallet withdrawal logic using Privy
        if (!ready || !authenticated) {
          throw new Error("Authentication required");
        }

        await simulateCryptoWithdrawal();
      }

      // Complete the withdrawal process
      onComplete();
    } catch (err) {
      console.error("Withdrawal failed:", err);
      setError(err.message || "Withdrawal failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // Simulate bank withdrawal - replace with actual implementation
  const simulateBankWithdrawal = async () => {
    // Simulate API call to your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 2000);
    });
  };

  // Simulate crypto withdrawal - replace with actual implementation
  const simulateCryptoWithdrawal = async () => {
    // Here you would use the Privy SDK to initiate a transaction
    // This is a placeholder for the actual implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 2000);
    });
  };

  // Success view
  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Withdrawal Successful">
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="#079669"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Withdrawal Successful
          </h3>

          <p className="text-gray-600 mb-6">
            Your withdrawal of ${amount} to your {destination?.title} has been
            processed successfully.
          </p>

          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  // Confirmation view
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Withdrawal">
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500">Amount</span>
            <span className="text-lg font-medium">${amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Destination</span>
            <div className="flex items-center">
              <div className="w-5 h-5 mr-2">
                <Image
                  src={destination?.icon}
                  alt={destination?.title}
                  width={20}
                  height={20}
                />
              </div>
              <span>{destination?.title}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="pt-4">
          <Button
            onClick={handleConfirmWithdraw}
            className="w-full"
            isLoading={isProcessing}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm Withdrawal"}
          </Button>
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800"
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WithdrawWalletConfirmationModal;
