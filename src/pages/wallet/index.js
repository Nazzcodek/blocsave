import React from "react";
import { ConnectAndSIWE } from "@/components/wallet/ConnectAndSIWE";
import Card from "@/components/common/Card";
import SmartWalletBalance from "@/components/wallet/SmartWalletBalance";

const WalletPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Connect Your Smart Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="mb-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Base Smart Wallet</h2>
              <p className="text-gray-600 text-sm mb-4">
                Connect your Base Smart Wallet to access on-chain savings
                features and manage your digital assets.
              </p>

              <ConnectAndSIWE />
            </div>
          </Card>
        </div>

        <div>
          <SmartWalletBalance />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <h3 className="font-bold mb-2">Why use Smart Wallet?</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
            <li>No need to manage seed phrases or private keys</li>
            <li>Better security with advanced features</li>
            <li>Lower gas fees through account abstraction</li>
            <li>Seamless integration with Base ecosystem</li>
          </ul>
        </Card>

        <Card>
          <h3 className="font-bold mb-2">Smart Wallet Features</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
            <li>Access to on-chain savings protocols</li>
            <li>Better yield opportunities</li>
            <li>Interoperability with other dApps</li>
            <li>Enhanced security for your digital assets</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default WalletPage;
