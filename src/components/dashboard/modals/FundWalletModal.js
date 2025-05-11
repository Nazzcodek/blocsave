import React from "react";
import Modal from "../../common/Modal";
import { RiBankLine, RiWalletLine } from "react-icons/ri";

// Simplified version that works with our Redux fund modal flow
const FundWalletModal = ({ isOpen, onClose, onSourceSelect }) => {
  const handleSourceSelect = (source) => {
    onSourceSelect(source);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
  );
};

export default FundWalletModal;