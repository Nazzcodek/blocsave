import React from "react";
import Card from "@/components/common/Card";
import Image from "next/image";

const PaymentMethodSelector = ({ selectedMethod, onMethodSelect }) => {
  const paymentMethods = [
    {
      id: "bank-transfer",
      name: "Bank Transfer",
      icon: "/icons/Bank.svg",
      description: "Direct deposit from your bank account",
    },
    {
      id: "crypto",
      name: "Crypto Transfer",
      icon: "/icons/wallet_green.svg",
      description: "Transfer from an external wallet",
    },
  ];

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto py-1">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Select Payment Method
      </h3>

      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-md cursor-pointer p-3 transition-colors ${
              selectedMethod === method.id
                ? "border-2 border-[#079669] bg-green-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => onMethodSelect(method.id)}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                {method.icon ? (
                  <div className="relative h-5 w-5">
                    <Image
                      src={method.icon}
                      alt={method.name}
                      width={20}
                      height={20}
                    />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full bg-gray-400"></div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{method.name}</p>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <div
                  className={`h-5 w-5 rounded-full border ${
                    selectedMethod === method.id
                      ? "border-[#079669] bg-[#079669]"
                      : "border-gray-300"
                  } flex items-center justify-center`}
                >
                  {selectedMethod === method.id && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
