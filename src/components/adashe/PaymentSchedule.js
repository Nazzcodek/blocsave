import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  withdrawFromCircle,
  WITHDRAWAL_STATUS,
} from "../../redux/slices/adasheSlice";
import { openModal } from "../../redux/slices/modalSlice";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import {
  getDetailedMembers,
  getCircleContributionProgress,
  getUserWeeksInCircle,
} from "@/services/blockchain/useAdashe";

const PaymentSchedule = ({ circle }) => {
  const dispatch = useDispatch();
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  const [processingRound, setProcessingRound] = useState(null);
  const [withdrawalStatus, setWithdrawalStatus] = useState(
    WITHDRAWAL_STATUS.IDLE
  );
  const [detailedMembers, setDetailedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contributionProgress, setContributionProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [userWeeks, setUserWeeks] = useState([]);

  const embeddedWallet = wallets?.find(
    (wallet) => wallet.walletClientType === "privy"
  );
  const userAddress = wallets && wallets[0]?.address?.toLowerCase();

  // Function to get status-specific messages
  const getWithdrawalStatusMessage = (status) => {
    switch (status) {
      case WITHDRAWAL_STATUS.CONNECTING_WALLET:
        return "Connecting to wallet...";
      case WITHDRAWAL_STATUS.CHECKING_ELIGIBILITY:
        return "Verifying eligibility...";
      case WITHDRAWAL_STATUS.PREPARING_TRANSACTION:
        return "Preparing transaction...";
      case WITHDRAWAL_STATUS.AWAITING_APPROVAL:
        return "Please approve in wallet...";
      case WITHDRAWAL_STATUS.PROCESSING_BLOCKCHAIN:
        return "Processing on blockchain...";
      case WITHDRAWAL_STATUS.CONFIRMING:
        return "Waiting for confirmation...";
      case WITHDRAWAL_STATUS.SUCCESS:
        return "Transaction confirmed!";
      case WITHDRAWAL_STATUS.ERROR:
        return "Transaction failed";
      default:
        return "Processing...";
    }
  };

  // Fetch detailed member information
  useEffect(() => {
    const fetchDetailedMembers = async () => {
      if (!embeddedWallet || !circle?.contractAddress || !circle) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetching detailed members

        const members = await getDetailedMembers(
          embeddedWallet,
          circle.contractAddress,
          userAddress
        );

        setDetailedMembers(members);
      } catch (error) {
        // Failed to fetch detailed members
        // Fallback to existing members if available
        setDetailedMembers(circle.members || []);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedMembers();
  }, [embeddedWallet, circle?.contractAddress, userAddress, circle]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!embeddedWallet || !circle?.contractAddress) return;
      setProgressLoading(true);
      try {
        const progress = await getCircleContributionProgress(
          embeddedWallet,
          circle.contractAddress
        );
        setContributionProgress(progress);
      } catch (e) {
        setContributionProgress(null);
      } finally {
        setProgressLoading(false);
      }
    };
    fetchProgress();
  }, [embeddedWallet, circle?.contractAddress]);

  // Fetch randomized user weeks for the circle
  useEffect(() => {
    const fetchUserWeeks = async () => {
      if (!embeddedWallet || !circle?.contractAddress) return;
      try {
        const weeks = await getUserWeeksInCircle(
          embeddedWallet,
          circle.contractAddress
        );
        setUserWeeks(weeks);
      } catch (e) {
        setUserWeeks([]);
      }
    };
    fetchUserWeeks();
  }, [embeddedWallet, circle?.contractAddress]);

  // Harmonize week numbering: blockchain week 0 is user week 1
  const getUserWeek = (blockchainWeek) => {
    if (typeof blockchainWeek !== "number" || isNaN(blockchainWeek))
      return null;
    return blockchainWeek + 1;
  };

  // Helper: get the blockchain week for a given round (1-based user round)
  const getBlockchainWeekForRound = (userRound) => {
    // userRound is 1-based, blockchain week is 0-based
    if (typeof userRound !== "number" || isNaN(userRound)) return null;
    return userRound - 1;
  };

  // Helper: get the user round for a given blockchain week (0-based)
  const getUserRoundForBlockchainWeek = (blockchainWeek) => {
    if (typeof blockchainWeek !== "number" || isNaN(blockchainWeek))
      return null;
    return blockchainWeek + 1;
  };

  // Helper: is the circle started (week >= 0 on blockchain, i.e. user week >= 1)?
  const isCircleStarted = (blockchainWeek) => {
    return typeof blockchainWeek === "number" && blockchainWeek >= 0;
  };

  if (!circle || !circle.paymentSchedule) return null;

  // Show loading state while fetching detailed members
  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-2">Payment Schedule</h2>
        <p className="text-gray-600 text-sm mb-4">
          The order and schedule of payouts for each member
        </p>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Helper function to get recipient display information
  const getRecipientDisplayInfo = (recipientId) => {
    if (!recipientId) {
      return {
        displayName: "Unknown",
        isCurrentUser: false,
        isOwner: false,
        address: "",
      };
    }

    // Find detailed member info by address
    const detailedMember = detailedMembers.find(
      (member) => member.address.toLowerCase() === recipientId.toLowerCase()
    );

    if (detailedMember) {
      return {
        displayName: detailedMember.isCurrentUser ? "You" : detailedMember.name,
        isCurrentUser: detailedMember.isCurrentUser,
        isOwner: detailedMember.isOwner,
        address: detailedMember.address,
      };
    }

    // Fallback: check if current user by address comparison
    const isCurrentUser =
      userAddress && recipientId.toLowerCase() === userAddress;

    if (isCurrentUser) {
      return {
        displayName: "You",
        isCurrentUser: true,
        isOwner: false, // We don't know ownership without detailed info
        address: recipientId,
      };
    }

    // Fallback: show truncated address
    return {
      displayName: `${recipientId.substring(0, 8)}...`,
      isCurrentUser: false,
      isOwner: false,
      address: recipientId,
    };
  };

  const handleWithdraw = async (roundId) => {
    if (!authenticated) {
      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: "Authentication Required",
            message: "Please connect your wallet to withdraw funds.",
          },
        })
      );
      return;
    }

    // Use real-time progress for active round
    const currentWeek = contributionProgress?.week;
    // Remove the check that blocks withdrawal for blockchain week 0 (user week 1)
    // Only block if week is undefined/null
    if (currentWeek === undefined || currentWeek === null) {
      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: "Circle Not Started",
            message:
              "The circle has not started yet. Please wait for the first week to begin before attempting withdrawal.",
          },
        })
      );
      return;
    }

    // Additional validation before withdrawal
    const round = circle.paymentSchedule.find((r) => r.round === roundId);
    if (!round) {
      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: "Invalid Round",
            message: "Invalid round selected. Please try again.",
          },
        })
      );
      return;
    }

    if (round.status !== "active") {
      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: "Round Not Active",
            message: "This round is not currently active for withdrawal.",
          },
        })
      );
      return;
    }

    const recipientInfo = getRecipientDisplayInfo(round.recipient.id);
    if (!round.recipient || !recipientInfo.isCurrentUser) {
      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: "Not Eligible",
            message: "You are not the recipient for this round.",
          },
        })
      );
      return;
    }

    // Use real-time contribution count for active round
    let contributedCount = round.contributions;
    let totalMembers = round.totalMembers || circle?.memberCount || 1;
    if (round.status === "active" && contributionProgress) {
      contributedCount = contributionProgress.contributedCount;
      totalMembers = contributionProgress.totalMembers;
    }

    // Check if all members have contributed before allowing withdrawal
    if (contributedCount < totalMembers) {
      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: "Incomplete Round",
            message: `Cannot withdraw yet. Waiting for all members to contribute. Current: ${contributedCount}/${totalMembers} members have contributed.`,
          },
        })
      );
      return;
    }

    // Only allow withdrawal if the current blockchain week matches this round
    // (i.e., it's the recipient's turn for this week)
    // Fix: compare user round to (blockchain week + 1) instead of blockchain week
    // But also allow if the round is the current active round (for UI consistency)
    if (
      getUserRoundForBlockchainWeek(currentWeek) !== round.round ||
      getBlockchainWeekForRound(round.round) !== currentWeek
    ) {
      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: "Not Your Turn",
            message: `It's not your turn to withdraw. Current week is ${getUserWeek(
              currentWeek
            )}, your turn is week ${round.round}`,
          },
        })
      );
      return;
    }

    // Show confirmation dialog before proceeding
    dispatch(
      openModal({
        modalType: "CONFIRMATION_MODAL",
        modalProps: {
          title: "Confirm Withdrawal",
          message: `Are you sure you want to withdraw funds for Round ${roundId}? This action cannot be undone.`,
          confirmText: "Withdraw",
          cancelText: "Cancel",
          onConfirm: () => executeWithdrawal(roundId),
          variant: "primary",
        },
      })
    );
  };

  const executeWithdrawal = async (roundId) => {
    setProcessingWithdrawal(true);
    setProcessingRound(roundId);
    setWithdrawalStatus(WITHDRAWAL_STATUS.CONNECTING_WALLET);

    try {
      const embeddedWallet = wallets?.find(
        (wallet) => wallet.walletClientType === "privy"
      );

      if (!embeddedWallet) {
        throw new Error("Embedded wallet not found");
      }

      // Attempting withdrawal for round

      // Create status update callback to track withdrawal progress
      const updateStatus = (status) => {
        setWithdrawalStatus(status);
        // Withdrawal status updated
      };

      await dispatch(
        withdrawFromCircle({
          embeddedWallet,
          circleId: circle.id,
          roundId,
          updateStatus, // Pass the status update callback
        })
      ).unwrap();

      // Show success message
      setWithdrawalStatus(WITHDRAWAL_STATUS.SUCCESS);
      dispatch(
        openModal({
          modalType: "SUCCESS_MODAL",
          modalProps: {
            title: "Withdrawal Successful",
            message:
              "The funds have been transferred to your wallet successfully!",
            confirmText: "Done",
          },
        })
      );
    } catch (error) {
      // Provide more specific error messages
      console.error("[Withdrawal Error]", error); // <-- log the full error for debugging
      let errorTitle = "Withdrawal Failed";
      let errorMessage = "Failed to withdraw funds";
      const msg = typeof error?.message === "string" ? error.message : "";

      if (msg.includes("not your turn")) {
        errorTitle = "Not Your Turn";
        errorMessage =
          "It's not your turn to withdraw yet. Please wait for your scheduled round.";
      } else if (msg.includes("already withdrawn")) {
        errorTitle = "Already Withdrawn";
        errorMessage = "You have already withdrawn for this round.";
      } else if (msg.includes("not a member")) {
        errorTitle = "Not a Member";
        errorMessage = "You are not a member of this Adashe circle.";
      } else if (msg.includes("insufficient")) {
        errorTitle = "Insufficient Funds";
        errorMessage =
          "The circle does not have sufficient funds for withdrawal.";
      } else if (msg.includes("user rejected")) {
        errorTitle = "Transaction Cancelled";
        errorMessage = "You cancelled the transaction in your wallet.";
      } else if (msg) {
        errorMessage = `${msg}`;
      }

      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: errorTitle,
            message: errorMessage,
          },
        })
      );
    } finally {
      setProcessingWithdrawal(false);
      setProcessingRound(null);
      setWithdrawalStatus(WITHDRAWAL_STATUS.IDLE);
    }
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

  const getProgressBar = (round) => {
    if (round.status === "active" && contributionProgress) {
      const percent = contributionProgress.totalMembers
        ? Math.round(
            (contributionProgress.contributedCount /
              contributionProgress.totalMembers) *
              100
          )
        : 0;
      return (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-[#079669] h-1 rounded-full"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">
              {progressLoading
                ? "Loading..."
                : `${contributionProgress.contributedCount} of ${contributionProgress.totalMembers} contributed`}
            </span>
            <span className="text-xs text-gray-500">
              {progressLoading ? "" : `${percent}% Complete`}
            </span>
          </div>
        </div>
      );
    } else {
      // All other rounds use the existing logic
      const percent = round.totalMembers
        ? Math.round((round.contributions / round.totalMembers) * 100)
        : 0;
      return (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-gray-300 h-1 rounded-full"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">
              {`${round.contributions} of ${
                round.totalMembers || circle?.memberCount || 1
              } contributed`}
            </span>
            <span className="text-xs text-gray-500">{`${percent}% Complete`}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Payment Schedule</h2>
      <p className="text-gray-600 text-sm mb-4">
        The order and schedule of payouts for each member
      </p>

      <div className="space-y-4">
        {circle.paymentSchedule.map((round) => {
          // Find the address for this round from userWeeks
          const weekInfo = userWeeks.find((w) => w.week === round.round);
          const isUserWeek =
            weekInfo &&
            userAddress &&
            weekInfo.address.toLowerCase() === userAddress;
          const recipientInfo = getRecipientDisplayInfo(round.recipient.id);
          // Use real-time progress for the active round
          const isActiveRound =
            getUserRoundForBlockchainWeek(contributionProgress?.week) ===
              round.round &&
            round.status === "active" &&
            contributionProgress;
          const contributedCount = isActiveRound
            ? contributionProgress.contributedCount
            : round.contributions;
          const totalMembers = isActiveRound
            ? contributionProgress.totalMembers
            : round.totalMembers || circle?.memberCount || 1;
          const canWithdraw =
            isActiveRound &&
            contributedCount >= totalMembers &&
            isUserWeek &&
            !processingWithdrawal &&
            authenticated &&
            isCircleStarted(contributionProgress?.week); // Only disable if week is undefined/null

          return (
            <div
              key={round.round}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-[10px] font-medium">
                      Round {getUserWeek(round.round - 1)}
                    </h3>
                    <div className="text-xs ml-2">
                      {getStatusBadge(round.status)}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    Recipient:{" "}
                    <span className="inline-flex items-center">
                      {recipientInfo.displayName}
                      {recipientInfo.isOwner && (
                        <Image
                          src="/icons/crown.svg"
                          alt="Crown"
                          width={10}
                          height={10}
                          className="ml-1"
                        />
                      )}
                    </span>
                  </p>
                </div>

                {/* Only show withdraw button for the user's week */}
                {round.status === "active" && isUserWeek && (
                  <button
                    className={`flex items-center justify-center rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm transition-all duration-200 ${
                      canWithdraw
                        ? "bg-[#079669] hover:bg-[#067d5a] text-white hover:shadow-md active:scale-95"
                        : "bg-gray-400 cursor-not-allowed opacity-70"
                    } disabled:opacity-70`}
                    disabled={!canWithdraw}
                    onClick={() => handleWithdraw(round.round)}
                    title={
                      !isCircleStarted(contributionProgress?.week)
                        ? "Circle has not started yet. Please wait for the first week to begin."
                        : processingWithdrawal &&
                          processingRound === round.round
                        ? getWithdrawalStatusMessage(withdrawalStatus)
                        : !authenticated
                        ? "Please connect your wallet"
                        : contributedCount < totalMembers
                        ? `Waiting for all members to contribute (${contributedCount}/${totalMembers})`
                        : `Withdraw funds for Round ${getUserWeek(
                            round.round - 1
                          )}`
                    }
                    aria-label={`Withdraw funds for Round ${getUserWeek(
                      round.round - 1
                    )}`}
                  >
                    {processingWithdrawal && processingRound === round.round ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>
                          {getWithdrawalStatusMessage(withdrawalStatus)}
                        </span>
                      </>
                    ) : !isCircleStarted(contributionProgress?.week) ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Not Started</span>
                      </>
                    ) : contributedCount < totalMembers ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          Waiting ({contributedCount}/{totalMembers})
                        </span>
                      </>
                    ) : (
                      <>
                        <Image
                          src="/icons/wallet-white.svg"
                          alt="Withdraw"
                          width={16}
                          height={16}
                          className="w-4 h-4 mr-2 text-white"
                        />
                        <span>Withdraw</span>
                      </>
                    )}
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

              {getProgressBar(round)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentSchedule;
