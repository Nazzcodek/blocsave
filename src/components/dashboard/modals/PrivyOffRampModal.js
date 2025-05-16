import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useDispatch } from "react-redux";
import { openModal } from "@/redux/slices/modalSlice";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Image from "next/image";

const ProviderOption = ({ provider, selected, onClick }) => {
  return (
    <div
      className={`p-4 border rounded-lg mb-3 cursor-pointer ${
        selected ? "border-[#079669] bg-green-50" : "border-gray-200"
      }`}
      onClick={() => onClick(provider)}
    >
      <div className="flex items-center">
        <div className="mr-3 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
          {provider.logo ? (
            <Image
              src={provider.logo}
              alt={provider.name}
              width={24}
              height={24}
            />
          ) : (
            <div className="text-lg font-bold text-gray-500">
              {provider.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{provider.name}</h3>
          <p className="text-sm text-gray-500">{provider.description}</p>
        </div>
        <div className="ml-4">
          <div
            className={`w-5 h-5 border rounded-full ${
              selected ? "border-[#079669] bg-[#079669]" : "border-gray-300"
            } flex items-center justify-center`}
          >
            {selected && (
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path
                  d="M1 5L4 8L11 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivyOffRampModal = ({ isOpen, onClose, source = "wallet" }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState("provider"); // provider, amount, processing, success
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const { authenticated, user, ready, createTransaction } = usePrivy();

  // Updated off-ramp provider options focused on Nigerian banks and crypto wallets
  const providers = [
    {
      id: "zeta",
      name: "Zeta",
      description: "Withdraw to Nigerian bank accounts",
      logo: "/icons/dollar-circle.svg",
      type: "bank",
    },
    {
      id: "monnify",
      name: "Monnify",
      description: "Fast withdrawals to Nigerian banks",
      logo: "/icons/Bank.svg",
      type: "bank",
    },
    {
      id: "crypto",
      name: "External Wallet",
      description: "Withdraw to any external crypto wallet",
      logo: "/icons/wallet.svg",
      type: "crypto",
    },
    {
      id: "moonpay",
      name: "MoonPay",
      description: "Withdraw to international bank accounts",
      logo: "/icons/dollar-circle.svg",
      type: "bank",
    },
  ];

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
    setStep("amount");
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handleWithdrawSubmit = async () => {
    try {
      setError("");
      setIsProcessing(true);

      if (!authenticated || !ready || !user) {
        throw new Error("Please connect your wallet first");
      }

      // Get wallet address safely
      const walletAddress =
        user?.wallet?.address ||
        (Array.isArray(user?.wallets) &&
          user.wallets.length > 0 &&
          user.wallets[0]?.address);

      if (!walletAddress) {
        throw new Error("No wallet address found");
      }

      // Convert amount to numeric value
      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Initialize transaction parameters
      const txParams = {
        chainId: "base-sepolia", // Use appropriate chain
        amount: withdrawAmount,
        currency: "USDC",
        walletAddress: walletAddress,
      };

      let successModalProps = {
        amount: amount,
        currency: "USDC",
      };

      // Configure transaction based on provider type
      if (selectedProvider.type === "crypto") {
        // For direct wallet transfers, we need to prompt for destination address
        txParams.method = "fiat-offramp";
        txParams.provider = "wallet-transfer";

        // In a real implementation, you would collect the destination address
        const destinationAddress = prompt("Enter destination wallet address:");
        if (!destinationAddress || !destinationAddress.trim()) {
          throw new Error("Valid destination address required");
        }
        txParams.destinationAddress = destinationAddress;

        // Set success modal props for crypto withdrawal
        successModalProps.walletAddress = `${destinationAddress.substring(
          0,
          6
        )}...${destinationAddress.substring(destinationAddress.length - 4)}`;
      } else if (
        selectedProvider.id === "zeta" ||
        selectedProvider.id === "monnify"
      ) {
        // For Nigerian bank withdrawals
        txParams.method = "fiat-offramp";
        txParams.provider = selectedProvider.id;

        // Collect Nigerian bank details
        const accountNumber = prompt("Enter your bank account number:");
        if (!accountNumber || accountNumber.length < 10) {
          throw new Error("Valid account number required");
        }

        const bankName = prompt(
          "Enter your bank name (e.g., GTBank, Access Bank):"
        );
        if (!bankName || !bankName.trim()) {
          throw new Error("Valid bank name required");
        }

        txParams.bankDetails = {
          accountNumber,
          bankName,
          country: "Nigeria",
        };

        // Set success modal props for bank withdrawal
        successModalProps.bankName = bankName;
        successModalProps.lastDigits = accountNumber.substring(
          accountNumber.length - 4
        );
      } else {
        // For other bank/card withdrawals
        txParams.method = "fiat-offramp";
        txParams.provider = selectedProvider.id;

        // Set generic success modal props
        successModalProps.destination = selectedProvider.name;
      }

      // Create the transaction via Privy
      const transaction = await createTransaction(txParams);

      // Handle transaction response
      console.log("Withdrawal transaction initiated:", transaction);

      // Store the modal type and props to use after closing
      const modalType =
        selectedProvider.type === "crypto"
          ? "WITHDRAWAL_CRYPTO_SUCCESS"
          : selectedProvider.id === "zeta" || selectedProvider.id === "monnify"
          ? "WITHDRAWAL_BANK_SUCCESS"
          : "WITHDRAWAL_SUCCESS";

      // First close this modal
      onClose();

      // Then show success modal after a slight delay to ensure proper modal state
      setTimeout(() => {
        dispatch(
          openModal({
            modalType,
            modalProps: successModalProps,
          })
        );
      }, 500); // 500ms delay should be enough for the first modal to close
    } catch (error) {
      console.error("Withdrawal error:", error);
      setError(error.message || "Failed to process withdrawal");
      setStep("amount"); // Go back to amount step on error
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isProcessing) {
      setStep("provider");
      setSelectedProvider(null);
      setAmount("");
      setError("");
      onClose();
    }
  };

  const renderContent = () => {
    switch (step) {
      case "provider":
        return (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Select a provider to withdraw your funds
            </p>

            {providers.map((provider) => (
              <ProviderOption
                key={provider.id}
                provider={provider}
                selected={selectedProvider?.id === provider.id}
                onClick={handleSelectProvider}
              />
            ))}
          </div>
        );

      case "amount":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Provider</span>
              <div className="flex items-center">
                <span className="font-medium mr-2">
                  {selectedProvider.name}
                </span>
                <button
                  onClick={() => setStep("provider")}
                  className="text-[#079669] text-sm underline"
                >
                  Change
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount to withdraw
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="text"
                  id="amount"
                  className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#079669] focus:border-[#079669]"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-gray-500">USDC</span>
                </div>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-sm">Withdrawal Process:</h4>
              <ol className="mt-2 text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Funds will be withdrawn from your {source} balance</li>
                <li>
                  {selectedProvider.type === "crypto"
                    ? "You'll need to provide a destination wallet address"
                    : "You may need to complete KYC verification with the provider"}
                </li>
                <li>
                  {selectedProvider.type === "crypto"
                    ? "Transfer usually completes within minutes"
                    : "Bank transfers typically take 1-3 business days"}
                </li>
              </ol>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleWithdrawSubmit}
              disabled={isProcessing || !amount}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Withdraw Funds"
              )}
            </Button>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#079669]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Withdrawal Initiated!</h3>
            <p className="text-gray-600">
              Your withdrawal has been successfully initiated. You can track its
              progress in the activity section.
            </p>
            <Button onClick={handleClose} variant="primary">
              Close
            </Button>
          </div>
        );
    }
  };

  const modalTitle = {
    provider: "Withdraw Funds",
    amount: "Enter Withdrawal Amount",
    success: "Withdrawal Complete",
  }[step];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle}>
      {renderContent()}
    </Modal>
  );
};

export default PrivyOffRampModal;
