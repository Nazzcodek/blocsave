import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createCircle } from "../../redux/slices/adasheSlice";
import { openModal } from "../../redux/slices/modalSlice";
import CircleSummary from "./CircleSummary";

const CreateCircleForm = () => {
  const dispatch = useDispatch();

  // Form state
  const [circleName, setCircleName] = useState("");
  const [contributionAmount, setContributionAmount] = useState(0);
  const [tempAmount, setTempAmount] = useState("");
  const [memberCount, setMemberCount] = useState(1);
  const [tempMemberCount, setTempMemberCount] = useState("");
  const [frequency, setFrequency] = useState("Weekly");

  // Constants
  const totalPeriods = memberCount;
  const totalPot = contributionAmount * memberCount;

  const handleCreateCircle = async (e) => {
    e.preventDefault();

    const circleData = {
      name: circleName,
      contributionAmount,
      memberCount,
      frequency,
    };

    // First dispatch the createCircle action
    await dispatch(createCircle(circleData));

    // Now open modal with code that can be copied
    dispatch(
      openModal({
        modalType: "ADASHE_CREATION_SUCCESS",
        modalProps: {
          code: circleData.name,
        },
      })
    );
  };

  return (
    <form onSubmit={handleCreateCircle} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Circle Name
        </label>
        <input
          type="text"
          placeholder="E.g. Gang"
          className="w-full p-3 border border-gray-300 rounded-md"
          value={circleName}
          onChange={(e) => setCircleName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contribution Amount (USDC)
        </label>
        <input
          type="number"
          placeholder="50"
          className="w-full p-3 border border-gray-300 rounded-md"
          value={tempAmount}
          onChange={(e) => {
            setTempAmount(e.target.value);
            if (e.target.value === "") {
              setContributionAmount(0);
            } else {
              setContributionAmount(Number(e.target.value));
            }
          }}
          onFocus={() => {
            if (contributionAmount === 0) {
              setTempAmount("");
            } else {
              setTempAmount(contributionAmount.toString());
            }
          }}
          onBlur={() => {
            if (tempAmount === "") {
              setTempAmount("0");
              setContributionAmount(0);
            }
          }}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Each member will contribute this amount {frequency.toLowerCase()}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          No. of Members
        </label>
        <input
          type="number"
          placeholder="1"
          className="w-full p-3 border border-gray-300 rounded-md"
          value={tempMemberCount}
          onChange={(e) => {
            setTempMemberCount(e.target.value);
            if (e.target.value === "") {
              setMemberCount(1);
            } else {
              setMemberCount(Number(e.target.value));
            }
          }}
          onFocus={() => {
            if (memberCount === 1) {
              setTempMemberCount("");
            } else {
              setTempMemberCount(memberCount.toString());
            }
          }}
          onBlur={() => {
            if (tempMemberCount === "") {
              setTempMemberCount("1");
              setMemberCount(1);
            }
          }}
          min="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Frequency
        </label>
        <select
          className="w-full p-3 border bg-white border-gray-300 rounded-md"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          required
        >
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      {memberCount >= 1 && contributionAmount > 0 && (
        <CircleSummary
          memberCount={memberCount}
          contributionAmount={contributionAmount}
          totalPot={totalPot}
          totalPeriods={totalPeriods}
          frequency={frequency}
        />
      )}

      <button
        type="submit"
        className="w-full bg-[#079669] text-white p-3 rounded-xl font-medium flex items-center justify-center"
      >
        <img
          src="/icons/lock_white.svg"
          alt="Create Circle"
          className="w-4 h-4 mr-2"
        />
        Create Adashe
      </button>
    </form>
  );
};

export default CreateCircleForm;
