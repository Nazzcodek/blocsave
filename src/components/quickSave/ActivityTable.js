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
                      <div className="bg-[#0796691a] rounded-lg p-1 mr-1 sm:mr-2">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-[#079669]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm">
                        {transaction.from || "Quicksave"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {transaction.transactionId}
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
