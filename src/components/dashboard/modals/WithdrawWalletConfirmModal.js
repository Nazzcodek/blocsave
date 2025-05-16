import React, { useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { formatCurrency } from "../../../utils/formatters";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { RiBankLine, RiWalletLine } from "react-icons/ri";

const WithdrawWalletConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  destination,
  amount,
  isProcessing = false,
  isSuccess = false,
}) => {
  // Determine destination details based on selected destination
  const destinationName =
    destination === "bank" ? "Bank Account" : "Privy Wallet";
  const DestinationIcon = destination === "bank" ? RiBankLine : RiWalletLine;
  const iconColor = destination === "bank" ? "text-green-500" : "text-blue-500";

  // Transaction fee - this would typically come from your API
  const fee = 0.5;
  const totalAmount = parseFloat(amount) + fee;

  // Success content to show after withdrawal is confirmed
  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Withdrawal Successful">
        <div className="py-4 flex flex-col items-center">
          <RiCheckboxCircleFill className="text-green-500 text-6xl mb-4" />
          <h3 className="text-xl font-medium mb-2">Withdrawal Successful</h3>
          <p className="text-gray-600 text-center mb-4">
            You have successfully withdrawn {formatCurrency(amount)} USDC to
            your {destinationName}.
          </p>
          <div className="w-full pt-4">
            <Button variant="primary" onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Withdrawal">
      <div className="py-2">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className={`mr-3 ${iconColor}`}>
              <DestinationIcon size={24} />
            </div>
            <div className="text-lg font-medium">
              Withdraw to {destinationName}
            </div>
          </div>

          <div className="border-t border-b border-gray-200 py-4 my-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium">{formatCurrency(amount)} USDC</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Fee</span>
              <span className="font-medium">{formatCurrency(fee)} USDC</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-gray-800 font-medium">Total</span>
              <span className="font-semibold">
                {formatCurrency(totalAmount)} USDC
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-6">
            <p>• Withdrawals typically process within 24 hours.</p>
            <p>• Once initiated, withdrawals cannot be cancelled.</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={onConfirm}
            className="w-full"
            loading={isProcessing}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm Withdrawal"}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WithdrawWalletConfirmModal;
