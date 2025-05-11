import React from "react";
import { useSelector } from "react-redux";
import { formatCurrency } from "../../utils/formatters";

const SafelockSummary = () => {
  const safelockState = useSelector((state) => state.safelock) || {};
  const totalBalance = safelockState.totalBalance || 0;
  const activeLocks = safelockState.activeLocks || 0;
  const isLoading = safelockState.isLoading;

  return (
    <div className="bg-[#D1FAE5] rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2 pl-2">
        <div className="bg-[#0796691a] rounded-full p-2">
          <img
            src="/icons/lock_green.svg"
            alt="Safelock"
            className="w-5 h-5 text-[#079669]"
          />
        </div>
        <span className="font-medium text-[#079669]">Safelock</span>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
        ) : (
          <h2 className="text-2xl font-bold">{formatCurrency(totalBalance)}</h2>
        )}
        <p className="text-sm text-gray-500">{activeLocks} active locks</p>
      </div>
    </div>
  );
};

export default SafelockSummary;
