import React from "react";

const QuicksaveCard = ({ balance, isLoading }) => {
  return (
    <div className="bg-[#D1FAE5] rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2 pl-2">
        <div className="bg-[#0796691a] rounded-full p-2">
          <img
            src="/icons/wallet_green.svg"
            alt="Quicksave"
            className="w-5 h-5 text-[#079669]"
          />
        </div>
        <span className="font-medium text-[#079669]">Quicksave</span>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
        ) : (
          <h2 className="text-2xl font-bold">
            ${balance?.toFixed(2) || "0.00"}
          </h2>
        )}
        <p className="text-sm text-gray-500">
          Daily interest, withdraw anytime
        </p>
      </div>
    </div>
  );
};

export default QuicksaveCard;
