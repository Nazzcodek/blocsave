import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearMessages } from "../../redux/slices/quicksaveSlice";

const SuccessNotification = ({ message, duration = 5000 }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Automatically clear success message after duration
    const timer = setTimeout(() => {
      dispatch(clearMessages());
    }, duration);

    return () => clearTimeout(timer);
  }, [dispatch, duration, message]);

  if (!message) return null;

  return (
    <div className="fixed top-2 sm:top-4 right-2 sm:right-4 bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded shadow-md flex items-center max-w-xs sm:max-w-md animate-fade-in">
      <div className="mr-2 sm:mr-3 flex-shrink-0">
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div>
        <p className="font-medium text-xs sm:text-sm">{message}</p>
      </div>
      <button
        onClick={() => dispatch(clearMessages())}
        className="ml-auto text-green-500 hover:text-green-700"
      >
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

export default SuccessNotification;
