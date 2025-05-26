import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { closeModal } from "../../redux/slices/modalSlice";

const ConfirmationModal = ({
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm = () => {},
  onCancel = () => {},
  variant = "primary", // primary, danger, warning
}) => {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleConfirm = () => {
    dispatch(closeModal());
    onConfirm();
  };

  const handleCancel = () => {
    dispatch(closeModal());
    onCancel();
  };

  const handleClose = () => {
    dispatch(closeModal());
    onCancel();
  };

  // Get button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "warning":
        return "bg-orange-600 hover:bg-orange-700 text-white";
      default:
        return "bg-[#079669] hover:bg-[#06805a] text-white";
    }
  };

  // Modal content
  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 relative">
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
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={`rounded-full p-3 ${
                variant === "danger"
                  ? "bg-red-100"
                  : variant === "warning"
                  ? "bg-orange-100"
                  : "bg-blue-100"
              }`}
            >
              <svg
                className={`h-8 w-8 ${
                  variant === "danger"
                    ? "text-red-600"
                    : variant === "warning"
                    ? "text-orange-600"
                    : "text-blue-600"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-center mb-2">{title}</h2>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6">{message}</p>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 font-medium py-3 px-4 rounded-lg transition duration-200 ${getButtonStyles()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to mount modal at the end of the document body
  return mounted && typeof window !== "undefined"
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
};

export default ConfirmationModal;
