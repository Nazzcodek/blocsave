import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { contributeToCircle } from "../../redux/slices/adasheSlice";
import { usePrivy, useWallets } from "@privy-io/react-auth";

const CircleItem = ({ circle = {}, onViewDetails }) => {
  const dispatch = useDispatch();
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { isContributing } = useSelector((state) => state.adashe || {});
  const [canContribute, setCanContribute] = useState(false);
  const [checkingContribution, setCheckingContribution] = useState(false);

  const {
    id = "circle-1",
    name = "Adashe Circle",
    weeklyAmount = 100,
    memberCount = 5,
    totalMembers = 5,
    totalRounds = 5,
    currentRound = 1,
    isActive = true,
    error = false,
  } = circle;

  // Ensure current round is at least 1 (never display as "0 of X")
  const displayCurrentRound = Math.max(1, currentRound);

  // Format the weekly amount to display properly (e.g., $100.00)
  const formattedWeeklyAmount =
    typeof weeklyAmount === "number"
      ? weeklyAmount.toFixed(2)
      : Number(weeklyAmount || 0).toFixed(2);

  // Check if user can contribute when component mounts or circle/wallet changes
  useEffect(() => {
    const checkContributionEligibility = async () => {
      if (!authenticated || !wallets || !id || error) {
        setCanContribute(false);
        return;
      }

      try {
        setCheckingContribution(true);

        // Simplified logic: User can contribute if circle has more than 1 member
        // This removes the complex canContribute check that was showing "already contributed this week"
        // when the user simply hadn't contributed yet
        setCanContribute(memberCount > 1);
      } catch (error) {
        // Failed to check contribution eligibility
        setCanContribute(false);
      } finally {
        setCheckingContribution(false);
      }
    };

    checkContributionEligibility();
  }, [authenticated, wallets, id, memberCount, currentRound, error]);

  const handleContribute = async () => {
    try {
      // Get the embedded wallet
      const embeddedWallet = wallets?.find(
        (wallet) => wallet.walletClientType === "privy"
      );

      if (!embeddedWallet) {
        // No embedded wallet found
        return;
      }

      dispatch(
        contributeToCircle({
          embeddedWallet,
          circleId: id,
          amount: parseFloat(weeklyAmount),
        })
      );
    } catch (error) {
      // Failed to contribute
    }
  };

  const handleViewDetails = () => {
    onViewDetails(id);
  };

  // Determine if the circle is ready for contributions
  const isCircleReady = memberCount > 1 && canContribute && !error;

  // Determine button state and messaging
  const getButtonState = () => {
    if (error)
      return { disabled: true, text: "Error", reason: "Circle has an error" };
    if (checkingContribution)
      return {
        disabled: true,
        text: "Checking...",
        reason: "Checking eligibility",
      };
    if (!authenticated)
      return {
        disabled: true,
        text: "Contribute",
        reason: "Please connect your wallet",
      };
    if (memberCount <= 1)
      return {
        disabled: true,
        text: "Contribute",
        reason: "Need more than 1 member",
      };
    if (!canContribute)
      return {
        disabled: true,
        text: "Contribute",
        reason: "Need more than 1 member",
      };
    if (isContributing)
      return {
        disabled: true,
        text: "Processing...",
        reason: "Transaction in progress",
      };
    return { disabled: false, text: "Contribute", reason: "" };
  };

  const buttonState = getButtonState();

  return (
    <div
      className={`border ${
        error ? "border-red-200 bg-red-50" : "border-gray-200"
      } rounded-lg p-3 sm:p-4`}
    >
      <div className="flex flex-row items-start justify-between">
        {/* Left side - Circle info */}
        <div className="flex-1">
          <div className="flex items-center">
            <div className="w-5 h-5 flex items-center justify-center text-teal-500 mr-2">
              <Image
                src="/icons/profile-2user.svg"
                alt="Group Icon"
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </div>
            <p className="font-medium text-sm">
              {error ? "Unavailable" : name}
            </p>
            {isActive && !error && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                Active
              </span>
            )}
            {error && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                Error
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ${formattedWeeklyAmount} Weekly • {memberCount} members
          </p>
        </div>

        {/* Right side - Column layout on mobile with Round info above button */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0">
          <div className="text-center sm:mr-2">
            <p className="text-xs text-gray-500">Round</p>
            <p className="font-medium text-sm">
              {displayCurrentRound} of {totalRounds}
            </p>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleContribute}
              disabled={buttonState.disabled}
              title={buttonState.reason}
              className={`flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md mr-2 transition-colors ${
                !buttonState.disabled
                  ? "bg-[#079669] text-white hover:bg-green-600"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {checkingContribution ? (
                <div className="flex items-center">
                  <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-gray-400 rounded-full mr-1"></div>
                  Checking...
                </div>
              ) : isContributing ? (
                <div className="flex items-center">
                  <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-white rounded-full mr-1"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <Image
                    src="/icons/wallet-white.svg"
                    alt="Contribute"
                    width={16}
                    height={16}
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                  />
                  {buttonState.text}
                </>
              )}
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
      {error && circle.errorMessage && (
        <p className="mt-2 text-xs text-red-600">{circle.errorMessage}</p>
      )}
    </div>
  );
};

export default CircleItem;
