import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { closeModal } from "../../redux/slices/modalSlice";

const ErrorModal = ({
  title = "Error Occurred",
  message = "An unknown error occurred. Please try again.",
  solutions = [],
  onClose = () => {},
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

  const handleClose = () => {
    dispatch(closeModal());
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
          {/* Error Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-center mb-2">{title}</h2>

          {/* Error message */}
          <p className="text-gray-600 text-center mb-4">{message}</p>

          {/* Solutions if available */}
          {solutions && solutions.length > 0 && (
            <div className="mb-6 bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-semibold mb-2">Possible solutions:</p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                {solutions.map((solution, index) => (
                  <li key={index}>{solution}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to mount modal at the end of the document body
  return mounted && typeof window !== "undefined"
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
};

export default ErrorModal;
