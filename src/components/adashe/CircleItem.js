import React from "react";
import { useDispatch } from "react-redux";
import { contributeToCircle } from "../../redux/slices/adasheSlice";

const CircleItem = ({ circle = {}, onViewDetails }) => {
  const dispatch = useDispatch();

  const {
    id = "circle-1",
    name = "Jesusboyz",
    weeklyAmount = 100,
    memberCount = 5,
    totalMembers = 5,
    totalRounds = 5,
    currentRound = 1,
    isActive = true,
  } = circle;

  const handleContribute = () => {
    dispatch(
      contributeToCircle({
        circleId: id,
        amount: weeklyAmount,
      })
    );
  };

  const handleViewDetails = () => {
    onViewDetails(id);
  };

  // Determine if the circle has enough members to be considered "ready"
  const isCircleReady = memberCount >= totalMembers;

  return (
    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
      <div className="flex flex-row items-start justify-between">
        {/* Left side - Circle info */}
        <div className="flex-1">
          <div className="flex items-center">
            <div className="w-5 h-5 flex items-center justify-center text-teal-500 mr-2">
              <img
                src="/icons/profile-2user.svg"
                alt="Group Icon"
                className="w-4 h-4"
              />
            </div>
            <p className="font-medium text-sm">{name}</p>
            {isActive && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ${weeklyAmount} Weekly • {memberCount} members
          </p>
        </div>

        {/* Right side - Column layout on mobile with Round info above button */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0">
          <div className="text-center sm:mr-2">
            <p className="text-xs text-gray-500">Round</p>
            <p className="font-medium text-sm">
              {currentRound} of {totalRounds}
            </p>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleContribute}
              className={`flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md mr-2 ${
                isCircleReady
                  ? "bg-[#079669] text-white hover:bg-green-600"
                  : "bg-gray-200 border border-gray-200 text-gray-500"
              }`}
            >
              <img
                src="/icons/wallet-white.svg"
                alt="Contribute"
                className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500"
              />
              Contribute
            </button>
            <button
              onClick={handleViewDetails}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
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
                className="w-4 h-4 text-gray-500"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleItem;
