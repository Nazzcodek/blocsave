import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import Card from "@/components/common/Card";
import Image from "next/image";
import { getQuickSaveBalance } from "@/services/blockchain/useQuickSaveBalance";

const ProductCard = ({ product, actualBalance }) => {
  const { type, description } = product;

  // Use actualBalance if available (for QuickSave), otherwise use the product balance
  const balance =
    type.toLowerCase() === "quicksave" && actualBalance !== null
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

  // Display loading state if the type is quicksave and balanceLoading is true
  const isLoading =
    type.toLowerCase() === "quicksave" && product.balanceLoading;

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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch actual QuickSave balance from blockchain
  useEffect(() => {
    const fetchQuickSaveBalance = async () => {
      try {
        setIsLoading(true);
        const embeddedWallet = wallets?.find(
          (wallet) => wallet.walletClientType === "privy"
        );

        if (embeddedWallet) {
          const balance = await getQuickSaveBalance(embeddedWallet);
          setQuickSaveBalance(balance);
        }
      } catch (error) {
        console.error("Error fetching QuickSave balance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuickSaveBalance();

    // Refresh every 30 seconds
    const intervalId = setInterval(fetchQuickSaveBalance, 30000);
    return () => clearInterval(intervalId);
  }, [wallets]);

  // Add loading and actual balance data to products
  const enhancedProducts = savingsProducts.map((product) => {
    if (product.type.toLowerCase() === "quicksave") {
      return {
        ...product,
        balanceLoading: isLoading,
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
                : null
            }
          />
        ))}
      </div>
    </div>
  );
};

export default SavingsProducts;
