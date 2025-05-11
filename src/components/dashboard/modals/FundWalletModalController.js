import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  closeFundModal, 
  selectSource, 
  setAmount, 
  completePayment, 
  resetFundModal 
} from "@/redux/slices/fundModalSlice";
import FundWalletModal from "./FundWalletModal";
import FundWalletAmountModal from "./FundWalletAmountModal";
import FundWalletPaymentModal from "./FundWalletPaymentModal";

const FundWalletModalController = () => {
  const dispatch = useDispatch();
  const { isOpen, step, selectedSource, amount } = useSelector((state) => state.fundModal);

  const handleClose = () => {
    dispatch(closeFundModal());
  };

  const handleSourceSelect = (source) => {
    dispatch(selectSource(source));
  };

  const handleAmountConfirmed = (amount) => {
    dispatch(setAmount(amount));
  };

  const handlePaymentCompleted = () => {
    dispatch(completePayment());
    
    // Auto-close after successful payment
    setTimeout(() => {
      dispatch(resetFundModal());
    }, 2000);
  };

  // Only show the source selection modal when in the source step
  const showSourceModal = isOpen && step === "source";
  
  // Only show the amount modal when in the amount step
  const showAmountModal = isOpen && step === "amount";
  
  // Only show the payment modal when in the payment step
  const showPaymentModal = isOpen && step === "payment" || step === "success";

  return (
    <>
      <FundWalletModal
        isOpen={showSourceModal}
        onClose={handleClose}
        onSourceSelect={handleSourceSelect}
      />
      
      <FundWalletAmountModal
        isOpen={showAmountModal}
        onClose={handleClose}
        onConfirm={handleAmountConfirmed}
        source={selectedSource}
      />
      
      <FundWalletPaymentModal
        isOpen={showPaymentModal}
        onClose={handleClose}
        onComplete={handlePaymentCompleted}
        amount={amount}
        showSuccess={step === "success"}
      />
    </>
  );
};

export default FundWalletModalController;