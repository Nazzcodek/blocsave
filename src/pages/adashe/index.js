import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";
import {
  fetchAdasheData,
  viewCircleDetail,
} from "../../redux/slices/adasheSlice";
import { usePrivy, useWallets } from "@privy-io/react-auth";

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

  useEffect(() => {
    const loadAdasheData = async () => {
      if (authenticated) {
        try {
          // Find the embedded wallet with better error handling
          const embeddedWallet = wallets?.find(
            (wallet) => wallet.walletClientType === "privy"
          );

          if (!embeddedWallet) {
            console.warn(
              "Embedded wallet not found in wallet list:",
              wallets?.map((w) => w.walletClientType)
            );
            return; // Don't try to load data without a wallet
          }

          // Import the diagnostics utility
          const { diagnoseWalletConnection } = await import(
            "../../utils/blockchainDiagnostics"
          );

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

        {/* Only show errors that aren't related to authentication and provide solutions */}
        {error && authenticated && error !== "Wallet not connected" && (
          <div className="bg-red-50 p-4 rounded-md mb-4 flex">
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
            <div>
              <p className="text-red-600 font-medium">
                Error loading Adashe data
              </p>
              <p className="text-red-500 text-sm mt-1">{error}</p>

              {/* Display specific solutions based on error type */}
              <div className="mt-2 text-sm">
                {error.toLowerCase().includes("contract") && (
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
