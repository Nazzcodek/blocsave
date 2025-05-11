import React from "react";
import { setActiveTab } from "../../redux/slices/safelockSlice";
import CommonTabSelector from "../common/TabSelector";

const TabSelector = ({ tabs }) => {
  const defaultTabs = [
    { id: "create", label: "Create SafeLock" },
    { id: "manage", label: "Manage SafeLocks" },
  ];

  return (
    <CommonTabSelector
      tabs={tabs || defaultTabs}
      stateKey="safelock"
      setActiveTabAction={setActiveTab}
      defaultActiveTab="create"
    />
  );
};

export default TabSelector;
