import React from "react";
import { useSelector } from "react-redux";
import FundWalletModal from "./FundWalletModal";

const FundModalManager = () => {
  const { isOpen } = useSelector((state) => state.fundModal);

  return <FundWalletModal isOpen={isOpen} />;
};

export default FundModalManager;
