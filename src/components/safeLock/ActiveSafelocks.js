import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useWallets } from "@privy-io/react-auth";
import { fetchSafelockData } from "@/redux/slices/safelockSlice";
import SafelockCard from "./SafelockCard";

const ActiveSafelocks = () => {
  const dispatch = useDispatch();
  const { wallets } = useWallets();
  const { activeSafelocks, isLoading, error } =
    useSelector((state) => state.safelock) || {};

  // Get embedded wallet
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  // Fetch safelock data when component mounts or when wallet changes
  useEffect(() => {
    if (embeddedWallet) {
      dispatch(fetchSafelockData(embeddedWallet));
    }
  }, [dispatch, embeddedWallet]);

  // If no wallet is connected, show connect wallet message
  if (!embeddedWallet) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Wallet Not Connected
        </h3>
        <p className="text-gray-500">
          Connect your wallet to view your active safelocks.
        </p>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#079669]"></div>
        </div>
        <p className="text-gray-500 mt-2">Loading SafeLock data...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-red-600 mb-2">
          Error Loading SafeLocks
        </h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  // No active safelocks
  if (!activeSafelocks || activeSafelocks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No Active Safelocks
        </h3>
        <p className="text-gray-500">
          Create a new safelock to start earning interest on your savings.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-medium text-gray-800 mb-4">
        Active SafeLocks
      </h3>
      <div className="space-y-4">
        {activeSafelocks.map((safelock, index) => (
          <SafelockCard
            key={safelock.id || `safelock-${index}`}
            safelock={safelock}
            safeLockAddress={safelock.safeLockAddress}
            index={index}
            status="active"
          />
        ))}
      </div>
    </div>
  );
};

export default ActiveSafelocks;
