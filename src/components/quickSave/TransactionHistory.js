import React, { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import ActivityTable from "./ActivityTable";
import { getAllTransactionHistory } from "@/services/blockchain/useQuickSaveHistory";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { wallets } = useWallets();

  useEffect(() => {
    async function fetchTransactionHistory() {
      setIsLoading(true);
      setError(null);

      try {
        const embeddedWallet = wallets?.find(
          (wallet) => wallet.walletClientType === "privy"
        );

        if (!embeddedWallet) {
          setTransactions([]);
          setError("Please connect your wallet to view transaction history.");
          return;
        }

        const history = await getAllTransactionHistory(embeddedWallet);
        setTransactions(history);
      } catch (err) {
        console.error("Error fetching transaction history:", err);
        setError(
          "Failed to fetch transaction history. Please try again later."
        );
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactionHistory();

    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchTransactionHistory();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [wallets]);

  return (
    <div className="mt-4">
      <h2 className="text-[18px] font-medium mb-4">Activity</h2>
      {error ? (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      ) : (
        <ActivityTable transactions={transactions} isLoading={isLoading} />
      )}
    </div>
  );
};

export default TransactionHistory;
