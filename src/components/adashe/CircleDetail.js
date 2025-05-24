import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  backFromDetail,
  fetchAdasheData,
  setDetailTabView,
  setActiveTab,
} from "../../redux/slices/adasheSlice";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import TabSelector from "./DetailTabSelector";
import CircleSummary from "./GroupSummary";
import InvitationCode from "./InvitationCode";
import PaymentSchedule from "./PaymentSchedule";
import TransactionHistory from "./TransactionHistory";

const CircleDetail = () => {
  const dispatch = useDispatch();
  const { circles, selectedCircleId, detailTabView, isLoading } = useSelector(
    (state) => state.adashe
  );
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Find the selected circle
  const selectedCircle = circles.find(
    (circle) => circle.id === selectedCircleId
  );

  // Fetch data if needed
  useEffect(() => {
    const loadData = async () => {
      if (
        (circles.length === 0 || !selectedCircle) &&
        !isLoading &&
        authenticated
      ) {
        try {
          const embeddedWallet = wallets?.find(
            (wallet) => wallet.walletClientType === "privy"
          );
          if (embeddedWallet) {
            dispatch(fetchAdasheData({ embeddedWallet }));
          }
        } catch (error) {
          console.error("Failed to fetch Adashe data:", error);
        }
      }
    };

    loadData();
  }, [
    dispatch,
    circles.length,
    isLoading,
    authenticated,
    wallets,
    selectedCircle,
  ]);

  // Function to manually refresh the data
  const handleRefresh = async () => {
    if (authenticated) {
      setIsRefreshing(true);
      try {
        const embeddedWallet = wallets?.find(
          (wallet) => wallet.walletClientType === "privy"
        );
        if (embeddedWallet) {
          await dispatch(fetchAdasheData({ embeddedWallet }));
        }
      } catch (error) {
        console.error("Failed to refresh Adashe data:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Mock circle data for preview when no circle is selected
  const mockCircle = {
    id: "mock-circle",
    name: "Demo Circle",
    weeklyAmount: 100,
    memberCount: 5,
    totalMembers: 5,
    totalRounds: 5,
    currentRound: 3,
    startDate: "01-05-2025",
    endDate: "31-05-2025",
    nextContributionDate: "17 May 2025",
    nextPayoutDate: "18 May 2025",
    totalContributionAmount: 500,
    cycleProgress: 40,
    invitationCode: "DemoCircle123",
    isActive: true,
    members: [
      {
        id: "0x1234_5678",
        name: "You",
        address: "0xd74f2835ddcbc1fcad1f4d...",
      },
      {
        id: "1x1234_5678",
        name: "Dave",
        address: "0xd74f2835ddcbc1fcad1f4d...",
      },
      {
        id: "2x1234_5678",
        name: "Danny",
        address: "0xd74f2835ddcbc1fcad1f4d...",
      },
      {
        id: "3x1234_5678",
        name: "Mic",
        address: "0xd74f2835ddcbc1fcad1f4d...",
      },
      {
        id: "4x1234_5678",
        name: "James",
        address: "0xd74f2835ddcbc1fcad1f4d...",
      },
    ],
    paymentSchedule: [
      {
        round: 1,
        recipient: { id: "3x1234_5678", name: "Mic" },
        date: "01-05-2025",
        contributions: 5,
        status: "completed",
      },
      {
        round: 2,
        recipient: { id: "4x1234_5678", name: "James" },
        date: "08-05-2025",
        contributions: 5,
        status: "completed",
      },
      {
        round: 3,
        recipient: { id: "0x1234_5678", name: "You" },
        date: "15-05-2025",
        contributions: 2,
        status: "active",
      },
      {
        round: 4,
        recipient: { id: "1x1234_5678", name: "Dave" },
        date: "22-05-2025",
        contributions: 0,
        status: "pending",
      },
      {
        round: 5,
        recipient: { id: "2x1234_5678", name: "Danny" },
        date: "29-05-2025",
        contributions: 0,
        status: "pending",
      },
    ],
  };

  // Use mock circle if no circle is selected
  const circleToDisplay = selectedCircle || mockCircle;

  // Handle back button click
  const handleBack = () => {
    dispatch(backFromDetail());
    dispatch(setActiveTab("manage"));
  };

  // Define tabs for the tab selector
  const detailTabs = [
    { id: "Schedule", label: "Payout Schedule" },
    { id: "Transaction", label: "Transaction" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-1">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="ml-1">Back</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || !authenticated}
          className={`flex items-center text-gray-600 ${
            isRefreshing || !authenticated
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          title={
            authenticated
              ? "Refresh blockchain data"
              : "Connect wallet to refresh"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${isRefreshing ? "animate-spin" : ""}`}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          <span className="ml-1">
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Group Detail</h1>

      {/* Top section with summary (2/3) and invitation code (1/3) side by side with equal height */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2 h-full">
          <CircleSummary circle={circleToDisplay} />
        </div>
        <div className="md:col-span-1 h-full">
          <InvitationCode circle={circleToDisplay} />
        </div>
      </div>

      {/* Full-width tabs section */}
      <TabSelector
        tabs={detailTabs}
        stateKey="adashe"
        setActiveTabAction={setDetailTabView}
        defaultActiveTab="Schedule"
      />

      {/* Apply proper container for mobile responsiveness */}
      <div className="w-full overflow-x-auto">
        {detailTabView === "Schedule" ? (
          <PaymentSchedule circle={circleToDisplay} />
        ) : (
          <TransactionHistory circleId={selectedCircleId} />
        )}
      </div>
    </div>
  );
};

export default CircleDetail;
