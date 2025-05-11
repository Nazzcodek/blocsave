import React from "react";

const SafelockProgress = ({ current, total }) => {
  const progressPercentage = Math.min(100, Math.round((current / total) * 100));

  return (
    <div>
      <div className="relative pt-1">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-[#D1FAE5]">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#079669] transition-all duration-500"
          ></div>
        </div>
      </div>
      <div className="text-right text-xs text-gray-500 mt-1">
        {current} day{current !== 1 ? "s" : ""} of {total} days (
        {progressPercentage}%)
      </div>
    </div>
  );
};

export default SafelockProgress;
