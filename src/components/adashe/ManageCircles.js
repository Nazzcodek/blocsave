import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import CircleItem from "./CircleItem";
import { fetchAdasheData } from "../../redux/slices/adasheSlice";
import { usePrivy, useWallets } from "@privy-io/react-auth";

const ManageCircles = ({ onViewDetails }) => {
  const { circles, isLoading, error, totalCount, currentPage, hasMorePages } =
    useSelector((state) => state.adashe);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const dispatch = useDispatch();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Function to load circles with pagination
  const loadCircles = useCallback(
    async (page = 1) => {
      if (authenticated) {
        try {
          const embeddedWallet = wallets?.find(
            (wallet) => wallet.walletClientType === "privy"
          );
          if (embeddedWallet) {
            const isLoadingFirstPage = page === 1;
            if (!isLoadingFirstPage) {
              setIsLoadingMore(true);
            }

            await dispatch(
              fetchAdasheData({
                embeddedWallet,
                page,
                limit: 5, // Show 5 circles per page
              })
            );

            if (!isLoadingFirstPage) {
              setIsLoadingMore(false);
            }
          }
        } catch (error) {
          setIsLoadingMore(false);
        } finally {
          setIsInitialLoad(false);
        }
      } else {
        setIsInitialLoad(false);
      }
    },
    [authenticated, dispatch, wallets]
  );

  // Load first page on component mount
  useEffect(() => {
    loadCircles(1);
  }, [loadCircles]);

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

  const handleLoadMore = () => {
    if (hasMorePages && !isLoadingMore) {
      loadCircles(currentPage + 1);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Active Adashe</h2>
      {circles && circles.length > 0 ? (
        <>
          <div className="space-y-3">
            {circles.map((circle) => (
              <CircleItem
                key={circle.id}
                circle={circle}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>

          {/* Pagination info */}
          <div className="pt-4 flex flex-col items-center">
            <div className="text-sm text-gray-500 mb-2">
              Showing {circles.length} of {totalCount} circles
            </div>

            {/* Pagination controls */}
            {hasMorePages && (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className={`px-4 py-2 rounded-md ${
                  isLoadingMore
                    ? "bg-gray-300 text-gray-500"
                    : "bg-[#079669] text-white hover:bg-[#067857]"
                } transition-colors`}
              >
                {isLoadingMore ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                    Loading more...
                  </div>
                ) : (
                  "Load More"
                )}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No active Adashe groups found</p>
        </div>
      )}
    </div>
  );
};

export default ManageCircles;
