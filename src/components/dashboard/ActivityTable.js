import React from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Card from "@/components/common/Card";

const ActivityTable = () => {
  const { recentActivities = [] } = useSelector((state) => state.activity);

  // Get icon path based on source type
  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case "quicksave":
        return "/icons/quicksave.svg";
      case "safelock":
        return "/icons/safelock.svg";
      case "adashe":
        return "/icons/adashe.svg";
      default:
        return "/icons/Chart_Pie.svg";
    }
  };

  // Get icon color based on source type
  const getSourceColor = (source) => {
    switch (source?.toLowerCase()) {
      case "quicksave":
        return "#0066FF";
      case "safelock":
        return "#079669";
      case "adashe":
        return "#6C63FF";
      default:
        return "#6B7280";
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
            {activity.from}
          </div>
          <div className="text-xs text-gray-500">{activity.date}</div>
        </div>
        <div className="ml-auto">
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              activity.status === "Completed"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {activity.status}
          </span>
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <div className="text-gray-500">ID: {activity.transactionId}</div>
        <span
          className={
            activity.amount < 0
              ? "text-red-600 font-medium"
              : "text-green-600 font-medium"
          }
        >
          ${Math.abs(activity.amount).toFixed(2)}
        </span>
      </div>
    </div>
  );

  return (
    <Card className="bg-white">
      <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
      {recentActivities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No recent activities to display
        </div>
      ) : (
        <>
          {/* Mobile view - card layout */}
          <div className="lg:hidden">
            {recentActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>

          {/* Desktop view - table layout */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <tr key={activity.id}>
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
                            {activity.from}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.transactionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={
                          activity.amount < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        ${Math.abs(activity.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          activity.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
};

export default ActivityTable;
