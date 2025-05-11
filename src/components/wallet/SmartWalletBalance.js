"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAccount, usePublicClient } from "wagmi";
import {
  fetchTokenBalance,
  setWalletAddress,
} from "@/redux/slices/walletSlice";
import Card from "@/components/common/Card";
import { formatCurrency } from "@/utils/formatters";

const SmartWalletBalance = () => {
  const dispatch = useDispatch();
  const { address, isConnected } = useAccount();
  const client = usePublicClient();

  const { balance, isConnected: isWalletStoreConnected } = useSelector(
    (state) => state.wallet
  );

  // Update wallet address in store when connected
  useEffect(() => {
    if (address && isConnected) {
      dispatch(setWalletAddress(address));
    }
  }, [address, isConnected, dispatch]);

  // Fetch token balance when address is available
  useEffect(() => {
    if (address && client) {
      dispatch(fetchTokenBalance({ address, client }));

      // Set up interval to refresh balance every minute
      const intervalId = setInterval(() => {
        dispatch(fetchTokenBalance({ address, client }));
      }, 60000);

      return () => clearInterval(intervalId);
    }
  }, [address, client, dispatch]);

  if (!isConnected) {
    return null; // Don't render if wallet not connected
  }

  return (
    <Card className="bg-white mb-6">
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Smart Wallet Balance</h3>

        <div className="flex items-center mb-3">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.5l-1.8-1.8A2 2 0 0012.2 2H7.8a2 2 0 00-1.4.6L4.5 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-600">On-Chain Balance</div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">
                {formatCurrency(balance.amount, balance.currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          <div className="mb-1">Connected to Base Sepolia</div>
          <div className="flex items-center">
            <span>Wallet:</span>
            <span className="ml-1 text-gray-700 truncate">{address}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SmartWalletBalance;
