import React from "react";

const CircleSummary = ({
  memberCount,
  contributionAmount,
  totalPot,
  totalPeriods,
  frequency,
}) => {
  // Set unit label based on frequency
  const unitLabel = frequency === "Weekly" ? "Weeks" : "Months";
  const formattedFrequency =
    frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase();

  return (
    <div className="bg-green-50 p-4 rounded-md">
      <h3 className="font-medium text-gray-500 mb-2">Summary</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-black-600">Total Members</div>
        <div className="text-right font-medium">{memberCount}</div>

        <div className="text-black-600">{formattedFrequency} Contribution</div>
        <div className="text-right font-medium">${contributionAmount} each</div>

        <div className="text-black-600">Total Pot</div>
        <div className="text-right font-medium">${totalPot}</div>

        <div className="text-black-600">Duration</div>
        <div className="text-right font-medium">
          {totalPeriods} {unitLabel}
        </div>
      </div>
    </div>
  );
};

export default CircleSummary;
