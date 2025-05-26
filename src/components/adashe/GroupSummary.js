import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { contributeToCircle } from "../../redux/slices/adasheSlice";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { getAdasheBalance } from "../../services/blockchain/useAdasheBalance";
import Image from "next/image";

const GroupSummary = ({ circle }) => {
  const [canContribute, setCanContribute] = useState(false);
  const [checkingContribution, setCheckingContribution] = useState(false);
  const dispatch = useDispatch();
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { isContributing } = useSelector((state) => state.adashe || {});

  const safeCircle = circle || {
    paymentSchedule: [],
    weeklyAmount: 0,
    totalContributionAmount: 0,
    cycleProgress: 0,
    contractAddress: "",
  };

  const {
    name,
    weeklyAmount,
    memberCount,
    currentRound = 1,
    totalRounds,
    nextContributionDate,
    totalContributionAmount,
    nextPayoutDate,
    cycleProgress,
    isActive = true,
    startDate,
    endDate,
    paymentSchedule = [],
    members = [],
    contractAddress,
  } = safeCircle;

  // Get current user's wallet address
  const userAddress = wallets && wallets[0]?.address?.toLowerCase();

  // Get current recipient information from payment schedule
  const currentRecipient = useMemo(() => {
    if (!paymentSchedule || paymentSchedule.length === 0) return null;
    return (
      paymentSchedule.find((payment) => payment.status === "active")
        ?.recipient || paymentSchedule[0]?.recipient
    );
  }, [paymentSchedule]);

  // Helper function to get recipient display information
  const getRecipientDisplayInfo = (recipient) => {
    if (!recipient || !recipient.id) {
      return {
        displayName: "Unknown",
        isCurrentUser: false,
      };
    }

    // Check if the recipient ID matches the current user's wallet address
    const isCurrentUser =
      userAddress && recipient.id.toLowerCase() === userAddress;

    if (isCurrentUser) {
      return {
        displayName: "You",
        isCurrentUser: true,
      };
    }

    // First check if we have a valid name from the recipient object itself
    if (
      recipient.name &&
      recipient.name !== "You" &&
      !recipient.name.startsWith("Member")
    ) {
      return {
        displayName: recipient.name,
        isCurrentUser: false,
      };
    }

    // Try to find the member in the members array by address
    if (members && members.length > 0) {
      const member = members.find(
        (m) =>
          m.address && m.address.toLowerCase() === recipient.id.toLowerCase()
      );

      if (
        member &&
        member.name &&
        member.name !== "You" &&
        !member.name.startsWith("Member")
      ) {
        return {
          displayName: member.name,
          isCurrentUser: false,
        };
      }
    }

    // Fallback: show truncated address
    return {
      displayName: `${recipient.id.substring(0, 6)}...${recipient.id.substring(
        recipient.id.length - 4
      )}`,
      isCurrentUser: false,
    };
  };

  // Find the round due date (end of the week) from the payment schedule
  const roundDueDate = useMemo(() => {
    if (!paymentSchedule || paymentSchedule.length === 0) return null;
    const activeRound = paymentSchedule.find(
      (payment) => payment.status === "active"
    );
    return activeRound?.date || paymentSchedule[0]?.date;
  }, [paymentSchedule]);

  // Format weeklyAmount to prevent "Infinity" display
  const formattedWeeklyAmount = useMemo(() => {
    if (
      typeof weeklyAmount !== "number" ||
      isNaN(weeklyAmount) ||
      !isFinite(weeklyAmount)
    ) {
      return "0";
    }
    return weeklyAmount.toFixed(2);
  }, [weeklyAmount]);

  // Calculate total pool as weeklyAmount x memberCount (in USDC)
  const calculatedTotalPool = useMemo(() => {
    if (
      typeof weeklyAmount !== "number" ||
      typeof memberCount !== "number" ||
      isNaN(weeklyAmount) ||
      isNaN(memberCount)
    ) {
      return "0.00";
    }
    return (weeklyAmount * memberCount).toFixed(2);
  }, [weeklyAmount, memberCount]);

  // Ensure current round is at least 1
  const displayCurrentRound = Math.max(1, currentRound || 1);

  // Ensure proper group name display
  const displayName = useMemo(() => {
    if (name && name.trim().length > 0) {
      return name;
    }
    return contractAddress
      ? `Adashe Circle ${contractAddress.slice(0, 6)}`
      : "Adashe Circle";
  }, [name, contractAddress]);

  // Ensure cycle progress is valid and between 0-100
  const validCycleProgress = useMemo(() => {
    if (typeof cycleProgress !== "number" || isNaN(cycleProgress)) {
      return 0;
    }
    // Ensure progress is between 0 and 100
    return Math.max(0, Math.min(100, cycleProgress));
  }, [cycleProgress]);

  // Create a truncated contract address display with copy ability
  const truncatedAddress = useMemo(() => {
    if (!contractAddress) return "";
    return `${contractAddress.slice(0, 8)}...${contractAddress.slice(-6)}`;
  }, [contractAddress]);

  // Check if user can contribute when component mounts or circle/wallet changes
  useEffect(() => {
    const checkContributionEligibility = async () => {
      if (!authenticated || !wallets || !circle?.id || circle?.error) {
        setCanContribute(false);
        return;
      }

      // Check if circle has more than 1 member
      if (memberCount <= 1) {
        setCanContribute(false);
        return;
      }

      try {
        setCheckingContribution(true);

        const embeddedWallet = wallets?.find(
          (wallet) => wallet.walletClientType === "privy"
        );

        if (!embeddedWallet) {
          setCanContribute(false);
          return;
        }

        // Get user's contribution status for this circle
        const balanceInfo = await getAdasheBalance(
          embeddedWallet,
          circle.id || contractAddress
        );

        // User can contribute if they are a member and haven't contributed for current week
        setCanContribute(balanceInfo.canContribute || false);
      } catch (error) {
        // Failed to check contribution eligibility
        setCanContribute(false);
      } finally {
        setCheckingContribution(false);
      }
    };

    checkContributionEligibility();
  }, [authenticated, wallets, circle, memberCount, contractAddress]);

  // Now we can return null safely after all hooks are defined
  if (!circle) return null;

  // Helper function to format dates consistently
  const formatDateConsistently = (dateString) => {
    if (!dateString) return "Not set";

    // Try to parse date if it's a string
    try {
      if (typeof dateString === "string") {
        // Check if it's already in a readable format (like "15 May 2025")
        if (/^\d{1,2}\s[A-Za-z]{3,}\s\d{4}$/.test(dateString)) {
          return dateString;
        }

        // Check if it's in DD-MM-YYYY format
        const dateRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
        const match = dateString.match(dateRegex);

        if (match) {
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
          const year = parseInt(match[3], 10);

          const date = new Date(year, month, day);
          return `${date.getDate()} ${date.toLocaleString("default", {
            month: "short",
          })} ${date.getFullYear()}`;
        }

        // Try parsing as date string
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return `${date.getDate()} ${date.toLocaleString("default", {
            month: "short",
          })} ${date.getFullYear()}`;
        }
      }

      return dateString; // Return as is if parsing fails
    } catch (e) {
      // Error formatting date
      return dateString;
    }
  };

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
          circleId: circle.id || contractAddress,
          amount: parseFloat(weeklyAmount),
        })
      );
    } catch (error) {
      // Failed to contribute
    }
  };

  // Determine button state and messaging
  const getButtonState = () => {
    if (circle?.error)
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
        reason: "Already contributed this week",
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
    <div className="bg-white rounded-lg p-4 shadow-sm mb-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center">
                <Image
                  src="/icons/profile-2user.svg"
                  alt="Group Icon"
                  className="mr-2"
                  width={20}
                  height={20}
                />
              </div>
              <h2 className="text-xl font-bold">{displayName}</h2>
              {isActive && (
                <span className="ml-12 px-2 py-0.5 bg-[#D1FAE5] text-[#079669] text-xs rounded-full">
                  Active
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Round</p>
              <p className="font-medium text-sm">
                {displayCurrentRound} of {totalRounds || 1}
              </p>
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm">
              ${formattedWeeklyAmount} Weekly · {memberCount || 1} members
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 flex items-center">
            <Image
              src="/icons/next.svg"
              alt="Contribution Icon"
              width={12}
              height={12}
              className="mr-2"
            />
            <span className="text-[10px]">Next Contribution</span>
          </p>
          <p className="font-medium">
            {formatDateConsistently(nextContributionDate)}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 flex items-center">
            <Image
              src="/icons/dollar-circle.svg"
              alt="Pool Icon"
              width={12}
              height={12}
              className="mr-2"
            />
            <span className="text-[10px]">Total Pool</span>
          </p>
          <p className="font-medium">${calculatedTotalPool} USDC</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 flex items-center">
            <Image
              src="/icons/dollar-circle.svg"
              alt="Payout Icon"
              width={12}
              height={12}
              className="mr-2"
            />
            <span className="text-[10px]">Next Payout</span>
          </p>
          <p className="font-medium">
            {formatDateConsistently(nextPayoutDate)}
          </p>
          <p className="text-[10px] text-gray-500">
            To: {getRecipientDisplayInfo(currentRecipient).displayName}
          </p>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-xs">Cycle Progress</span>
          <span className="text-xs text-gray-500">
            {validCycleProgress}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-[#079669] h-1 rounded-full"
            style={{ width: `${validCycleProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-xs font-medium mb-4">Group Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Start Date</p>
            <p className="text-xs">{formatDateConsistently(startDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">End Date</p>
            <p className="text-xs">{formatDateConsistently(endDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Your Position</p>
            <p className="text-xs">
              {displayCurrentRound} of {totalRounds || 1}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Round Due Date</p>
            <p className="text-xs">{formatDateConsistently(roundDueDate)}</p>
          </div>
        </div>
      </div>

      {/* Display contract address if available */}
      {contractAddress && (
        <div className="text-xs text-gray-500 text-center mt-4">
          Contract: {truncatedAddress}
        </div>
      )}

      <button
        onClick={handleContribute}
        disabled={buttonState.disabled}
        title={buttonState.reason}
        className={`w-full font-medium py-2 rounded-md mt-4 flex items-center justify-center transition-colors ${
          !buttonState.disabled
            ? "bg-[#079669] hover:bg-green-600 text-white"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        {checkingContribution ? (
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-gray-400 rounded-full mr-2"></div>
            Checking...
          </div>
        ) : isContributing ? (
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
            Processing...
          </div>
        ) : (
          <>
            <Image
              src="/icons/wallet-white.svg"
              alt="Contribute"
              width={20}
              height={20}
              className="mr-2"
            />
            {buttonState.text}
          </>
        )}
      </button>
    </div>
  );
};

export default GroupSummary;
