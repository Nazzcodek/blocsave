import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import CircleItem from "./CircleItem";
import { fetchAdasheData } from "../../redux/slices/adasheSlice";
import { usePrivy, useWallets } from "@privy-io/react-auth";

const ManageCircles = ({ onViewDetails }) => {
  const { circles, isLoading, error } = useSelector((state) => state.adashe);
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const dispatch = useDispatch();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadCircles = async () => {
      if (authenticated) {
        try {
          const embeddedWallet = wallets?.find(
            (wallet) => wallet.walletClientType === "privy"
          );
          if (embeddedWallet) {
            await dispatch(fetchAdasheData({ embeddedWallet }));
          }
        } catch (error) {
          console.error("Failed to load circles:", error);
        } finally {
          setIsInitialLoad(false);
        }
      } else {
        setIsInitialLoad(false);
      }
    };

    loadCircles();
  }, [authenticated, dispatch, wallets]);

  if (!authenticated) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">
          Please connect your wallet to view your Adashe circles
        </p>
      </div>
    );
  }

  if (isLoading && isInitialLoad) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#079669]"></div>
        </div>
        <p>Loading your circles from the blockchain...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Active Adashe</h2>
      {circles && circles.length > 0 ? (
        <div className="space-y-3">
          {circles.map((circle) => (
            <CircleItem
              key={circle.id}
              circle={circle}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No active Adashe groups found</p>
        </div>
      )}
    </div>
  );
};

export default ManageCircles;
