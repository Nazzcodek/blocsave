/**
 * Wagmi configuration module
 * This file configures wallet connections using wagmi and viem
 * for interacting with blockchain networks
 */

import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

/**
 * Coinbase Wallet connector configured for Smart Wallet usage
 * @type {import('wagmi').CoinbaseWalletConnector}
 */
export const cbWalletConnector = coinbaseWallet({
  appName: "Base Savings App",
  preference: "smartWalletOnly",
});

/**
 * Wagmi configuration for blockchain interactions
 * Sets up the chains, connectors and transports for wallet connections
 * @type {import('wagmi').Config}
 */
export const config = createConfig({
  chains: [baseSepolia],
  // turn off injected provider discovery
  multiInjectedProviderDiscovery: false,
  connectors: [cbWalletConnector],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
});
