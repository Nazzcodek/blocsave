import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import { fetchWalletTransactions } from "@/services/blockchain/useWalletTransactions";
import { formatDate } from "@/utils/formatters";

const ActivityTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { wallets } = useWallets();
  const { recentActivities = [] } = useSelector((state) => state.activity);

  // Fetch wallet transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);

      try {
        const embeddedWallet = wallets?.find(
          (wallet) => wallet.walletClientType === "privy"
        );

        if (embeddedWallet) {
          const walletTx = await fetchWalletTransactions(embeddedWallet);
          setTransactions(walletTx);
        }
      } catch (error) {
        console.error("Error fetching wallet transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();

    // Refresh every 30 seconds
    const intervalId = setInterval(fetchTransactions, 30000);
    return () => clearInterval(intervalId);
  }, [wallets]);

  // Combine blockchain transactions with other activity data
  // We prioritize blockchain data as it's the source of truth
  const allActivities = [
    ...transactions,
    ...recentActivities.filter(
      (act) =>
        !transactions.some((tx) => tx.transactionId === act.transactionId)
    ),
  ];

  // Get icon path based on source type
  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case "quicksave":
      case "wallet":
        return "/icons/quicksave.svg";
      case "safelock":
        return "/icons/safelock.svg";
      case "adashe":
        return "/icons/adashe.svg";
      default:
        return "/icons/Chart_Pie.svg";
    }
  };

  // Format the date nicely
  const formatActivityDate = (dateObj) => {
    if (!dateObj) return "N/A";

    if (typeof dateObj === "string") {
      return dateObj;
    }

    try {
      return formatDate(dateObj);
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Mobile card view for each activity
  const ActivityCard = ({ activity }) => (
    <div className="border-b border-gray-200 py-4">
      <div className="flex items-center mb-3">
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
          <Image
            src={getSourceIcon(activity.from)}
            alt={activity.from || "Activity"}
            width={20}
            height={20}
          />
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-900">
            {activity.from} {activity.to ? `→ ${activity.to}` : ""}
          </div>
          <div className="text-xs text-gray-500">
            {formatActivityDate(activity.date)}
          </div>
        </div>
        <div className="ml-auto">
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              activity.status === "Completed" || !activity.status
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {activity.status || "Completed"}
          </span>
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <div className="text-gray-500 truncate max-w-[200px]">
          ID: {activity.transactionId}
        </div>
        <span
          className={
            activity.type === "withdraw" || activity.amount < 0
              ? "text-red-600 font-medium"
              : "text-green-600 font-medium"
          }
        >
          $
          {Math.abs(
            typeof activity.amount === "number" ? activity.amount : 0
          ).toFixed(2)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <h2 className="text-[18px] font-bold text-gray-900 mb-4">
        Recent Activity
      </h2>

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="animate-pulse space-y-4 p-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="border-b border-gray-200 py-4">
                <div className="flex items-center mb-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-3 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : allActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent activities to display
          </div>
        ) : (
          <>
            {/* Mobile view - card layout */}
            <div className="lg:hidden p-4">
              {allActivities.map((activity) => (
                <ActivityCard
                  key={activity.id || Math.random().toString(16)}
                  activity={activity}
                />
              ))}
            </div>

            {/* Desktop view - table layout */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allActivities.map((activity) => (
                    <tr key={activity.id || Math.random().toString(16)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                            <Image
                              src={getSourceIcon(activity.from)}
                              alt={activity.from || "Activity"}
                              width={20}
                              height={20}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.from}{" "}
                              {activity.to ? `→ ${activity.to}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[150px] truncate">
                        {activity.transactionId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatActivityDate(activity.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={
                            activity.type === "withdraw" || activity.amount < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          $
                          {Math.abs(
                            typeof activity.amount === "number"
                              ? activity.amount
                              : 0
                          ).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            activity.status === "Completed" || !activity.status
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {activity.status || "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityTable;
