import React from "react";

const LockDurationOptions = ({ duration, onChange }) => {
  const options = [
    { days: 30, returnRate: "5%" },
    { days: 60, returnRate: "8%" },
    { days: 90, returnRate: "10%" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {options.map((option) => (
        <button
          key={option.days}
          type="button"
          className={`
            flex flex-col items-center justify-center p-4 border rounded-lg transition-all
            ${
              duration === option.days
                ? "border-black bg-white"
                : "border-black-200 bg-white hover:border-[#07966955]"
            }
          `}
          onClick={() => onChange(option.days)}
        >
          <svg
            className="w-5 h-5 mb-2 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className="font-medium">{option.days} Days</span>
          <span className="text-xs text-gray-500">
            {option.returnRate} Return
          </span>
        </button>
      ))}
    </div>
  );
};

export default LockDurationOptions;
