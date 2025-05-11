import React from "react";
import { useDispatch } from "react-redux";
import { withdrawFromCircle } from "../../redux/slices/adasheSlice";

const PaymentSchedule = ({ circle }) => {
  const dispatch = useDispatch();

  if (!circle || !circle.paymentSchedule) return null;

  const handleWithdraw = (roundId) => {
    dispatch(withdrawFromCircle({ roundId }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full">
            Completed
          </span>
        );
      case "active":
        return (
          <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full">
            Active
          </span>
        );
      case "pending":
        return (
          <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full">
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getProgressBar = (contributions, totalMembers, status) => {
    const percentage = (contributions / totalMembers) * 100;

    let barColor = "bg-gray-300";
    if (status === "completed") barColor = "bg-[#079669]";
    else if (status === "active") barColor = "bg-[#079669]";

    return (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className={`${barColor} h-1 rounded-full`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-500">
            {contributions} of {totalMembers} contributed
          </span>
          <span className="text-xs text-gray-500">
            {Math.round(percentage)}% Complete
          </span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Payment Schedule</h2>
      <p className="text-gray-600 text-sm mb-4">
        The order and schedule of payouts for each member
      </p>

      <div className="space-y-4">
        {circle.paymentSchedule.map((round) => (
          <div
            key={round.round}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center">
                  <h3 className="text-[10px] font-medium">
                    Round {round.round}
                  </h3>
                  <div className="text-xs ml-2">
                    {getStatusBadge(round.status)}
                  </div>
                </div>
                <p className="text-[10px] text-gray-600">
                  Recipient: {round.recipient.name} (
                  {round.recipient.id.substring(0, 8)}...)
                </p>
              </div>

              {round.status === "active" && round.recipient.name === "You" && (
                <button
                  className={`flex items-center justify-center rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm ${
                    round.status === "completed"
                      ? "bg-[#079669] text-white"
                      : "bg-gray-100 text-gray-800"
                  } disabled:opacity-70`}
                  disabled={round.status !== "completed"}
                  onClick={
                    round.status === "completed"
                      ? handleBreakSafelock
                      : undefined
                  }
                >
                  {round.status === "completed" ? (
                    <img
                      src="icons/wallet-white.svg"
                      alt="Withdraw"
                      className="w-4 h-4 mr-2 text-gray-600"
                    />
                  ) : (
                    <img
                      src="icons/wallet-gray.svg"
                      alt="Withdraw"
                      className="w-4 h-4 mr-2 text-gray-600"
                    />
                  )}
                  Withdraw
                </button>
              )}
            </div>

            <div className="flex items-center text-[10px] text-gray-600 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {round.date}
            </div>

            {getProgressBar(
              round.contributions,
              circle.memberCount,
              round.status
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentSchedule;
