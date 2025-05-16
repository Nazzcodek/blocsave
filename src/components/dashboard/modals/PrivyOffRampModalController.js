import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { closeModal } from "@/redux/slices/modalSlice";
import PrivyOffRampModal from "./PrivyOffRampModal";

const PrivyOffRampModalController = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState("wallet");
  const dispatch = useDispatch();

  // Listen for modal events from Redux
  const {
    isOpen: modalIsOpen,
    modalType,
    modalProps,
  } = useSelector((state) => state.modal);

  useEffect(() => {
    if (
      modalIsOpen &&
      (modalType === "WITHDRAW_WALLET" || modalType === "WITHDRAW_SAVINGS")
    ) {
      setIsOpen(true);
      setSource(modalProps?.source || "wallet");
    }
  }, [modalIsOpen, modalType, modalProps]);

  const handleClose = () => {
    // First set local state to close the modal UI
    setIsOpen(false);

    // Then dispatch closeModal to reset modal state in Redux
    dispatch(closeModal());
  };

  return (
    <PrivyOffRampModal isOpen={isOpen} onClose={handleClose} source={source} />
  );
};

export default PrivyOffRampModalController;
