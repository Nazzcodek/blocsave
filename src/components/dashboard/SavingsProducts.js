import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import Card from "@/components/common/Card";
import Image from "next/image";

const ProductCard = ({ product }) => {
  const { type, balance, description } = product;

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
      case "adsafshe":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

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
          <p className="text-xl sm:text-2xl font-bold mt-2">${balance}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </Card>
    </Link>
  );
};

const SavingsProducts = () => {
  const { savingsProducts } = useSelector((state) => state.dashboard);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">My Savings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {savingsProducts.map((product) => (
          <ProductCard key={product.type} product={product} />
        ))}
      </div>
    </div>
  );
};

export default SavingsProducts;
