import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWallets } from "@privy-io/react-auth";
import { getWithdrawalHistory } from "@/services/blockchain/useSafeLockHistory";
import SafelockCard from "./SafelockCard";

const CompletedSafelocks = () => {
  // Keep Redux state as a fallback
  const reduxState = useSelector((state) => state.safelock) || {};

  // Create local state for blockchain data
  const [completedSafelocksData, setCompletedSafelocksData] = useState({
    completedSafelocks: reduxState.completedSafelocks || [],
    isLoading: true,
    error: null,
  });

  const { wallets } = useWallets();

  // Get embedded wallet
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  // Fetch completed safelock data directly from blockchain when component mounts or when wallet changes
  useEffect(() => {
    const fetchCompletedSafelocks = async () => {
      if (!embeddedWallet) {
        setCompletedSafelocksData((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Get withdrawal history from blockchain
        const completedSafelocks = await getWithdrawalHistory(embeddedWallet);

        setCompletedSafelocksData({
          completedSafelocks,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching completed safelocks:", error);
        setCompletedSafelocksData({
          completedSafelocks: [],
          isLoading: false,
          error: error.message || "Failed to fetch completed safelocks",
        });
      }
    };

    fetchCompletedSafelocks();
  }, [embeddedWallet]);

  // Destructure values from local state
  const { completedSafelocks, isLoading, error } = completedSafelocksData;

  // If no wallet is connected, show connect wallet message
  if (!embeddedWallet) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Wallet Not Connected
        </h3>
        <p className="text-gray-500">
          Connect your wallet to view your completed safelocks.
        </p>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-base font-medium text-gray-800 mb-4">
          Completed SafeLocks
        </h3>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#079669]"></div>
          </div>
          <p className="text-gray-500 mt-2">Loading completed SafeLocks...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mt-8">
        <h3 className="text-base font-medium text-gray-800 mb-4">
          Completed SafeLocks
        </h3>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">
            Error Loading SafeLocks
          </h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!completedSafelocks || completedSafelocks.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-base font-medium text-gray-800 mb-4">
          Completed SafeLocks
        </h3>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Completed Safelocks
          </h3>
          <p className="text-gray-500">
            Your completed safelocks will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-base font-medium text-gray-800 mb-4">
        Completed SafeLocks
      </h3>
      <div className="space-y-4">
        {completedSafelocks.map((safelock, index) => (
          <SafelockCard
            key={safelock.id || `completed-safelock-${index}`}
            safelock={safelock}
            safeLockAddress={safelock.safeLockAddress}
            index={index}
            status={safelock.withdrawn ? "paid" : "completed"}
          />
        ))}
      </div>
    </div>
  );
};

export default CompletedSafelocks;
