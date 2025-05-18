import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { formatCurrency } from "../../utils/formatters";
import { getSafelockSummary } from "../../services/blockchain/useSafeLockHistory";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";

const SafelockSummary = () => {
  // Keep Redux state as a fallback
  const safelockReduxState = useSelector((state) => state.safelock) || {};

  // Create local state for blockchain data
  const [summaryData, setSummaryData] = useState({
    totalBalance: safelockReduxState.totalBalance || 0,
    activeLocks: safelockReduxState.activeLocks || 0,
    isLoading: true,
    error: null,
  });

  const { authenticated, ready } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    const fetchSafelockData = async () => {
      try {
        // Only fetch if user is authenticated and wallets are available
        if (authenticated && ready && wallets && wallets.length > 0) {
          // Find the embedded wallet from Privy
          const embeddedWallet = wallets.find(
            (wallet) => wallet.walletClientType === "privy"
          );

          if (embeddedWallet) {
            // Fetch data from blockchain
            const summary = await getSafelockSummary(embeddedWallet);
            setSummaryData(summary);
          } else {
            setSummaryData((prev) => ({ ...prev, isLoading: false }));
          }
        } else {
          // If not authenticated, stop loading but keep using redux data
          setSummaryData((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error fetching safelock data:", error);
        setSummaryData((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
      }
    };

    fetchSafelockData();
  }, [authenticated, ready, wallets]);

  // Use blockchain data or fallback to Redux
  const totalBalance = summaryData.totalBalance;
  const activeLocks = summaryData.activeLocks;
  const isLoading = summaryData.isLoading;

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
