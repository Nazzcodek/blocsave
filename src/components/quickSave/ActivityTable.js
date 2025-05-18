import React from "react";
import { formatDate, formatAmount } from "../../utils/formatters";

const ActivityTable = ({ transactions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="flex py-2 sm:py-3 border-b border-gray-100"
          >
            <div className="w-1/4 h-4 sm:h-6 bg-gray-200 rounded mr-1 sm:mr-2"></div>
            <div className="w-1/4 h-4 sm:h-6 bg-gray-200 rounded mr-1 sm:mr-2"></div>
            <div className="w-1/4 h-4 sm:h-6 bg-gray-200 rounded mr-1 sm:mr-2"></div>
            <div className="w-1/4 h-4 sm:h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <p className="text-gray-500 text-center py-3 sm:py-4 text-xs sm:text-sm">
        No transaction history available.
      </p>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-[#0796691a] rounded-full p-1 mr-1 sm:mr-2">
                        <img
                          src="/icons/quicksave.svg"
                          alt="Quicksave Icon"
                          className="w-4 h-4 sm:w-5 sm:h-5 text-[#079669]"
                        />
                      </div>
                      <span className="text-xs sm:text-sm">
                        {transaction.from || "Quicksave"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {transaction.transactionId
                      ? `${transaction.transactionId.substring(
                          0,
                          6
                        )}...${transaction.transactionId.substring(
                          transaction.transactionId.length - 4
                        )}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {formatAmount(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityTable;
