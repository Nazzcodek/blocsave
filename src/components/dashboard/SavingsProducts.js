import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import Card from "@/components/common/Card";
import Image from "next/image";
import { getQuickSaveBalance } from "@/services/blockchain/useQuickSaveBalance";
import { getSafelockSummary } from "@/services/blockchain/useSafeLockHistory";

const ProductCard = ({ product, actualBalance }) => {
  const { type, description } = product;

  const balance =
    (type.toLowerCase() === "quicksave" || type.toLowerCase() === "safelock") &&
    actualBalance !== null
      ? actualBalance
      : product.balance;

  const getBackgroundColor = () => {
    switch (type.toLowerCase()) {
      case "quicksave":
        return "bg-blue-50";
      case "safelock":
        return "bg-green-50";
      case "adashe":
        return "bg-purple-50";
      default:
        return "bg-gray-50";
    }
  };

  const getBorderColor = () => {
    switch (type.toLowerCase()) {
      case "quicksave":
        return "border-blue-200";
      case "safelock":
        return "border-green-200";
      case "adashe":
        return "border-purple-200";
      default:
        return "border-gray-200";
    }
  };

  const getIconBgColor = () => {
    switch (type.toLowerCase()) {
      case "quicksave":
        return "bg-blue-100";
      case "safelock":
        return "bg-green-100";
      case "adashe":
        return "bg-purple-100";
      default:
        return "bg-gray-100";
    }
  };

  const getIconPath = () => {
    return `/icons/${type.toLowerCase()}.svg`;
  };

  const getTitleColor = () => {
    switch (type.toLowerCase()) {
      case "quicksave":
        return "text-blue-600";
      case "safelock":
        return "text-green-600";
      case "adashe":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  // Display loading state if the product is loading its balance
  const isLoading = product.balanceLoading;

  return (
    <Link href={`/${type.toLowerCase()}`}>
      <Card
        className={`cursor-pointer transition-all hover:shadow-md border ${getBorderColor()}`}
        noPadding
      >
        <div className={`p-4 sm:p-6 ${getBackgroundColor()}`}>
          <div className="flex items-center mb-4">
            <div
              className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getIconBgColor()}`}
            >
              <Image
                src={getIconPath()}
                alt={`${type} icon`}
                width={24}
                height={24}
                className="text-current"
              />
            </div>
            <h3 className={`font-medium ml-3 ${getTitleColor()}`}>{type}</h3>
          </div>

          {isLoading ? (
            <div className="animate-pulse h-7 bg-gray-200 rounded w-24 mb-2"></div>
          ) : (
            <p className="text-xl sm:text-2xl font-bold mt-2">
              ${typeof balance === "number" ? balance.toFixed(2) : "0.00"}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </Card>
    </Link>
  );
};

const SavingsProducts = () => {
  const { savingsProducts } = useSelector((state) => state.dashboard);
  const { wallets } = useWallets();
  const [quickSaveBalance, setQuickSaveBalance] = useState(null);
  const [safeLockBalance, setSafeLockBalance] = useState(null);
  const [isLoadingQuickSave, setIsLoadingQuickSave] = useState(true);
  const [isLoadingSafeLock, setIsLoadingSafeLock] = useState(true);

  // Get the embedded wallet
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  // Fetch actual QuickSave balance from blockchain
  useEffect(() => {
    const fetchQuickSaveBalance = async () => {
      try {
        setIsLoadingQuickSave(true);
        if (embeddedWallet) {
          const balance = await getQuickSaveBalance(embeddedWallet);
          setQuickSaveBalance(balance);
        }
      } catch (error) {
        console.error("Error fetching QuickSave balance:", error);
      } finally {
        setIsLoadingQuickSave(false);
      }
    };

    fetchQuickSaveBalance();

    // Refresh every 30 seconds
    const intervalId = setInterval(fetchQuickSaveBalance, 30000);
    return () => clearInterval(intervalId);
  }, [embeddedWallet]);

  // Fetch actual SafeLock balance from blockchain
  useEffect(() => {
    const fetchSafeLockBalance = async () => {
      try {
        setIsLoadingSafeLock(true);
        if (embeddedWallet) {
          const summary = await getSafelockSummary(embeddedWallet);
          setSafeLockBalance(summary.totalBalance);
        }
      } catch (error) {
        console.error("Error fetching SafeLock balance:", error);
      } finally {
        setIsLoadingSafeLock(false);
      }
    };

    fetchSafeLockBalance();

    // Refresh every 30 seconds
    const intervalId = setInterval(fetchSafeLockBalance, 30000);
    return () => clearInterval(intervalId);
  }, [embeddedWallet]);

  // Add loading and actual balance data to products
  const enhancedProducts = savingsProducts.map((product) => {
    const productType = product.type.toLowerCase();

    if (productType === "quicksave") {
      return {
        ...product,
        balanceLoading: isLoadingQuickSave,
      };
    }

    if (productType === "safelock") {
      return {
        ...product,
        balanceLoading: isLoadingSafeLock,
      };
    }

    return product;
  });

  return (
    <div>
      <h2 className="text-[18px] font-bold text-gray-900 mb-4">My Savings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {enhancedProducts.map((product) => (
          <ProductCard
            key={product.type}
            product={product}
            actualBalance={
              product.type.toLowerCase() === "quicksave"
                ? quickSaveBalance
                : product.type.toLowerCase() === "safelock"
                ? safeLockBalance
                : null
            }
          />
        ))}
      </div>
    </div>
  );
};

export default SavingsProducts;
