import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import Layout from "@/components/common/Layout";
import QuicksaveCard from "../../components/quickSave/QuicksaveCard";
import TransactionHistory from "../../components/quickSave/TransactionHistory";
import QuicksaveForm from "../../components/quickSave/QuicksaveForm";
import TabSelector from "../../components/quickSave/TabSelector";
import SuccessNotification from "../../components/quickSave/SuccessNotification";
import { useWallets, usePrivy } from "@privy-io/react-auth";
import {
  fetchQuicksaveBalance,
  fetchWalletBalance,
  clearMessages,
} from "../../redux/slices/quicksaveSlice";

const QuicksavePage = () => {
  const dispatch = useDispatch();
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { balance, isLoading, error, success } = useSelector(
    (state) => state.quicksave
  );

  const embeddedWallet = wallets?.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  useEffect(() => {
    // Clear any previous error/success messages
    dispatch(clearMessages());

    // Fetch wallet balances
    dispatch(fetchQuicksaveBalance());
    dispatch(fetchWalletBalance());

    // Set up a refresh interval
    const intervalId = setInterval(() => {
      dispatch(fetchQuicksaveBalance());
      dispatch(fetchWalletBalance());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Clear success messages after 5 seconds
  useEffect(() => {
    let timeoutId;
    if (success) {
      timeoutId = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [success, dispatch]);

  if (isLoading && !balance) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Quicksave | Blocsave App</title>
      </Head>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quicksave</h1>
          <p className="text-gray-500 mt-0.2">
            Flexible savings with instant access
          </p>
        </div>

        <QuicksaveCard balance={balance} isLoading={isLoading} />

        <TabSelector />

        {!authenticated || !embeddedWallet ? (
          <div className="bg-yellow-50 p-4 rounded-md mb-4">
            <p className="text-yellow-700">
              Please connect your wallet to use QuickSave features.
            </p>
          </div>
        ) : (
          <QuicksaveForm balance={balance} />
        )}

        <TransactionHistory />

        {/* Success notification */}
        {success && <SuccessNotification message={success} />}
      </div>
    </>
  );
};

export default QuicksavePage;
