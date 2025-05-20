import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createCircle } from "../../redux/slices/adasheSlice";
import { openModal, closeModal } from "../../redux/slices/modalSlice";
import CircleSummary from "./CircleSummary";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { BrowserProvider } from "ethers";

const CreateCircleForm = () => {
  const dispatch = useDispatch();
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();

  // Form state
  const [circleName, setCircleName] = useState("");
  const [contributionAmount, setContributionAmount] = useState(0);
  const [tempAmount, setTempAmount] = useState("");
  const [memberCount, setMemberCount] = useState(1);
  const [tempMemberCount, setTempMemberCount] = useState("");
  const [frequency, setFrequency] = useState("Weekly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creationStep, setCreationStep] = useState(0); // 0: not started, 1: creating address, 2: creating circle

  // Constants
  const totalPeriods = memberCount;
  const totalPot = contributionAmount * memberCount;

  // Function to validate circle data
  const validateCircleData = () => {
    // Check if name is valid (alphanumeric and spaces only)
    if (!/^[A-Za-z0-9\s]+$/.test(circleName)) {
      return "Circle name should only contain letters, numbers, and spaces";
    }

    // Check if name is too short or too long
    if (circleName.length < 3) {
      return "Circle name should be at least 3 characters";
    }

    if (circleName.length > 30) {
      return "Circle name should be at most 30 characters";
    }

    // Check contribution amount
    if (contributionAmount <= 0) {
      return "Contribution amount must be greater than 0";
    }

    // Check member count
    if (memberCount < 1) {
      return "Member count must be at least 1";
    }

    return null; // No validation errors
  };

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreationStep(0);

    try {
      if (!authenticated) {
        dispatch(
          openModal({
            modalType: "ERROR_MODAL",
            modalProps: {
              title: "Authentication Required",
              message: "Please connect your wallet first to create a circle.",
            },
          })
        );
        setIsSubmitting(false);
        return;
      }

      // Validate circle data
      const validationError = validateCircleData();
      if (validationError) {
        dispatch(
          openModal({
            modalType: "ERROR_MODAL",
            modalProps: {
              title: "Validation Error",
              message: validationError,
            },
          })
        );
        setIsSubmitting(false);
        return;
      }

      const circleData = {
        name: circleName.trim(), // Trim any extra spaces
        contributionAmount,
        memberCount,
        frequency,
      };

      // Get the embedded wallet from Privy
      const embeddedWallet = wallets?.find(
        (wallet) => wallet.walletClientType === "privy"
      );

      if (!embeddedWallet) {
        throw new Error("Embedded wallet not found");
      }

      // Import the transaction monitoring utility
      const { monitorTransaction } = await import(
        "../../utils/blockchainDiagnostics"
      );

      // Import the debug utility
      const { debugStart, debugEnd } = await import("../../utils/debug");

      // Start debugging the create circle operation
      debugStart("createCircle", circleData);

      // Show step 1 in progress - creating Adashe contract
      setCreationStep(1);

      // Show modal indicating step 1 is in progress
      dispatch(
        openModal({
          modalType: "INFO_MODAL",
          modalProps: {
            title: "Creating Adashe Contract",
            message:
              "Step 1 of 2: Creating a new Adashe contract. Please confirm the transaction in your wallet.",
          },
        })
      );

      // Dispatch the createCircle action with the wallet
      const result = await dispatch(
        createCircle({
          embeddedWallet: embeddedWallet,
          circleData,
        })
      ).unwrap();

      // Update to step 2 - creating Adashe circle
      setCreationStep(2);

      // If we have transaction receipts, monitor them for confirmation
      if (result?.receipt?.hash) {
        const provider = await embeddedWallet.getEthereumProvider();
        const ethersProvider = new BrowserProvider(provider);

        // Show that the second transaction is complete
        dispatch(
          openModal({
            modalType: "INFO_MODAL",
            modalProps: {
              title: "Circle Created Successfully",
              message:
                "Your Adashe circle has been created and is being confirmed on the blockchain.",
            },
          })
        );

        // Monitor the transaction for final confirmation
        try {
          await monitorTransaction(
            result.receipt.hash,
            ethersProvider,
            (receipt) => {
              console.log("Transaction confirmed with receipt:", receipt);

              // Close any pending modals
              dispatch(closeModal());
            }
          );
        } catch (monitorError) {
          console.error("Error monitoring transaction:", monitorError);
        }
      }

      // End debugging
      debugEnd("createCircle", result);

      if (!result || !result.success) {
        throw new Error("Failed to create circle");
      }

      // Now open modal with invitation code that can be copied
      // Use the actual circle address/ID from the blockchain
      const circleCode =
        result.newCircle?.invitationCode ||
        `${circleName}${result.newCircle?.id.slice(0, 6)}`;
      const circleAddress =
        result.newCircle?.contractAddress || result.newCircle?.id;

      dispatch(
        openModal({
          modalType: "ADASHE_CREATION_SUCCESS",
          modalProps: {
            code: circleCode,
            address: circleAddress,
            name: circleName,
            frequency: frequency,
            amount: contributionAmount,
            members: memberCount,
          },
        })
      );
      setCreationStep(0);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error creating circle:", error);

      // Create a more user-friendly error message
      let errorMessage = error.message || "Unknown error";
      let errorStep = "creating your Adashe circle";

      if (creationStep === 1) {
        errorStep = "creating the Adashe contract";
      } else if (creationStep === 2) {
        errorStep = "initializing the Adashe circle";
      }

      // Handle specific error messages
      if (errorMessage.includes("missing revert data")) {
        errorMessage = `The transaction was reverted by the blockchain while ${errorStep}. This could be due to contract restrictions or network issues.`;
      } else if (errorMessage.includes("insufficient funds")) {
        errorMessage = `You don't have enough ETH to pay for the transaction gas fee while ${errorStep}.`;
      } else if (errorMessage.includes("user rejected")) {
        errorMessage = `You rejected the transaction in your wallet while ${errorStep}.`;
      }

      // Use a better modal with more detailed information and possible solutions
      const errorTitle = `Failed to Create Circle (Step ${creationStep})`;
      let possibleSolutions = [];

      // Add custom solutions based on the error message
      if (errorMessage.includes("circle name")) {
        possibleSolutions = [
          "Try a different circle name",
          "Make sure the name contains only letters, numbers, and spaces",
          "Keep the name between 3-30 characters",
        ];
      } else if (
        errorMessage.includes("gas") ||
        errorMessage.includes("funds")
      ) {
        possibleSolutions = [
          "Make sure you have enough ETH for gas fees",
          "Try a smaller contribution amount",
          "Check your wallet balance",
        ];
      } else if (
        errorMessage.includes("reverted") ||
        errorMessage.includes("rejected")
      ) {
        possibleSolutions = [
          "Check your input values",
          "Make sure the member count is valid",
          "Try refreshing the page and reconnecting your wallet",
        ];
      }

      dispatch(
        openModal({
          modalType: "ERROR_MODAL",
          modalProps: {
            title: errorTitle,
            message: errorMessage,
            solutions: possibleSolutions,
          },
        })
      );

      setCreationStep(0);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreateCircle} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Circle Name
        </label>
        <input
          type="text"
          placeholder="E.g. Gang"
          className="w-full p-3 border border-gray-300 rounded-md"
          value={circleName}
          onChange={(e) => {
            // Remove any characters that might cause issues with the smart contract
            const sanitized = e.target.value.replace(/[^\w\s]/gi, "");
            setCircleName(sanitized);
          }}
          pattern="[A-Za-z0-9\s]+"
          title="Circle name should only contain letters, numbers and spaces"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Name should only contain letters, numbers, and spaces
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contribution Amount (USDC)
        </label>
        <input
          type="number"
          placeholder="50"
          className="w-full p-3 border border-gray-300 rounded-md"
          value={tempAmount}
          onChange={(e) => {
            setTempAmount(e.target.value);
            if (e.target.value === "") {
              setContributionAmount(0);
            } else {
              setContributionAmount(Number(e.target.value));
            }
          }}
          onFocus={() => {
            if (contributionAmount === 0) {
              setTempAmount("");
            } else {
              setTempAmount(contributionAmount.toString());
            }
          }}
          onBlur={() => {
            if (tempAmount === "") {
              setTempAmount("0");
              setContributionAmount(0);
            }
          }}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Each member will contribute this amount {frequency.toLowerCase()}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          No. of Members
        </label>
        <input
          type="number"
          placeholder="1"
          className="w-full p-3 border border-gray-300 rounded-md"
          value={tempMemberCount}
          onChange={(e) => {
            setTempMemberCount(e.target.value);
            if (e.target.value === "") {
              setMemberCount(1);
            } else {
              setMemberCount(Number(e.target.value));
            }
          }}
          onFocus={() => {
            if (memberCount === 1) {
              setTempMemberCount("");
            } else {
              setTempMemberCount(memberCount.toString());
            }
          }}
          onBlur={() => {
            if (tempMemberCount === "") {
              setTempMemberCount("1");
              setMemberCount(1);
            }
          }}
          min="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Frequency
        </label>
        <select
          className="w-full p-3 border bg-white border-gray-300 rounded-md"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          required
        >
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      {memberCount >= 1 && contributionAmount > 0 && (
        <CircleSummary
          memberCount={memberCount}
          contributionAmount={contributionAmount}
          totalPot={totalPot}
          totalPeriods={totalPeriods}
          frequency={frequency}
        />
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-[#079669] text-white p-3 rounded-xl font-medium flex items-center justify-center ${
          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center">
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
            {creationStep === 1
              ? "Step 1: Creating Contract..."
              : creationStep === 2
              ? "Step 2: Creating Circle..."
              : "Processing..."}
          </div>
        ) : (
          <>
            <img
              src="/icons/lock_white.svg"
              alt="Create Circle"
              className="w-4 h-4 mr-2"
            />
            Create Adashe
          </>
        )}
      </button>

      {isSubmitting && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {creationStep === 0 && "Initializing..."}
          {creationStep === 1 && "Creating circle address..."}
          {creationStep === 2 && "Funding circle..."}
        </div>
      )}
    </form>
  );
};

export default CreateCircleForm;
