import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import ContributeModal from "./ContributeModal";
import Image from "next/image";
import { useWallets } from "@privy-io/react-auth";
import { getDetailedMembers } from "@/services/blockchain/useAdashe";

const InvitationCode = ({ circle }) => {
  // Move all hooks to the top level before any conditional returns
  const [copied, setCopied] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [detailedMembers, setDetailedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { wallets } = useWallets();
  const embeddedWallet = wallets?.[0];
  const userAddress = wallets && wallets[0]?.address?.toLowerCase();

  // Use the contract address as the invitation code instead of circle name
  const invitationCodeValue = circle?.address || circle?.contractAddress;

  useEffect(() => {
    const fetchDetailedMembers = async () => {
      if (!embeddedWallet || !invitationCodeValue || !circle) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(
          "[InvitationCode] Fetching detailed members for:",
          invitationCodeValue
        );

        const members = await getDetailedMembers(
          embeddedWallet,
          invitationCodeValue,
          userAddress
        );

        setDetailedMembers(members);
      } catch (error) {
        console.error(
          "[InvitationCode] Failed to fetch detailed members:",
          error
        );
        // Fallback to existing members if available
        setDetailedMembers(circle.members || []);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedMembers();
  }, [embeddedWallet, invitationCodeValue, userAddress, circle]);

  // Return early after all hooks are called
  if (!circle) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationCodeValue);
    setCopied(true);

    // Reset after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleContribute = () => {
    setShowContributeModal(true);
  };

  const handleCloseContributeModal = () => {
    setShowContributeModal(false);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold">Invitation Code</h2>
      <p className="text-gray-600 text-[11px] mb-4">
        Share this code to invite others to join
      </p>

      {/* Contribute button */}
      <button
        onClick={handleContribute}
        className="w-full bg-[#079669] text-white text-sm font-medium py-2 px-4 rounded-md mb-4 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Contribute to this circle
      </button>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-6">
        <span className="text-[12px] font-semibold truncate flex-1 mr-2">
          {invitationCodeValue}
        </span>
        <div className="flex flex-col items-center">
          <button
            onClick={copyToClipboard}
            className="text-gray-500 hover:text-gray-700"
          >
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-green-500"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <Image
                src="/icons/copy.svg"
                alt="Copy"
                width={16}
                height={16}
                className="mr-2"
              />
            )}
          </button>
          {copied && (
            <span className="text-[8px] text-green-500 mt-1">Copied!</span>
          )}
        </div>
      </div>

      <hr className="border-gray-200 mb-2" />
      <h3 className="font-medium text-sm mb-2">
        Members ({detailedMembers.length})
      </h3>
      <div className="space-y-0">
        {detailedMembers.map((member) => {
          return (
            <div
              key={member.address}
              className="flex flex-col pb-3 pt-3 border-b border-gray-200"
            >
              <div className="flex items-center mb-1">
                {member.isCurrentUser ? (
                  <span className="inline-flex items-center text-[10px] font-medium mr-2">
                    You
                    {member.isOwner && (
                      <Image
                        src="/icons/crown.svg"
                        alt="Crown"
                        width={12}
                        height={12}
                        className="ml-1"
                      />
                    )}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium mr-2 inline-flex items-center">
                    {member.name || member.address}
                    {member.isOwner && (
                      <Image
                        src="/icons/crown.svg"
                        alt="Crown"
                        width={12}
                        height={12}
                        className="ml-1"
                      />
                    )}
                  </span>
                )}
              </div>
              <div className="text-[8px] text-gray-500 truncate">
                {member.address}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribute Modal */}
      {showContributeModal && (
        <ContributeModal circle={circle} onClose={handleCloseContributeModal} />
      )}
    </div>
  );
};

export default InvitationCode;
