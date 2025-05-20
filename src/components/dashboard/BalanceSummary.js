import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { formatUnits } from "viem";
import Image from "next/image";
import Card from "@/components/common/Card";
import { openModal } from "@/redux/slices/modalSlice";
import { openFundModal } from "@/redux/slices/fundModalSlice";
import getWalletUSDCBalance from "@/services/blockchain/useWalletUSDCBalance";
import { getQuickSaveBalance } from "@/services/blockchain/useQuickSaveBalance";

// Custom version of ActionButton for the Balance cards
const BalanceActionButton = ({
  icon,
  title,
  primary = false,
  onClick,
  description,
}) => {
  return (
    <div className="cursor-pointer flex flex-col">
      <button
        className={`px-3 py-1.5 rounded-md flex items-center justify-center text-xs w-full sm:w-auto ${
          primary
            ? "bg-[#079669] text-white"
            : "border border-gray-300 bg-white text-gray-800"
        }`}
        onClick={onClick}
      >
        <span className={`mr-2 ${primary ? "text-white" : "text-[#079669]"}`}>
          {icon}
        </span>
        {title}
      </button>
      <div className="text-[10px] text-gray-500 mt-2 max-w-[130px]">
        {description}
      </div>
    </div>
  );
};

// Helper function to format currency with gray decimals
const FormatAmount = ({ amount }) => {
  if (!amount && amount !== 0)
    return <span className="text-2xl font-bold">$0</span>;

  const parts = amount.toString().split(".");
  const wholePart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : "";

  return (
    <>
      <span className="text-2xl font-bold">${wholePart}</span>
      {decimalPart && (
        <span className="text-gray-400 text-sm">.{decimalPart}</span>
      )}
    </>
  );
};

const BalanceSummary = () => {
  const dispatch = useDispatch();
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { walletBalance, savingsBalance } = useSelector(
    (state) => state.dashboard
  );

  const [usdcWalletBalance, setUsdcWalletBalance] = useState(null);
  const [quicksaveBalance, setQuicksaveBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch USDC wallet balance and QuickSave balance
  useEffect(() => {
    const fetchBalances = async () => {
      if (!ready || !authenticated || !user) {
        return;
      }

      try {
        setIsLoadingBalance(true);

        const embeddedWallet = wallets?.find(
          (wallet) => wallet.walletClientType === "privy"
        );

        if (!embeddedWallet) {
          console.error("No embedded wallet found");
          return;
        }

        // Get USDC balance
        const usdcBalance = await getWalletUSDCBalance(embeddedWallet);
        console.log("USDC Wallet Balance:", usdcBalance);
        setUsdcWalletBalance(usdcBalance.toFixed(2));

        // Get QuickSave balance
        const qsBalance = await getQuickSaveBalance(embeddedWallet);
        console.log("QuickSave Balance:", qsBalance);
        setQuicksaveBalance(qsBalance.toFixed(2));
      } catch (error) {
        console.error("Error fetching balances:", error);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalances();

    // Refresh balances every 30 seconds
    const intervalId = setInterval(() => fetchBalances(), 30000);
    return () => clearInterval(intervalId);
  }, [ready, authenticated, user, wallets]);

  const handleFundWallet = () => {
    dispatch(openFundModal());
  };

  const handleWithdrawWallet = () => {
    dispatch(
      openModal({
        modalType: "WITHDRAW_WALLET",
        modalProps: { source: "bank" },
      })
    );
  };

  const handleWithdrawSavings = () => {
    dispatch(
      openModal({
        modalType: "WITHDRAW_SAVINGS",
        modalProps: { source: "savings" },
      })
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="w-full">
        <Card className="bg-white h-full min-h-[200px]" noPadding>
          <div className="p-4 sm:p-6 flex flex-col h-full">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              My Wallet
            </h3>
            <div className="flex items-baseline mb-8 sm:mb-16">
              {isLoadingBalance ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <FormatAmount
                    amount={
                      usdcWalletBalance !== null
                        ? usdcWalletBalance
                        : walletBalance?.amount || "0.00"
                    }
                  />
                  <span className="ml-1 text-gray-400 text-sm">USDC</span>
                </>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex flex-col sm:flex-row gap-3 justify-start">
                <BalanceActionButton
                  icon={
                    <div className="relative w-4 h-4">
                      <Image
                        src="/icons/wallet.svg"
                        alt="Fund Wallet"
                        width={16}
                        height={16}
                        className="brightness-0 invert"
                      />
                    </div>
                  }
                  title="Fund Account"
                  primary={true}
                  onClick={handleFundWallet}
                  description="Add USDC to your wallet balance"
                />

                <BalanceActionButton
                  icon={
                    <div className="relative w-4 h-4">
                      <Image
                        src="/icons/wallet-minus.svg"
                        alt="Withdraw"
                        width={16}
                        height={16}
                        className="text-[#079669]"
                      />
                    </div>
                  }
                  title="Withdraw"
                  onClick={handleWithdrawWallet}
                  description="Withdraw directly to your Bank account"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* <div className="w-full">
        <Card className="bg-white h-full min-h-[200px]" noPadding>
          <div className="p-4 sm:p-6 flex flex-col h-full">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Savings Balance
            </h3>
            <div className="flex items-baseline mb-8 sm:mb-16">
              {isLoadingBalance ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <FormatAmount
                    amount={
                      quicksaveBalance !== null
                        ? quicksaveBalance
                        : savingsBalance?.amount || "0.00"
                    }
                  />
                  <span className="ml-1 text-gray-400 text-sm">USDC</span>
                </>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex justify-start">
                <BalanceActionButton
                  icon={
                    <div className="relative w-4 h-4">
                      <Image
                        src="/icons/wallet-minus.svg"
                        alt="Withdraw"
                        width={16}
                        height={16}
                        className="text-[#079669]"
                      />
                    </div>
                  }
                  title="Withdraw"
                  onClick={handleWithdrawSavings}
                  description="Withdraw directly to your Bank account"
                />
              </div>
            </div>
          </div>
        </Card>
      </div> */}
    </div>
  );
};

export default BalanceSummary;
