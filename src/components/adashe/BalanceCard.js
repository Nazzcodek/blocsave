import React from "react";
import { useSelector } from "react-redux";

const BalanceCard = () => {
  const { totalBalance, activeCircles, isLoading } = useSelector(
    (state) => state.adashe
  );

  return (
    <div className="bg-[#D1FAE5] rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2 pl-2">
        <div className="bg-[#0796691a] rounded-full p-2">
          <img
            src="/icons/adashe_green.svg"
            alt="Adashe"
            className="w-5 h-5 text-[#079669]"
          />
        </div>
        <span className="font-medium text-[#079669]">Adashe</span>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
        ) : (
          <h2 className="text-2xl font-bold">
            ${totalBalance?.toFixed(2) || "0.00"}
          </h2>
        )}
        <p className="text-sm text-gray-500">
          {activeCircles || 0} Active Circles
        </p>
      </div>
    </div>
  );
};

export default BalanceCard;
