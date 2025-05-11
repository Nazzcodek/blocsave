import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDetailTabView } from "../../redux/slices/adasheSlice";
import CommonTabSelector from "../common/TabSelector";

const TabSelector = ({ tabs, defaultActiveTab }) => {
  const dispatch = useDispatch();
  const { detailTabView } = useSelector((state) => state.adashe);

  return (
    <div className="mb-4">
      <CommonTabSelector
        tabs={tabs}
        stateKey="adashe"
        setActiveTabAction={setDetailTabView}
        defaultActiveTab={defaultActiveTab}
        activeTabProperty="detailTabView"
      />
    </div>
  );
};

export default TabSelector;
