import React from "react";

const GroupSummary = ({ circle }) => {
  if (!circle) return null;

  const {
    name,
    weeklyAmount,
    memberCount,
    currentRound,
    totalRounds,
    nextContributionDate,
    totalContributionAmount,
    nextPayoutDate,
    cycleProgress,
    isActive = true,
  } = circle;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center">
                <img
                  src="/icons/profile-2user.svg"
                  alt="Group Icon"
                  className="w-5 h-5 mr-2"
                />
              </div>
              <h2 className="text-xl font-bold">{name}</h2>
              {isActive && (
                <span className="ml-12 px-2 py-0.5 bg-[#D1FAE5] text-[#079669] text-xs rounded-full">
                  Active
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Round</p>
              <p className="font-medium text-sm">
                {currentRound} of {totalRounds}
              </p>
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm">
              ${weeklyAmount} Weekly · {memberCount} members
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 flex items-center">
            <img
              src="/icons/next.svg"
              alt="Contribution Icon"
              className="w-3 h-3 mr-2"
            />
            <span className="text-[10px]">Next Contribution</span>
          </p>
          <p className="font-medium">{nextContributionDate}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 flex items-center">
            <img
              src="/icons/dollar-circle.svg"
              alt="Pool Icon"
              className="w-3 h-3 mr-2"
            />
            <span className="text-[10px]">Total Pool</span>
          </p>
          <p className="font-medium">${totalContributionAmount}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 flex items-center">
            <img
              src="/icons/dollar-circle.svg"
              alt="Payout Icon"
              className="w-3 h-3 mr-2"
            />
            <span className="text-[10px]">Next Payout</span>
          </p>
          <p className="font-medium">{nextPayoutDate}</p>
          <p className="text-[10px] text-gray-500">To: You</p>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-xs">Cycle Progress</span>
          <span className="text-xs text-gray-500">
            {cycleProgress}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-[#079669] h-1 rounded-full"
            style={{ width: `${cycleProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-xs font-medium mb-4">Group Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Start Date</p>
            <p className="text-sm">{circle.startDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">End Date</p>
            <p className="text-xs">{circle.endDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Your Position</p>
            <p className="text-xs">
              {currentRound} of {totalRounds}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Round Due Date</p>
            <p className="text-xs">10-05-2025</p>
          </div>
        </div>
      </div>

      <button className="w-full bg-[#079669] hover:bg-[#079669] text-white font-medium py-2 rounded-md mt-4 flex items-center justify-center">
        <img
          src="/icons/wallet-white.svg"
          alt="Contribute"
          className="w-5 h-5 mr-2"
        />
        Contribute
      </button>
    </div>
  );
};

export default GroupSummary;
