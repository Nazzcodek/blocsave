import React from "react";
import Image from "next/image";
import Modal from "@/components/common/Modal";

const WithdrawWalletModal = ({ isOpen, onClose, onDestinationSelect }) => {
  // Withdrawal destination options
  const destinations = [
    {
      id: "bank",
      title: "Bank Account",
      description: "Withdraw to your connected bank account",
      icon: "/icons/Bank.svg",
    },
    {
      id: "crypto",
      title: "Crypto Wallet",
      description: "Withdraw to your connected wallet address",
      icon: "/icons/wallet.svg",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Funds">
      <div className="space-y-6">
        <p className="text-gray-600">
          Select where you&apos;d like to withdraw your funds
        </p>
        <div className="space-y-3">
          {destinations.map((destination) => (
            <button
              key={destination.id}
              onClick={() => onDestinationSelect(destination)}
              className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full mr-4">
                <Image
                  src={destination.icon}
                  alt={destination.title}
                  width={24}
                  height={24}
                />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">{destination.title}</h3>
                <p className="text-sm text-gray-500">
                  {destination.description}
                </p>
              </div>
              <div className="ml-4 text-gray-400">
                <svg
                  width="6"
                  height="10"
                  viewBox="0 0 6 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 9L5 5L1 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 text-xs text-gray-500">
          <p>
            Note: Withdrawals may take 1-3 business days to process depending on
            your bank.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default WithdrawWalletModal;
