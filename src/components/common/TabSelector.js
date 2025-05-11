import React from "react";
import { useDispatch, useSelector } from "react-redux";

const TabSelector = ({
  tabs,
  stateKey,
  setActiveTabAction,
  defaultTabs = [],
  defaultActiveTab = "create",
  activeTabProperty = "activeTab",
}) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state[stateKey]) || {};
  const activeTab = state[activeTabProperty] || defaultActiveTab;

  // Use provided tabs or default tabs
  const tabsToRender = tabs || defaultTabs;

  const handleTabChange = (tabId) => {
    dispatch(setActiveTabAction(tabId));
  };

  return (
    <div className="flex justify-center bg-gray-100 rounded-xl mb-4 sm:mb-6 h-10 sm:h-12">
      <div className="inline-flex w-full">
        {tabsToRender.map((tab) => (
          <button
            key={tab.id}
            className={`py-1 sm:py-2 px-2 sm:px-4 rounded-xl text-center flex-1 transition-all duration-200 text-xs sm:text-sm md:text-base ${
              activeTab === tab.id
                ? "bg-white text-[#079669] font-medium border-2 sm:border-4 border-gray-100"
                : "text-gray-600"
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabSelector;
