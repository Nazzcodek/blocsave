import React from "react";
import { setActiveTab } from "../../redux/slices/adasheSlice";
import CommonTabSelector from "../common/TabSelector";

const TabSelector = ({ tabs }) => {
  const defaultTabs = [
    { id: "create", label: "Create Circle" },
    { id: "manage", label: "Manage Circles" },
  ];

  return (
    <CommonTabSelector
      tabs={tabs}
      stateKey="adashe"
      setActiveTabAction={setActiveTab}
      defaultTabs={defaultTabs}
      defaultActiveTab="create"
    />
  );
};

export default TabSelector;
