import React from "react";
import { useSelector } from "react-redux";

const BalanceCard = () => {
  const { balance, circles, isLoading } = useSelector((state) => state.adashe);

  // Calculate active circles and total expected payouts
  const activeCirclesData = circles.filter((circle) => {
    // A circle is considered active if:
    // - It has members
    // - Current round is less than or equal to total rounds (not completed)
    // - Circle is marked as active
    return (
      circle.members &&
      circle.members.length > 0 &&
      circle.currentRound <= circle.totalRounds &&
      circle.isActive === true &&
      circle.memberCount > 0
    );
  });

  const activeCircles = activeCirclesData.length;

  // Calculate total amount user will receive from all active circles
  const totalExpectedPayout = activeCirclesData.reduce((total, circle) => {
    // In Adashe, each member receives: (number of members) × (weekly contribution amount)
    // This is the total pool when it's their turn
    const membersCount = circle.memberCount || circle.totalMembers || 0;
    const weeklyContribution = circle.weeklyAmount || 0;
    const circlePayout = membersCount * weeklyContribution;

    return total + circlePayout;
  }, 0);

  return (
    <div className="bg-[#D1FAE5] rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2 pl-2">
        <div className="bg-[#0796691a] rounded-full p-2">
          <img
            src="/icons/adashe_green.svg"
            alt="Adashe"
            className="w-5 h-5 text-[#079669]"
          />
        </div>
        <span className="font-medium text-[#079669]">Adashe</span>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold">
              ${(totalExpectedPayout || 0).toFixed(2)}
            </h2>
            <p className="text-sm text-gray-500">
              {activeCircles} Active Circle{activeCircles !== 1 ? "s" : ""} •
              Expected Payout
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default BalanceCard;
