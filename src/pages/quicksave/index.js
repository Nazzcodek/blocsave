import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import Layout from "@/components/common/Layout";
import QuicksaveCard from "../../components/quickSave/QuicksaveCard";
import ActivityTable from "../../components/quickSave/ActivityTable";
import QuicksaveForm from "../../components/quickSave/QuicksaveForm";
import TabSelector from "../../components/quickSave/TabSelector";
import SuccessNotification from "../../components/quickSave/SuccessNotification";
import {
  fetchQuicksaveBalance,
  fetchQuicksaveTransactions,
  fetchWalletBalance,
} from "../../redux/slices/quicksaveSlice";

const QuicksavePage = () => {
  const dispatch = useDispatch();
  const { balance, transactions, isLoading, error, success } = useSelector(
    (state) => state.quicksave
  );

  useEffect(() => {
    // Fetch all required data on component mount
    dispatch(fetchQuicksaveBalance());
    dispatch(fetchQuicksaveTransactions());
    dispatch(fetchWalletBalance());
  }, [dispatch]);

  if (isLoading) {
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

        <QuicksaveForm balance={balance} />

        <div className="bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4 px-6 pt-6">Activity</h2>
          <ActivityTable transactions={transactions} isLoading={isLoading} />
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {/* Success notification */}
        {success && <SuccessNotification message={success} />}
      </div>
    </>
  );
};

export default QuicksavePage;
