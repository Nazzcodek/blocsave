import React, { useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { RiBankLine, RiWalletLine } from "react-icons/ri";
import FundWalletAmountModal from "../FundWalletAmountModal";
import FundWalletPaymentModal from "../FundWalletPaymentModal";

const FundWalletModal = ({ isOpen, onClose }) => {
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  const handleSourceSelect = (source) => {
    setSelectedSource(source);
    setShowAmountModal(true);
  };

  const handleAmountModalClose = () => {
    setShowAmountModal(false);
  };

  const handleAmountConfirmed = () => {
    setShowAmountModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
  };

  const handleFundingCompleted = () => {
    setShowPaymentModal(false);
    onClose();
  };

  // Reset all states when the main modal is closed
  const handleMainModalClose = () => {
    setShowAmountModal(false);
    setShowPaymentModal(false);
    setSelectedSource(null);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showAmountModal && !showPaymentModal}
        onClose={handleMainModalClose}
        title="Fund Wallet"
      >
        <div className="py-2">
          <div
            className="flex items-center p-4 border rounded-lg mb-4 cursor-pointer hover:bg-gray-50"
            onClick={() => handleSourceSelect("bank")}
          >
            <div className="text-green-500 mr-4">
              <RiBankLine size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Bank Account</h3>
              <p className="text-gray-500 text-sm">
                Fund wallet from your bank account
              </p>
            </div>
            <div className="text-gray-400">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div
            className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => handleSourceSelect("external")}
          >
            <div className="text-green-500 mr-4">
              <RiWalletLine size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">External Wallet</h3>
              <p className="text-gray-500 text-sm">
                Fund wallet from external wallet
              </p>
            </div>
            <div className="text-gray-400">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </Modal>

      {/* Amount Modal */}
      <FundWalletAmountModal
        isOpen={showAmountModal}
        onClose={handleAmountModalClose}
        onConfirm={handleAmountConfirmed}
        source={selectedSource}
      />

      {/* Payment Modal */}
      <FundWalletPaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        onComplete={handleFundingCompleted}
      />
    </>
  );
};

export default FundWalletModal;
