import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { closeModal, openModal } from "../../redux/slices/modalSlice";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { joinCircle } from "../../redux/slices/adasheSlice";

const JoinGroupModal = ({
  title = "Join a Savings Group",
  buttonText = "Join Group",
  placeholder = "Contract Address",
  initialValue = "",
  onSubmit = () => {},
  onClose = () => {},
  inputLabel = "Enter the group contract address",
}) => {
  const [inviteCode, setInviteCode] = useState(initialValue);
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const dispatch = useDispatch();
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    setMounted(true);

    // Set default user name from Privy user data
    if (user) {
      const defaultName =
        user.username ||
        user.email?.address ||
        (user.wallet?.address
          ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(
              -4
            )}`
          : null) ||
        "Anonymous";
      setUserName(defaultName);
    }

    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsJoining(true);
    setErrorMsg("");

    try {
      if (!authenticated) {
        alert("Please connect your wallet first");
        setIsJoining(false);
        return;
      }

      const embeddedWallet = wallets?.find(
        (wallet) => wallet.walletClientType === "privy"
      );

      if (!embeddedWallet) {
        throw new Error("Embedded wallet not found");
      }

      // Add validation for contract address format
      if (!inviteCode.startsWith("0x") || inviteCode.length !== 42) {
        setErrorMsg("Please enter a valid contract address (0x... format)");
        setIsJoining(false);
        return;
      }

      if (!userName.trim()) {
        setErrorMsg("Please enter your name");
        setIsJoining(false);
        return;
      }

      // Add the log here
      console.log("Joining group with:", {
        contractAddress: inviteCode,
        userName: userName.trim(),
        embeddedWalletAddress: embeddedWallet?.user?.address,
      });

      // Use Redux thunk to join by contract address
      const resultAction = await dispatch(
        joinCircle({
          embeddedWallet,
          contractAddress: inviteCode,
          userName: userName.trim(),
        })
      );
      if (joinCircle.fulfilled.match(resultAction)) {
        // Call any additional onSubmit handler if provided
        if (onSubmit) {
          await onSubmit(inviteCode);
        }

        // Get the join result data
        const joinData = resultAction.payload;

        // Determine the appropriate modal props based on join result
        let modalProps = { contractAddress: inviteCode };
        let modalMessage = "You've successfully joined the savings group";

        if (joinData?.message) {
          // User was already a member or is the owner
          if (joinData.isOwner) {
            modalMessage =
              "You are the creator of this circle and are already a member.";
          } else if (joinData.alreadyMember) {
            modalMessage = "You are already a member of this circle.";
          } else {
            modalMessage = joinData.message;
          }
        }

        modalProps.message = modalMessage;

        // Show success modal with appropriate message
        dispatch(
          openModal({
            modalType: "ADASHE_JOIN_SUCCESS",
            modalProps,
          })
        );
        onClose();
      } else {
        setErrorMsg(resultAction.payload || "Failed to join group");
        setIsJoining(false);
      }
    } catch (error) {
      console.error("Failed to join group:", error);
      setErrorMsg(error.message || "Unknown error");
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Modal content
  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8">
          {/* Title */}
          <h2 className="text-[14px] font-semibold text-center mb-6">
            {title}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Input Label */}
            <label
              htmlFor="inviteCode"
              className="block text-[12px] font-medium text-gray-700 mb-2"
            >
              {inputLabel}
            </label>

            {/* Input Field */}
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              required
            />

            {/* User Name Input */}
            <label
              htmlFor="userName"
              className="block text-[12px] font-medium text-gray-700 mb-2"
            >
              Your name in the group
            </label>

            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-md mb-6"
              required
            />

            {/* Error Message */}
            {errorMsg && (
              <div className="text-red-500 text-xs mb-2">{errorMsg}</div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={isJoining}
              className={`w-full bg-[#079669] text-white font-medium py-3 px-4 rounded-lg transition duration-200 ${
                isJoining ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isJoining ? (
                <div className="flex items-center justify-center">
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
                  Joining...
                </div>
              ) : (
                buttonText
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // Use portal to mount modal at the end of the document body
  return mounted && typeof window !== "undefined"
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
};

export default JoinGroupModal;
