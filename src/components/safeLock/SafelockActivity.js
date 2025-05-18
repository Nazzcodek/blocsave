import React, { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { getAllTransactionHistory } from "../../services/blockchain/useSafeLockHistory";
import { formatCurrency, formatDate } from "../../utils/formatters";

const SafelockActivity = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { wallets } = useWallets();

  // Get embedded wallet
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  // Fetch transaction history directly from blockchain
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!embeddedWallet) {
        setIsLoading(false);
        return;
      }

      try {
        // Get all transactions from blockchain
        const fetchedTransactions = await getAllTransactionHistory(
          embeddedWallet
        );
        setTransactions(fetchedTransactions);
        setError(null);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        setError(error.message || "Failed to fetch transaction history");
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [embeddedWallet]);

  // If no wallet is connected
  if (!embeddedWallet) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Wallet Not Connected
        </h3>
        <p className="text-gray-500">
          Connect your wallet to view your transaction history.
        </p>
      </div>
    );
  }

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-red-600 mb-2">
          Error Loading Transactions
        </h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  // No transactions
  if (!transactions || transactions.length === 0) {
    return (
      <p className="text-gray-500 text-center py-3 sm:py-4 text-xs sm:text-sm">
        No transaction history available.
      </p>
    );
  }

  return (
    <div>
      <div className="mt-4">
        <h2 className="text-[18px] font-medium mb-4">Activity</h2>
      </div>
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
                            src="/icons/safelock.svg"
                            alt="SafeLock Icon"
                            className="w-4 h-4 sm:w-5 sm:h-5 text-[#079669]"
                          />
                        </div>
                        <span className="text-xs sm:text-sm">
                          {transaction.from || "SafeLock"}
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
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafelockActivity;
