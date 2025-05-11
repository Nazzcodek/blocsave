import React, { useState, useEffect } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { formatCurrency } from "../../../utils/formatters";

const FundWalletPaymentModal = ({
  isOpen,
  onClose,
  onComplete,
  amount,
  showSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("initial"); // initial, processing, success

  // Reset payment status when modal opens/closes
  useEffect(() => {
    if (isOpen && !showSuccess) {
      setPaymentStatus("initial");
    } else if (showSuccess) {
      setPaymentStatus("success");
    }
  }, [isOpen, showSuccess]);

  const handlePayment = () => {
    setIsLoading(true);
    setPaymentStatus("processing");

    // Simulate payment process
    setTimeout(() => {
      onComplete();
      setIsLoading(false);
    }, 2000);
  };

  const handleClose = () => {
    // If payment is in progress, don't allow closing
    if (paymentStatus === "processing") return;

    onClose();
  };

  // Render different content based on payment status
  const renderContent = () => {
    switch (paymentStatus) {
      case "processing":
        return (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your payment...</p>
            <p className="text-sm text-gray-500 mt-2">
              Please don't close this window
            </p>
          </div>
        );

      case "success":
        return (
          <div className="py-8 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600">
              Your wallet has been funded with {formatCurrency(amount)} USDC.
            </p>
          </div>
        );

      default:
        return (
          <div className="py-4">
            <p className="text-gray-600 mb-6">
              Complete your payment to fund your wallet. This process is secure
              and your information is protected.
            </p>

            <div className="border rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-2">Payment Details</h4>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">
                  {formatCurrency(amount)} USDC
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fee:</span>
                <span className="font-medium">$0.00 USDC</span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handlePayment}
              isLoading={isLoading}
              className="w-full"
            >
              Complete Payment
            </Button>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        paymentStatus === "success" ? "Payment Successful" : "Complete Payment"
      }
      closeDisabled={paymentStatus === "processing"}
    >
      {renderContent()}
    </Modal>
  );
};

export default FundWalletPaymentModal;
