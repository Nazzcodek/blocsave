import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";
import { fetchAdasheData, viewCircleDetail } from "../../redux/slices/adasheSlice";

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
    selectedCircleId
  } = useSelector((state) => state.adashe || {});

  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAdasheData());
  }, [dispatch]);

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

        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-red-600">Error loading Adashe data: {error}</p>
          </div>
        )}

        {showJoinModal && (
          <JoinGroupModal
            onClose={() => setShowJoinModal(false)}
            onSubmit={(inviteCode) => {
              console.log("Joining group with code:", inviteCode);
              setShowJoinModal(false);
              // Add your group joining logic here
            }}
          />
        )}
      </div>
    </>
  );
};

export default Adashe;
