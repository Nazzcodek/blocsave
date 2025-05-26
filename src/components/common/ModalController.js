import React from "react";
import { useSelector } from "react-redux";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import InfoModal from "./InfoModal";
import ConfirmationModal from "./ConfirmationModal";

// Helper function to format message strings with dynamic values
const formatMessage = (template, values) => {
  if (!template || !values) return template;

  // Replace placeholders like {groupName} with actual values from props
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });
};

// Base configuration for all modals
const MODAL_CONFIGS = {
  ADASHE_CREATION_SUCCESS: {
    title: "You've just created a new Adashe (Group Savings) circle.",
    message: "Invite your trusted circle to join and start saving.",
    // We'll handle the code separately through props now
  },
  ADASHE_JOIN_SUCCESS: {
    title: "Welcome to the Circle!",
    message: "{message}", // Will be replaced with custom message or default
    subMessage: "",
  },
  SAFELOCK_ACTIVATED: {
    title: "Safe Lock Activated!",
    message: "No touching till it's time",
    subMessage:
      "Amount locked: {amount} {currency} for {duration} days with {interestAmount} {currency}",
  },
  SAFELOCK_WITHDRAWAL: {
    title: "Withdrawal successful",
    message: "Your locked funds are now available.",
    subMessage: "Amount: {amount} {currency}",
  },
  WITHDRAWAL_SUCCESS: {
    title: "Withdrawal Successful!",
    message: "Your funds are on their way",
    subMessage: "Amount: {amount} {currency} to {destination}",
  },
  WITHDRAWAL_BANK_SUCCESS: {
    title: "Withdrawal to Bank Initiated!",
    message: "Your funds are on their way to your bank account",
    subMessage:
      "Amount: {amount} {currency} • Bank: {bankName} • Account: *****{lastDigits}",
  },
  WITHDRAWAL_CRYPTO_SUCCESS: {
    title: "Crypto Withdrawal Initiated!",
    message: "Your funds are on their way to your wallet",
    subMessage: "Amount: {amount} {currency} • Wallet: {walletAddress}",
  },
  QUICKSAVE: {
    title: "Quicksave complete! Keep going",
    message: "You just saved {amount} {currency} on Quicksave",
    subMessage: "",
  },
  QUICKSAVE_WITHDRAWAL: {
    title: "Boom! Funds are back in your wallet",
    message: "You just withdrew {amount} {currency} to your wallet",
    subMessage: "",
  },
  // Add more modal configurations as needed
  ERROR_MODAL: {
    title: "Error Occurred",
    message: "There was a problem processing your request. Please try again.",
    isError: true,
  },
  INFO_MODAL: {
    title: "Information",
    message: "Please note this information.",
    isInfo: true,
    showSpinner: false,
  },
  CONFIRMATION_MODAL: {
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
    isConfirmation: true,
  },
  SUCCESS_MODAL: {
    title: "Success",
    message: "Operation completed successfully.",
    isSuccess: true,
  },
};

const ModalController = () => {
  const { isOpen, modalType, modalProps } = useSelector((state) => state.modal);

  if (!isOpen) return null;

  // Get base configuration for this modal type
  const config = MODAL_CONFIGS[modalType] || {};

  // Process the modalProps to extract nested data if needed
  let processedProps = { ...modalProps };

  // For SAFELOCK_ACTIVATED, extract the total returns value
  if (modalType === "SAFELOCK_ACTIVATED" && modalProps.returns) {
    processedProps.interestAmount = modalProps.returns.total;
  }

  // Format messages with dynamic values from modalProps
  const formattedConfig = {
    ...config,
    title: formatMessage(config.title, processedProps),
    message: formatMessage(config.message, processedProps),
    subMessage: formatMessage(config.subMessage, processedProps),
  };

  // Handle special case for ADASHE_CREATION_SUCCESS with code prop
  if (modalType === "ADASHE_CREATION_SUCCESS" && modalProps.code) {
    // Use the blockchain-generated circle invitation code if available
    formattedConfig.code = modalProps.code;

    // Update messages specifically for the circle creation success
    formattedConfig.message =
      "Invite your trusted circle to join your Adashe using this code:";
  }

  // Handle special case for ADASHE_JOIN_SUCCESS with custom message
  if (modalType === "ADASHE_JOIN_SUCCESS") {
    if (modalProps.message) {
      // Use the custom message provided by the join result
      formattedConfig.message = modalProps.message;
    } else {
      // Use default template message
      formattedConfig.message = "You've successfully joined the savings group";
    }
  }

  // Merge with any additional props
  const modalConfig = {
    ...formattedConfig,
    ...modalProps,
  };

  // Check if this is an error modal
  if (modalConfig.isError) {
    return <ErrorModal {...modalConfig} />;
  }

  // Check if this is an info modal
  if (modalConfig.isInfo) {
    return <InfoModal {...modalConfig} />;
  }

  // Check if this is a confirmation modal
  if (modalConfig.isConfirmation) {
    return <ConfirmationModal {...modalConfig} />;
  }

  // Default to success modal for all other types
  return <SuccessModal {...modalConfig} />;
};

export default ModalController;
