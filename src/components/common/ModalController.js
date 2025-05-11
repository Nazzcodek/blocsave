import React from "react";
import { useSelector } from "react-redux";
import SuccessModal from "./SuccessModal";

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
    message: "You've successfully joined the {groupName} savings group",
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
    formattedConfig.code = modalProps.code;
  }

  // Merge with any additional props
  const modalConfig = {
    ...formattedConfig,
    ...modalProps,
  };

  return <SuccessModal {...modalConfig} />;
};

export default ModalController;
