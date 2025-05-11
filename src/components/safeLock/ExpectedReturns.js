import React from "react";
import { formatCurrency } from "../../utils/formatters";

const ExpectedReturns = ({ amount, returns }) => {
  const { daily, total, maturityAmount, maturityDate } = returns;

  return (
    <div className="bg-green-50 p-4 rounded-lg mb-6">
      <h4 className="text-sm font-medium text-green-700 mb-3">
        Expected Returns
      </h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[#034430] mb-1">Daily Interest (0.1%)</p>
          <p className="text-sm font-medium text-[#079669]">
            $ {daily.toFixed(5)} USDC
          </p>
        </div>

        <div>
          <p className="text-xs text-[#034430] mb-1">
            Total Interest ({maturityDate ? maturityDate.split(" ")[0] : ""}{" "}
            days)
          </p>
          <p className="text-sm font-medium text-[#079669]">
            $ {total.toFixed(4)} USDC
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#1FCB4F1a] flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-[#034430]">Maturity Amount</p>
          <p className="text-sm text-[#034430]">Maturity Date</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-[#079669]">
            $ {maturityAmount.toFixed(4)} USDC
          </p>
          <p className="text-sm text-[#079669]">{maturityDate}</p>
        </div>
      </div>
    </div>
  );
};

export default ExpectedReturns;
