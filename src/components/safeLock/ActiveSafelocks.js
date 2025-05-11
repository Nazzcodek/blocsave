import React from "react";
import { useSelector } from "react-redux";
import SafelockCard from "./SafelockCard";

const ActiveSafelocks = () => {
  const safelockState = useSelector((state) => state.safelock) || {};

  // Demo data for active safelocks
  const demoActiveSafelocks = [
    {
      id: "s1",
      amount: 100.84,
      interestRate: 6,
      createdOn: new Date("2025-04-29").toISOString(),
      maturityDate: new Date("2025-06-28").toISOString(),
      expectedReturn: 120.0,
      progressDays: 1,
      progressTotal: 30,
    },
  ];

  // Use demo data instead of actual data from store for demonstration
  const activeSafelocks = demoActiveSafelocks;

  if (activeSafelocks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No Active Safelocks
        </h3>
        <p className="text-gray-500">
          Create a new safelock to start earning interest on your savings.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-medium text-gray-800 mb-4">
        Active SafeLocks
      </h3>
      <div className="space-y-4">
        {activeSafelocks.map((safelock) => (
          <SafelockCard key={safelock.id} safelock={safelock} status="active" />
        ))}
      </div>
    </div>
  );
};

export default ActiveSafelocks;
