import React from "react";

// A reusable blockchain transaction status display component
const TransactionStatus = ({
  status,
  txHash,
  message,
  showSpinner = true,
  className = "",
  onViewTransaction = null,
}) => {
  // Default message based on status
  const defaultMessages = {
    pending: "Transaction in progress...",
    confirmed: "Transaction confirmed",
    failed: "Transaction failed",
    timeout: "Transaction timed out",
    unknown: "Transaction status unknown",
  };

  const statusMessage =
    message || defaultMessages[status] || defaultMessages.unknown;

  // Status indicator colors
  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "text-blue-600 border-blue-300 bg-blue-50";
      case "confirmed":
        return "text-green-600 border-green-300 bg-green-50";
      case "failed":
        return "text-red-600 border-red-300 bg-red-50";
      case "timeout":
        return "text-yellow-600 border-yellow-300 bg-yellow-50";
      default:
        return "text-gray-600 border-gray-300 bg-gray-50";
    }
  };

  const handleViewTransaction = () => {
    if (!txHash || !onViewTransaction) return;
    onViewTransaction(txHash);
  };

  return (
    <div className={`rounded-md p-3 border ${getStatusColor()} ${className}`}>
      <div className="flex items-center">
        {showSpinner && status === "pending" && (
          <svg
            className="animate-spin h-4 w-4 mr-2"
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
        )}

        {status === "confirmed" && (
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}

        {status === "failed" && (
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}

        {status === "timeout" && (
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}

        <span>{statusMessage}</span>
      </div>

      {txHash && (
        <div className="mt-1.5 flex">
          <p className="text-xs font-mono truncate mr-1">
            TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </p>

          {onViewTransaction && (
            <button
              onClick={handleViewTransaction}
              className="text-xs underline hover:opacity-80"
            >
              View
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionStatus;
