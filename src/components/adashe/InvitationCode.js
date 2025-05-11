import React, { useState } from "react";

const InvitationCode = ({ circle }) => {
  if (!circle) return null;

  const { invitationCode, members } = circle;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationCode);
    setCopied(true);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold">Invitation Code</h2>
      <p className="text-gray-600 text-[11px] mb-4">
        Share this code to invite others to join
      </p>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-6">
        <span className="text-[12px] font-semibold">{invitationCode}</span>
        <div className="flex flex-col items-center">
          <button
            onClick={copyToClipboard}
            className="text-gray-500 hover:text-gray-700"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-500">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <img src="/icons/copy.svg" alt="Copy" className="w-4 h-4" />
            )}
          </button>
          {copied && (
            <span className="text-[8px] text-green-500 mt-1">Copied!</span>
          )}
        </div>
      </div>
      <hr className="border-gray-200 mb-2" />
      <h3 className="font-medium text-sm mb-2">Members ({members.length})</h3>
      <div className="space-y-0">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex flex-col pb-3 pt-3 border-b border-gray-200"
          >
            <div className="flex items-center mb-1">
              {member.name === "You" ? (
                <span className="inline-flex items-center text-[10px] font-medium mr-2">
                  {member.name}
                  <img
                    src="/icons/crown.svg"
                    alt="Crown"
                    className="w-3 h-3 ml-1"
                  />
                </span>
              ) : (
                <span className="text-[10px] font-medium mr-2">
                  {member.name}
                </span>
              )}
            </div>
            <div className="text-[8px] text-gray-500 truncate">
              {member.address}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvitationCode;
