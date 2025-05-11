import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { closeModal, openModal } from "../../redux/slices/modalSlice";

const JoinGroupModal = ({
  title = "Join a Savings Group",
  buttonText = "Join Group",
  placeholder = "Code",
  initialValue = "",
  onSubmit = () => {},
  onClose = () => {},
  inputLabel = "Enter your group invite code",
}) => {
  const [inviteCode, setInviteCode] = useState(initialValue);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setMounted(true);

    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the onSubmit handler with the invite code
      await onSubmit(inviteCode);

      dispatch(
        openModal({
          modalType: "ADASHE_JOIN_SUCCESS",
          //   modalProps: { groupName: response?.groupName || "Savings" },
        })
      );
      onClose();
    } catch (error) {
      console.error("Failed to join group:", error);
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
              className="w-full p-3 border border-gray-300 rounded-md mb-6"
              required
            />

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-[#079669] text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              {buttonText}
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
