import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { getAllAdasheTransactionHistory } from "../../services/blockchain/useAdasheHistory";
import Image from "next/image";

const TransactionHistory = ({ circleId = null }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { embeddedWallet } = useSelector((state) => state.auth);
  const { circles } = useSelector((state) => state.adashe);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      // If viewing group history, do NOT require wallet connection
      if (!circleId && !embeddedWallet) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        let historyData = [];
        if (circleId) {
          // For a group, fetch all contributions and withdrawals from the contract
          const { getAdasheGroupTransactionEvents } = await import(
            "../../services/blockchain/useAdasheHistory"
          );
          historyData = await getAdasheGroupTransactionEvents(
            embeddedWallet, // can be null/undefined for group
            circleId
          );
        } else {
          // For all user's circles, fetch all transactions (contributions and withdrawals)
          const { getAllAdasheTransactionHistory } = await import(
            "../../services/blockchain/useAdasheHistory"
          );
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

  // Harmonize week numbering: blockchain week 0 is user week 1
  const getUserWeek = (blockchainWeek) => {
    if (typeof blockchainWeek !== "number" || isNaN(blockchainWeek))
      return null;
    return blockchainWeek + 1;
  };

  // Memoize transactions with fallback/formatting for on-chain event data
  const formattedTransactions = useMemo(() => {
    return transactions.map((tx) => {
      // Fallbacks for on-chain event data
      let week = tx.week;
      if (typeof week === "number" && !isNaN(week)) {
        week = getUserWeek(week);
      }
      if (!week && tx.type === "contribution" && tx.txHash) week = "-";
      if (!week && tx.type === "payout" && tx.txHash) week = "-";
      let address = tx.address || tx.user || "-";
      // Format date
      let date = tx.date;
      if (date instanceof Date) {
        date = date.toLocaleString();
      } else if (typeof date === "number") {
        date = new Date(date * 1000).toLocaleString();
      } else if (typeof date === "string" && !isNaN(Number(date))) {
        date = new Date(Number(date) * 1000).toLocaleString();
      }
      // Format amount
      let amount = tx.amount;
      if (typeof amount === "string") amount = Number(amount);
      // Normalize type for display
      let displayType = tx.type;
      if (displayType === "contribution") displayType = "Contribute";
      if (displayType === "payout" || displayType === "withdrawal" || displayType === "withdraw") displayType = "Withdraw";
      return {
        ...tx,
        week,
        address,
        date,
        amount,
        displayType,
      };
    });
  }, [transactions]);

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

      {/* Only show wallet connect message if viewing personal history */}
      {!circleId && !embeddedWallet ? (
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
              {formattedTransactions.map((transaction) => (
                <tr key={transaction.id || transaction.txHash}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          transaction.displayType === "Withdraw"
                            ? "bg-green-100"
                            : "bg-green-200"
                        }`}
                      >
                        {transaction.displayType === "Withdraw" ? (
                          <Image
                            src="icons/money-send.svg"
                            alt="withdraw"
                            className="w-4 h-4"
                            width={16}
                            height={16}
                          />
                        ) : (
                          <Image
                            src="/icons/adashe_green.svg"
                            alt="contribution"
                            className="w-4 h-4"
                            width={16}
                            height={16}
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-gray-900">
                        {transaction.displayType}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Image
                        src="/icons/user.svg"
                        alt="user"
                        className="w-4 h-4 rounded-full mr-2"
                        width={16}
                        height={16}
                      />
                      <span className="text-[10px] text-gray-900">
                        {transaction.user || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] text-gray-900">
                    {transaction.address}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] text-gray-900">
                    {transaction.week || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] text-gray-900">
                    {transaction.date || "-"}
                  </td>
                  <td
                    className={`px-4 py-4 whitespace-nowrap text-[10px] font-medium text-right ${
                      transaction.amount > 0
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
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
