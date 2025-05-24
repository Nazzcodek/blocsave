import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";
import {
  fetchAdasheData,
  viewCircleDetail,
} from "../../redux/slices/adasheSlice";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { diagnoseWalletConnection } from "../../utils/blockchainDiagnostics";

// Components
import BalanceCard from "../../components/adashe/BalanceCard";
import CreateCircleForm from "../../components/adashe/CreateCircle";
import ManageCircles from "../../components/adashe/ManageCircles";
import CircleDetailPage from "../../components/adashe/CircleDetail";
import TabSelector from "../../components/adashe/TabSelector";
import JoinGroupModal from "@/components/adashe/JoinGroupModal";

const Adashe = () => {
  const dispatch = useDispatch();
  const {
    isLoading,
    error,
    activeTab = "create",
    detailView,
    selectedCircleId,
  } = useSelector((state) => state.adashe || {});
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    try {
      const embeddedWallet = wallets?.find(
        (wallet) => wallet.walletClientType === "privy"
      );

      if (!embeddedWallet) {
        console.warn("No embedded wallet found for retry");
        return;
      }

      // Clear any existing errors by resetting Redux state
      await dispatch(
        fetchAdasheData({
          embeddedWallet,
          page: 1,
        })
      );

      console.log(`Retry attempt ${retryCount + 1} successful`);
    } catch (retryError) {
      console.error("Retry attempt failed:", retryError);
    } finally {
      setIsRetrying(false);
    }
  }, [dispatch, wallets, retryCount]);

  useEffect(() => {
    const loadAdasheData = async () => {
      if (authenticated) {
        try {
          const embeddedWallet = wallets?.find(
            (wallet) => wallet.walletClientType === "privy"
          );

          if (!embeddedWallet) {
            console.warn(
              "Embedded wallet not found in wallet list:",
              wallets?.map((w) => w.walletClientType)
            );
            return;
          }

          // Check wallet health before proceeding
          const diagnostics = await diagnoseWalletConnection(embeddedWallet);

          if (diagnostics.wallet.errors.length > 0) {
            console.warn(
              "Wallet diagnosis found issues:",
              diagnostics.wallet.errors
            );
            // Continue anyway as some errors might be non-fatal
          }

          if (embeddedWallet && diagnostics.wallet.providerAvailable) {
            // Fetch data with the wallet
            dispatch(fetchAdasheData({ embeddedWallet }));
          }
        } catch (error) {
          console.error("Failed to load Adashe data:", error);
        }
      }
    };

    loadAdasheData();
  }, [dispatch, authenticated, wallets]);

  const handleViewDetails = (circleId) => {
    dispatch(viewCircleDetail(circleId));
  };

  const handleJoinGroup = () => {
    setShowJoinModal(true);
  };

  useEffect(() => {
    if (
      error &&
      error.includes("missing revert data") &&
      retryCount === 0 &&
      !isRetrying &&
      authenticated &&
      wallets?.length > 0
    ) {
      const timer = setTimeout(() => {
        console.log("[Adashe] Auto-retrying after contract call exception");
        handleRetry();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [error, retryCount, isRetrying, authenticated, wallets, handleRetry]);

  // If viewing circle details, show ONLY the details page
  if (detailView && selectedCircleId) {
    return (
      <>
        <Head>
          <title>Circle Details | Blocsave App</title>
        </Head>

        <CircleDetailPage />
      </>
    );
  }

  // Otherwise show the normal Adashe page with tabs
  return (
    <>
      <Head>
        <title>Adashe | Blocsave App</title>
      </Head>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Adashe</h1>
            <p className="text-gray-500">Group savings powered by Crypto</p>
          </div>
          <button
            className="bg-white text-black px-4 py-2 rounded-md flex items-center border border-gray-300 hover:bg-gray-50"
            onClick={handleJoinGroup}
          >
            <img
              src="/icons/user-add.svg"
              alt="Join group"
              className="mr-2 w-6 h-6"
            />
            <span>Join group</span>
          </button>
        </div>

        <BalanceCard />
        <TabSelector />

        {activeTab === "create" ? (
          <CreateCircleForm />
        ) : (
          <ManageCircles onViewDetails={handleViewDetails} />
        )}

        {/* Only show errors that aren't related to authentication and provide solutions - with full width */}
        {error && authenticated && error !== "Wallet not connected" && (
          <div className="bg-red-50 p-4 rounded-md mb-4 flex w-full">
            <div className="flex-shrink-0 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="w-full">
              <p className="text-red-600 font-medium">
                {error.toLowerCase().includes("missing revert data")
                  ? "Error Accessing Adashe Contract"
                  : "Error Loading Adashe Data"}
              </p>
              <p className="text-red-500 text-sm mt-1">
                {error.toLowerCase().includes("missing revert data")
                  ? "Unable to access the contract method (getCurrentWeek)"
                  : error}
              </p>

              {/* Display specific solutions based on error type - with only ONE retry button */}
              <div className="mt-2 text-sm">
                {(error.toLowerCase().includes("missing revert data") ||
                  error.toLowerCase().includes("failed to fetch") ||
                  error.toLowerCase().includes("could not coalesce error") ||
                  error.toLowerCase().includes("unknown error")) && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="font-medium text-red-700 mb-1">
                      Possible causes:
                    </p>
                    <ul className="list-disc ml-5 text-red-600">
                      <li>Temporary network connection issue</li>
                      <li>The RPC provider is temporarily down</li>
                      <li>There are blockchain network connection issues</li>
                    </ul>
                    <p className="mt-2 text-red-700">
                      Please try the following:
                    </p>
                    <ul className="list-disc ml-5 text-red-600">
                      <li>Click the Retry button below</li>
                      <li>
                        Verify your wallet is connected to the correct network
                      </li>
                      <li>Check your internet connection</li>
                    </ul>

                    {/* SINGLE unified retry button */}
                    <div className="mt-3 flex justify-center">
                      <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className={`px-4 py-2 bg-red-600 text-white rounded-md flex items-center ${
                          isRetrying
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-red-700"
                        }`}
                      >
                        {isRetrying ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Retrying...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                            Retry Connection
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {error.toLowerCase().includes("contract") &&
                  !error.toLowerCase().includes("missing revert data") && (
                    <p className="text-red-500">
                      Try refreshing the page or reconnecting your wallet.
                    </p>
                  )}
                {error.toLowerCase().includes("wallet") && (
                  <button
                    onClick={() => window.location.reload()}
                    className="text-red-600 underline hover:text-red-800"
                  >
                    Refresh the page
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showJoinModal && (
          <JoinGroupModal
            onClose={() => setShowJoinModal(false)}
            // Blockchain join will be handled inside the modal component
            onSubmit={(inviteCode) => {
              setShowJoinModal(false);
            }}
          />
        )}

        {!authenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
            <p className="text-blue-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Please connect your wallet to create or manage Adashe circles
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Adashe;
