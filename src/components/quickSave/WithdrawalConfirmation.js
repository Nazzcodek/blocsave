import React from "react";
import Button from "../common/Button";

/**
 * Component for confirming QuickSave withdrawals
 */
const WithdrawalConfirmation = ({
  amount,
  currency = "USDC",
  onConfirm,
  onCancel,
  isProcessing,
}) => {
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-8 h-8 text-[#079669]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          Confirm Withdrawal
        </h3>
        <p className="text-gray-600 mt-1">
          You&apos;re about to withdraw {amount} {currency} to your wallet
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Amount</span>
          <span className="font-semibold">
            ${Number(amount).toFixed(2)} {currency}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Fee</span>
          <span className="font-semibold">$0.00</span>
        </div>
        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900">Total</span>
          <span className="font-semibold text-gray-900">
            ${Number(amount).toFixed(2)} {currency}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing}
          className="w-full bg-[#079669] hover:bg-[#067857] text-white"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
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
            "Confirm Withdrawal"
          )}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default WithdrawalConfirmation;
