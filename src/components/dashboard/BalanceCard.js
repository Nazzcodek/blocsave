import React, { useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import { formatCurrency } from "../../utils/formatters";
import {
  RiArrowRightUpLine,
  RiArrowRightDownLine,
  RiAddLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import FundWalletModal from "./modals/FundWalletModal";

const BalanceCard = ({
  title,
  amount,
  currency = "USDC",
  variant = "wallet",
  onFund,
  onWithdraw,
}) => {
  const [showFundModal, setShowFundModal] = useState(false);

  // Different styles based on variant
  const cardStyles = {
    wallet: "border-l-4 border-primary-500",
    savings: "border-l-4 border-secondary-500",
  };

  // Format the amount nicely with currency
  const formattedAmount = formatCurrency(amount, currency);

  const handleFundClick = () => {
    setShowFundModal(true);
    if (onFund) onFund(); // Still call the original onFund if provided
  };

  const handleCloseFundModal = () => {
    setShowFundModal(false);
  };

  return (
    <>
      <Card className={`${cardStyles[variant] || ""} h-full`}>
        <div className="flex flex-col h-full">
          <h4 className="text-sm font-medium text-gray-500">{title}</h4>
          <div className="mt-2 mb-6">
            <span className="text-2xl font-bold text-gray-900">
              {formattedAmount}
            </span>
          </div>

          <div className="flex gap-2 mt-auto">
            {onFund !== undefined && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleFundClick}
                icon={<RiAddLine />}
                iconPosition="left"
                className="flex-1"
              >
                Fund Account
              </Button>
            )}

            {onWithdraw && (
              <Button
                variant="outline"
                size="sm"
                onClick={onWithdraw}
                icon={
                  variant === "wallet" ? (
                    <RiArrowRightDownLine />
                  ) : (
                    <RiMoneyDollarCircleLine />
                  )
                }
                iconPosition="left"
                className="flex-1"
              >
                Withdraw
              </Button>
            )}
          </div>
        </div>
      </Card>

      <FundWalletModal isOpen={showFundModal} onClose={handleCloseFundModal} />
    </>
  );
};

export default BalanceCard;
