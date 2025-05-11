import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../redux/slices/modalSlice";

const SuccessModal = ({ title, message, subMessage, code, icon = "check" }) => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.modal.isOpen);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(closeModal());
  };

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-lg mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          {/* Center icon */}
          {icon === "check" && (
            <img
              src="/icons/Group.svg"
              alt="Success"
              className="w-28 h-28 text-white"
            />
          )}
        </div>

        {/* Title */}
        {title && (
          <h2 className="text-[18px] font-semibold text-center mb-2">
            {title}
          </h2>
        )}

        {/* Main message */}
        {message && <p className="text-[12px] text-center mb-1">{message}</p>}

        {/* Code with copy icon - just text with icon beside it */}
        {code && (
          <div className="flex items-center justify-center mt-4 mb-4">
            <div className="inline-flex items-center">
              <span className="text-[12px] font-semibold mr-2">{code}</span>
              <div className="flex flex-col items-center">
                <button
                  onClick={copyToClipboard}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {copied ? (
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
                      className="w-4 h-4 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <img src="/icons/copy.svg" alt="Copy" className="w-4 h-4" />
                  )}
                </button>
                {copied && (
                  <span className="text-[8px] text-green-500 mt-1">
                    Copied!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sub message (optional) - only show if not showing the code */}
        {subMessage && !code && (
          <p className="text-sm text-gray-500 text-center mb-4">{subMessage}</p>
        )}
      </div>
    </div>
  );
};

export default SuccessModal;
