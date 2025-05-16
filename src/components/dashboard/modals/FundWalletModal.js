import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { usePrivy } from "@privy-io/react-auth";
import { closeFundModal } from "@/redux/slices/fundModalSlice";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Image from "next/image";
import PaymentMethodSelector from "./PaymentMethodSelector";

const FundWalletModal = ({ isOpen }) => {
  const dispatch = useDispatch();
  const { ready, authenticated, user, createTransaction } = usePrivy();
  const [step, setStep] = useState("amount"); // amount, payment, processing, success
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  // Predefined amounts for quick selection
  const predefinedAmounts = ["10", "50", "100", "500"];

  // Reset state when modal closes and reopens
  useEffect(() => {
    if (isOpen) {
      setStep("amount");
      setAmount("");
      setPaymentMethod("credit-card");
      setError("");
      setSuccess(false);
      setTransactionStatus(null);
      setCopied(false);
    }
  }, [isOpen]);

  // Handle copy address to clipboard
  const handleCopyToClipboard = () => {
    if (transactionStatus && transactionStatus.hash) {
      navigator.clipboard
        .writeText(transactionStatus.hash)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000); // Reset copied state after 3 seconds
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  // Close the modal
  const handleClose = () => {
    dispatch(closeFundModal());
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setAmount(value);
      setError("");
    }
  };

  // Handle amount selection from predefined amounts
  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setError("");
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  // Navigate to payment method step
  const handleContinueToPayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    setStep("payment");
  };

  // Go back to amount step
  const handleBackToAmount = () => {
    setStep("amount");
  };

  // Handle form submission - Fund the wallet
  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStep("processing");

      if (!ready || !authenticated) {
        throw new Error("Please log in to fund your wallet");
      }

      // Get wallet address safely
      const walletAddress =
        user?.wallet?.address ||
        (Array.isArray(user?.wallets) && user.wallets[0]?.address) ||
        "";

      if (!walletAddress) {
        throw new Error(
          "No wallet address found. Please connect or create a wallet first."
        );
      }

      // Convert amount to appropriate unit
      const amountInUSDC = parseFloat(amount);

      // Different handling based on payment method
      let transaction;

      switch (paymentMethod) {
        case "credit-card":
        case "apple-pay":
          // Use Privy's fiat onramp if available
          transaction = await createTransaction({
            chainId: "base-sepolia", // Use the appropriate chain ID
            amount: amountInUSDC,
            currency: "USDC",
            method: "fiat-onramp",
            walletAddress: walletAddress,
            paymentMethod: paymentMethod === "apple-pay" ? "apple_pay" : "card",
          });
          break;

        case "bank-transfer":
          // Use ACH transfer if available
          transaction = await createTransaction({
            chainId: "base-sepolia",
            amount: amountInUSDC,
            currency: "USDC",
            method: "bank-transfer",
            walletAddress: walletAddress,
          });
          break;

        case "crypto":
          // Generate a crypto deposit address
          transaction = {
            hash: walletAddress,
            status: "waiting",
            isDepositAddress: true,
          };
          break;

        default:
          throw new Error("Invalid payment method selected");
      }

      // Monitor transaction status
      setTransactionStatus({
        hash: transaction.hash,
        status: transaction.status || "processing",
        isDepositAddress: transaction.isDepositAddress || false,
      });

      // Set success after transaction is initiated
      setSuccess(true);
      setStep("success");
    } catch (error) {
      console.error("Error funding wallet:", error);
      setError(error.message || "Failed to fund wallet. Please try again.");
      setStep("payment"); // Go back to payment step on error
    } finally {
      setLoading(false);
    }
  };

  // Get the appropriate modal title based on current step
  const getModalTitle = () => {
    switch (step) {
      case "amount":
        return "Fund Your Wallet";
      case "payment":
        return "Select Payment Method";
      case "processing":
        return "Processing Payment";
      case "success":
        return "Payment Successful";
      default:
        return "Fund Your Wallet";
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getModalTitle()}>
      {step === "amount" && (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Enter Amount (USDC)
              </label>
            </div>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                name="amount"
                value={amount}
                onChange={handleAmountChange}
                className="h-12 focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">USDC</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-4 gap-2">
              {predefinedAmounts.map((preAmount) => (
                <button
                  key={preAmount}
                  type="button"
                  onClick={() => handleAmountSelect(preAmount)}
                  className={`px-2 py-2 text-sm font-medium rounded-md ${
                    amount === preAmount
                      ? "bg-primary-50 text-primary-700 border border-primary-300"
                      : "bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  ${preAmount}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <Card className="p-4">
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-blue-100 rounded-full p-2">
                  <div className="relative w-6 h-6">
                    <Image
                      src="/icons/info-circle.svg"
                      alt="Info"
                      width={24}
                      height={24}
                      className="text-blue-600"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Funding your wallet allows you to participate in savings
                  products and earn interest on your deposits.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount to Fund</span>
                  <span className="font-medium">
                    ${parseFloat(amount || 0).toFixed(2)} USDC
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Network Fee</span>
                  <span className="font-medium">$0.00 USDC</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>${parseFloat(amount || 0).toFixed(2)} USDC</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              onClick={handleClose}
              type="button"
              variant="custom"
              className="bg-white border border-[#079669] text-[#079669] hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinueToPayment}
              variant="custom"
              className="bg-[#079669] text-white hover:bg-[#06805a] hover:shadow-md transition-all"
              disabled={!amount}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div>
          <Card className="p-3 mb-4">
            <h3 className="text-sm font-semibold mb-1">Order Summary</h3>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium">
                ${parseFloat(amount).toFixed(2)} USDC
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Fee</span>
              <span className="font-medium">$0.00</span>
            </div>
          </Card>

          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onMethodSelect={handlePaymentMethodSelect}
          />

          {error && (
            <div className="my-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between gap-2 mt-4 sticky bottom-0 pt-2 bg-white">
            <Button
              onClick={handleBackToAmount}
              type="button"
              variant="custom"
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmitPayment}
              variant="custom"
              className="bg-[#079669] text-white hover:bg-[#06805a] hover:shadow-md transition-all"
              disabled={loading}
            >
              {loading ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">
            Processing Your Payment
          </h3>
          <p className="text-gray-600 mb-4">
            Please wait while we process your payment. This may take a moment.
          </p>
        </div>
      )}

      {step === "success" && (
        <div className="text-center py-6">
          <div className="flex items-center justify-center">
            <img
              src="/icons/Group.svg"
              alt="Success"
              className="w-24 h-24 text-green-600"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">Transaction Initiated</h3>
          <p className="text-gray-600 mb-4">
            Your wallet funding transaction is being processed.
          </p>

          {transactionStatus && (
            <Card className="mb-4 p-3 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">
                    {transactionStatus.isDepositAddress
                      ? "Deposit Address:"
                      : "Transaction Hash:"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {transactionStatus.hash}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium capitalize">
                    {transactionStatus.status}
                  </span>
                  {transactionStatus.status === "processing" && (
                    <div className="ml-2 w-4 h-4 border-2 border-t-transparent border-green-500 rounded-full animate-spin"></div>
                  )}
                </div>
              </div>

              {transactionStatus.isDepositAddress && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    To complete your deposit, send USDC to the address above.
                  </p>
                  <Button
                    onClick={handleCopyToClipboard}
                    variant="custom"
                    className={`w-full text-sm ${
                      copied
                        ? "bg-[#079669] bg-opacity-20 text-[#079669]"
                        : "bg-[#079669] text-white hover:bg-[#06805a]"
                    } transition-all`}
                  >
                    <div className="flex items-center justify-center">
                      {copied ? (
                        <>
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        "Copy Address"
                      )}
                    </div>
                  </Button>
                </div>
              )}
            </Card>
          )}

          <div className="flex justify-center gap-4">
            <Button
              onClick={handleClose}
              variant="custom"
              className="bg-white border border-[#079669] text-[#079669] hover:bg-gray-50"
            >
              Close
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="custom"
              className="bg-[#079669] text-white hover:bg-[#06805a] hover:shadow-md transition-all"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default FundWalletModal;
