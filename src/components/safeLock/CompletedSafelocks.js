import React from "react";
import { useSelector } from "react-redux";
import SafelockCard from "./SafelockCard";

const CompletedSafelocks = () => {
  const safelockState = useSelector((state) => state.safelock) || {};

  // Demo data for completed safelocks
  const demoCompletedSafelocks = [
    {
      id: "c1",
      amount: 100.84,
      interestRate: 6,
      createdOn: new Date("2025-03-29").toISOString(),
      maturityDate: new Date("2025-04-28").toISOString(),
      completedOn: null,
      expectedReturn: 120.0,
      payoutAmount: null,
      progressDays: 30,
      progressTotal: 30,
      status: "completed",
    },
    {
      id: "c2",
      amount: 100.84,
      interestRate: 6,
      createdOn: new Date("2025-04-29").toISOString(),
      completedOn: new Date("2025-06-28").toISOString(),
      maturityDate: new Date("2025-06-28").toISOString(),
      expectedReturn: 120.0,
      payoutAmount: 120.0,
      progressDays: 30,
      progressTotal: 30,
      status: "paid",
    },
  ];

  // Use demo data instead of actual data from store for demonstration
  const completedSafelocks = demoCompletedSafelocks;

  if (completedSafelocks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No Completed Safelocks
        </h3>
        <p className="text-gray-500">
          Your completed safelocks will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-base font-medium text-gray-800 mb-4">
        Completed SafeLocks
      </h3>
      <div className="space-y-4">
        {completedSafelocks.map((safelock) => (
          <SafelockCard
            key={safelock.id}
            safelock={safelock}
            status={safelock.status || "completed"}
          />
        ))}
      </div>
    </div>
  );
};

export default CompletedSafelocks;
