import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import Layout from "@/components/common/Layout";
import TabSelector from "../../components/safeLock/TabSelector";
import SafelockSummary from "../../components/safeLock/SafelockSummary";
import CreateSafelock from "../../components/safeLock/CreateSafelock";
import ActiveSafelocks from "../../components/safeLock/ActiveSafelocks";
import CompletedSafelocks from "../../components/safeLock/CompletedSafelocks";
import SafelockActivity from "../../components/safeLock/SafelockActivity";
import {
  fetchSafelockData,
  setActiveTab,
} from "../../redux/slices/safelockSlice";

const SafelockPage = () => {
  const dispatch = useDispatch();
  const {
    activeTab = "create",
    isLoading = false,
    error = null,
  } = useSelector((state) => state.safelock || {});
  const [showActivity, setShowActivity] = useState(true);

  useEffect(() => {
    // Fetch data on component mount
    dispatch(fetchSafelockData());
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
        <title>Safelock | Blocsave App</title>
      </Head>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safelock</h1>
          <p className="text-gray-500 mt-0.2">
            Flexible savings with instant access
          </p>
        </div>

        <SafelockSummary />

        <div>
          <TabSelector
            tabs={[
              { id: "create", label: "Create New Safelock" },
              { id: "manage", label: "Manage Safelock" },
            ]}
            stateKey="safelock"
          />
        </div>

        {activeTab === "create" ? (
          <div className="space-y-8">
            <CreateSafelock setShowActivity={setShowActivity} />
            {showActivity && <SafelockActivity />}
          </div>
        ) : (
          <div className="space-y-8">
            <ActiveSafelocks />
            <CompletedSafelocks />
          </div>
        )}
        {/* Error notification */}
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default SafelockPage;
