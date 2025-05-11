import React from "react";
import { setActiveTab } from "../../redux/slices/quicksaveSlice";
import CommonTabSelector from "../common/TabSelector";

const TabSelector = () => {
  const tabs = [
    { id: "save", label: "Quick Save" },
    { id: "withdraw", label: "Withdraw" },
  ];

  return (
    <CommonTabSelector
      tabs={tabs}
      stateKey="quicksave"
      setActiveTabAction={setActiveTab}
      defaultActiveTab="save"
    />
  );
};

export default TabSelector;
