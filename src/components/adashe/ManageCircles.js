import React from "react";
import { useSelector } from "react-redux";
import CircleItem from "./CircleItem";

const ManageCircles = ({ onViewDetails }) => {
  const { circles, isLoading } = useSelector((state) => state.adashe);

  if (isLoading) {
    return <div className="text-center p-8">Loading circles...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Active Adashe</h2>
      {circles && circles.length > 0 ? (
        <div className="space-y-3">
          {circles.map((circle) => (
            <CircleItem
              key={circle.id}
              circle={circle}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No active Adashe groups found</p>
        </div>
      )}
    </div>
  );
};

export default ManageCircles;
