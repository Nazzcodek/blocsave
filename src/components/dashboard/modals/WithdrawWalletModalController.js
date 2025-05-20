import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { closeModal } from "@/redux/slices/modalSlice";
import WithdrawWalletModal from "./WithdrawWalletModal";
import WithdrawWalletAmountModal from "./WithdrawWalletAmountModal";
import WithdrawWalletConfirmationModal from "./WithdrawWalletConfirmationModal";
import { updateWalletBalance } from "@/redux/slices/dashboardSlice";

const WithdrawWalletModalController = () => {
  const dispatch = useDispatch();
  const { isOpen, modalType } = useSelector((state) => state.modal);
  // Move the wallet balance selector to component level
  const { walletBalance } = useSelector((state) => state.dashboard);

  const [currentStep, setCurrentStep] = useState("select-destination");
  const [withdrawalData, setWithdrawalData] = useState({
    destination: null,
    amount: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const isModalOpen = isOpen && modalType === "WITHDRAW_WALLET";

  const handleClose = () => {
    // Reset state and close modal
    setCurrentStep("select-destination");
    setWithdrawalData({
      destination: null,
      amount: 0,
    });
    setShowSuccess(false);
    dispatch(closeModal());
  };

  const handleDestinationSelect = (destination) => {
    setWithdrawalData({
      ...withdrawalData,
      destination,
    });
    setCurrentStep("enter-amount");
  };

  const handleAmountConfirm = (amount) => {
    setWithdrawalData({
      ...withdrawalData,
      amount,
    });
    setCurrentStep("confirm-withdrawal");
  };

  const handleWithdrawalComplete = () => {
    // Update wallet balance in Redux (in a real app, this would happen after API confirmation)
    if (walletBalance?.amount) {
      const newBalance =
        parseFloat(walletBalance.amount) - withdrawalData.amount;
      dispatch(
        updateWalletBalance({
          ...walletBalance,
          amount: newBalance.toFixed(2),
        })
      );
    }

    // Show success screen
    setShowSuccess(true);
  };

  return (
    <>
      {/* Step 1: Select Destination */}
      <WithdrawWalletModal
        isOpen={isModalOpen && currentStep === "select-destination"}
        onClose={handleClose}
        onDestinationSelect={handleDestinationSelect}
      />

      {/* Step 2: Enter Amount */}
      <WithdrawWalletAmountModal
        isOpen={isModalOpen && currentStep === "enter-amount"}
        onClose={handleClose}
        onConfirm={handleAmountConfirm}
        destination={withdrawalData.destination}
      />

      {/* Step 3: Confirm Withdrawal */}
      <WithdrawWalletConfirmationModal
        isOpen={isModalOpen && currentStep === "confirm-withdrawal"}
        onClose={handleClose}
        onComplete={handleWithdrawalComplete}
        amount={withdrawalData.amount}
        destination={withdrawalData.destination}
        showSuccess={showSuccess}
      />
    </>
  );
};

export default WithdrawWalletModalController;
