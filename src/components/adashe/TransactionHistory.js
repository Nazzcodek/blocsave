import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAllAdasheTransactionHistory } from "../../services/blockchain/useAdasheHistory";

const TransactionHistory = ({ circleId = null }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { embeddedWallet } = useSelector((state) => state.auth);
  const { circles } = useSelector((state) => state.adashe);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!embeddedWallet) {
        setError("Wallet not connected");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        let historyData;
        if (circleId) {
          // If circleId is provided, get history for specific circle
          const { getAdasheCircleTransactionHistory } = await import(
            "../../services/blockchain/useAdasheHistory"
          );
          historyData = await getAdasheCircleTransactionHistory(
            embeddedWallet,
            circleId
          );
        } else {
          // Get all transaction history across all circles
          historyData = await getAllAdasheTransactionHistory(embeddedWallet);
        }

        setTransactions(historyData || []);
      } catch (err) {
        // Error fetching transaction history
        setError(err.message || "Failed to load transaction history");
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [embeddedWallet, circleId, circles]); // Re-fetch when circles update

  return (
    <div>
      <h2 className="text-[16px] font-semibold">Transaction History</h2>
      <p className="text-gray-600 text-[12px] mb-4">
        {circleId
          ? "All contributions and payouts for this group"
          : "All contributions and payouts across your Adashe circles"}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {!embeddedWallet ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Please connect your wallet to view transaction history
          </p>
        </div>
      ) : isLoading ? (
        <div className="rounded-lg shadow-sm border border-1">
          <div className="bg-gray-100 px-4 py-3">
            <div className="grid grid-cols-6 gap-4">
              {["Type", "User", "Address", "Week", "Date", "Amount"].map(
                (header, idx) => (
                  <div
                    key={idx}
                    className="text-xs font-medium text-gray-500 tracking-wider"
                  >
                    {header}
                  </div>
                )
              )}
            </div>
          </div>
          <div className="bg-white p-4">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-6 gap-4 py-3 border-b border-gray-200 last:border-b-0"
              >
                {[...Array(6)].map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className="animate-pulse h-4 bg-gray-200 rounded"
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <p className="text-gray-500">No transactions found</p>
          <p className="text-gray-400 text-sm mt-2">
            {circleId
              ? "This circle doesn't have any transactions yet"
              : "You haven't made any Adashe transactions yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-sm border border-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  Week
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          transaction.type === "payout"
                            ? "bg-green-100"
                            : "bg-green-200"
                        }`}
                      >
                        {transaction.type === "payout" ? (
                          <img
                            src="icons/money-send.svg"
                            alt="payout"
                            className="w-4 h-4"
                          />
                        ) : (
                          <img
                            src="/icons/adashe_green.svg"
                            alt="contribution"
                            className="w-4 h-4"
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-gray-900">
                        {transaction.type === "payout"
                          ? `Payout W-${transaction.week}`
                          : "Adashe"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src="/icons/user.svg"
                        alt="user"
                        className="w-4 h-4 rounded-full mr-2"
                      />
                      <span className="text-[10px] text-gray-900">
                        {transaction.user}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] text-gray-900">
                    {transaction.address}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] text-gray-900">
                    Week {transaction.week}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] text-gray-900">
                    {transaction.date}
                  </td>
                  <td
                    className={`px-4 py-4 whitespace-nowrap text-[10px] font-medium text-right ${
                      transaction.amount > 0
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : "-"}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
