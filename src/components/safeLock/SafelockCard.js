import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useWallets } from "@privy-io/react-auth";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { breakSafelock } from "../../redux/slices/safelockSlice";
import { openModal } from "@/redux/slices/modalSlice";
import { getLockedProgress } from "../../services/blockchain/useSafeLockHistory";

const SafelockCard = ({ safelock, safeLockAddress, index, status }) => {
  const dispatch = useDispatch();
  const { wallets } = useWallets();
  const [progressData, setProgressData] = useState({
    daysPassed: 0,
    totalDays: 30,
    daysRemaining: 30,
    loading: true,
    error: null,
  });

  // Format data from blockchain
  const {
    amount = 0,
    date = new Date(),
    daysPassed = 0,
    lockPeriod = 30,
    withdrawn = false,
  } = safelock;

  // Calculate derived values
  const createdOn = date instanceof Date ? date : new Date(date * 1000);

  // Use the progress data from blockchain, fallback to redux data
  const { daysPassed: progressDays, totalDays: progressTotal } = progressData;

  // Convert lock period to days if it's a large timestamp in seconds
  const lockPeriodInDays =
    progressTotal ||
    (lockPeriod > 1000 ? Math.round(lockPeriod / (24 * 60 * 60)) : lockPeriod);

  const maturityDate = new Date(
    createdOn.getTime() + lockPeriodInDays * 24 * 60 * 60 * 1000
  );
  // For completed safelocks, set the completion date
  const completedOn = status === "paid" ? new Date(safelock.date) : null;
  const interestRate = 6; // This is hardcoded based on business rules, could be calculated
  const expectedReturn =
    ((amount * interestRate) / 100) * (lockPeriodInDays / 30);
  const payoutAmount = amount + expectedReturn;

  // Get embedded wallet
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  // Fetch accurate lock progress data from blockchain
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!embeddedWallet || !safeLockAddress || index === undefined) {
        setProgressData((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const progress = await getLockedProgress(
          embeddedWallet,
          safeLockAddress,
          index
        );
        setProgressData({
          ...progress,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching lock progress:", error);
        setProgressData({
          daysPassed: 0,
          totalDays: lockPeriod || 30,
          daysRemaining: lockPeriod || 30,
          loading: false,
          error: error.message,
        });
      }
    };

    fetchProgressData();
  }, [embeddedWallet, safeLockAddress, index, lockPeriod]);

  const handleBreakSafelock = () => {
    if (!embeddedWallet) {
      dispatch(
        openModal({
          modalType: "INFO_MODAL",
          modalProps: {
            title: "Wallet Not Connected",
            message:
              "Please connect your wallet to withdraw your safelock funds.",
          },
        })
      );
      return;
    }

    if (status === "completed") {
      if (
        confirm("Are you sure you want to withdraw this completed safelock?")
      ) {
        dispatch(
          breakSafelock({
            embeddedWallet,
            safeLockAddress,
            index,
          })
        );
      }
    } else if (status === "active") {
      if (
        confirm(
          "Are you sure you want to break this safelock early? You may lose some interest."
        )
      ) {
        dispatch(
          breakSafelock({
            embeddedWallet,
            safeLockAddress,
            index,
          })
        );
      }
    }
  };

  // Calculate progress percentage
  // Always show 100% for paid status, and ensure we don't exceed 100%
  const progressPercentage =
    status === "paid"
      ? 100
      : Math.min(100, Math.round((progressDays / progressTotal) * 100));

  const getStatusBadge = () => {
    if (status === "active") {
      return (
        <span className="bg-[#e6f7f1] text-[#079669] px-2 py-1 text-xs rounded-md">
          Active
        </span>
      );
    } else if (status === "completed") {
      return (
        <span className="bg-[#e6f7f1] text-[#079669] px-2 py-1 text-xs rounded-md">
          Completed
        </span>
      );
    } else {
      return (
        <span className="bg-[#fdebeb] text-[#ff3b30] px-2 py-1 text-xs rounded-md">
          Paid
        </span>
      );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white">
      {/* Header section */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-bold">${amount.toFixed(2)}</span>
          {getStatusBadge()}
        </div>
        <button
          className={`flex items-center justify-center rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm ${
            status === "completed"
              ? "bg-[#079669] text-white"
              : "bg-gray-100 text-gray-800"
          } disabled:opacity-70`}
          disabled={status !== "completed"}
          onClick={status === "completed" ? handleBreakSafelock : undefined}
        >
          {status === "completed" ? (
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
      </div>

      {/* Created on with days */}
      <div className="flex items-center text-xs text-[#079669] mb-4">
        <img
          src="icons/lock_green.svg"
          alt="Calendar"
          className="w-4 h-4 mr-2 text-[#079669]"
        />
        Created on {formatDate(createdOn)}
        <span className="ml-2 bg-[#e6f7f1] text-[#079669] text-xs px-2 py-0.5 rounded-md">
          {progressTotal} {progressTotal === 1 ? "Day" : "Days"}
        </span>
      </div>

      {/* Left-right paired values */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Interest rate</span>
          <span className="font-medium">{interestRate}%</span>
        </div>

        {status === "active" ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Expected return</span>
              <span className="font-medium text-[#079669]">
                {formatCurrency(expectedReturn)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Maturity date</span>
              <span className="font-medium">{formatDate(maturityDate)}</span>
            </div>
          </>
        ) : status === "completed" ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Expected return</span>
              <span className="font-medium text-[#079669]">
                {formatCurrency(expectedReturn)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Maturity date</span>
              <span className="font-medium">{formatDate(maturityDate)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Payout Amount</span>
              <span className="font-medium text-[#ff3b30]">
                {formatCurrency(payoutAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Completed on</span>
              <span className="font-medium">
                {formatDate(completedOn || maturityDate)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between mb-1 text-xs">
          <span>Progress</span>
          {progressData.loading ? (
            <span>Loading progress data...</span>
          ) : progressData.error ? (
            <span>Error loading progress</span>
          ) : (
            <span>
              {progressDays} {progressDays === 1 ? "day" : "days"} of{" "}
              {progressTotal} {progressTotal === 1 ? "day" : "days"} (
              {progressPercentage}%)
            </span>
          )}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          {progressData.loading ? (
            <div
              className="bg-gray-300 h-1.5 rounded-full animate-pulse"
              style={{ width: "100%" }}
            ></div>
          ) : (
            <div
              className="bg-[#079669] h-1.5 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafelockCard;
