import React, { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { getQuickSaveBalance } from "@/services/blockchain/useQuickSaveBalance";

const QuicksaveCard = ({ balance, isLoading }) => {
  const { wallets } = useWallets();
  const [actualBalance, setActualBalance] = useState(balance || 0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(isLoading);

  useEffect(() => {
    async function fetchBlockchainBalance() {
      if (wallets && wallets.length > 0) {
        setIsLoadingBalance(true);
        const embeddedWallet = wallets.find(
          (wallet) => wallet.walletClientType === "privy"
        );

        if (embeddedWallet) {
          try {
            const blockchainBalance = await getQuickSaveBalance(embeddedWallet);
            setActualBalance(blockchainBalance);
          } catch (error) {
            console.error("Error fetching QuickSave balance:", error);
            // Fall back to the provided balance prop if blockchain fetch fails
            setActualBalance(balance || 0);
          } finally {
            setIsLoadingBalance(false);
          }
        } else {
          setIsLoadingBalance(false);
        }
      }
    }

    fetchBlockchainBalance();

    // Set up polling to refresh the balance every 30 seconds
    const intervalId = setInterval(fetchBlockchainBalance, 30000);

    return () => clearInterval(intervalId);
  }, [wallets, balance]);

  return (
    <div className="bg-[#D1FAE5] rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2 pl-2">
        <div className="bg-[#0796691a] rounded-full p-2">
          <img
            src="/icons/wallet_green.svg"
            alt="Quicksave"
            className="w-5 h-5 text-[#079669]"
          />
        </div>
        <span className="font-medium text-[#079669]">Quicksave</span>
      </div>

      <div className="mt-6">
        {isLoadingBalance ? (
          <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
        ) : (
          <h2 className="text-2xl font-bold">
            ${actualBalance.toFixed(2) || "0.00"}
          </h2>
        )}
        <p className="text-sm text-gray-500">
          Daily interest, withdraw anytime
        </p>
      </div>
    </div>
  );
};

export default QuicksaveCard;
