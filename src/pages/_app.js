import { Provider } from "react-redux";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import store from "../redux/store";
import Layout from "../components/common/Layout";
import AuthWrapper from "../components/common/AuthWrapper";
import { WalletProviders } from "../components/wallet/Providers";
import ModalController from "../components/common/ModalController";
import FundModalManager from "../components/dashboard/modals/FundModalManager";
import PrivyOffRampModalController from "../components/dashboard/modals/PrivyOffRampModalController";
import "../styles/globals.css";
import { baseSepolia, base } from "viem/chains";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Handle route change loading states
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
      config={{
        // Create embedded wallets for users who don't have a wallet
        defaultChain: base,
        supportedChains: [base, baseSepolia],
        embeddedWallets: {
          createOnLogin: "users-without-wallets"
        },
      }}
    >
      <Provider store={store}>
        <WalletProviders>
          {/* If loading is needed, add a loading spinner here */}
          {loading && (
            <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-50 z-50">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          )}
          {/* Wrap all pages in our AuthWrapper */}
          <AuthWrapper>
            {/* Conditionally apply Layout except for home page */}
            {router.pathname === "/home" ? (
              <Component {...pageProps} />
            ) : (
              <Layout>
                <Component {...pageProps} />
              </Layout>
            )}
          </AuthWrapper>
          <ModalController />
          <FundModalManager />
          <PrivyOffRampModalController />
        </WalletProviders>
      </Provider>
    </PrivyProvider>
  );
}

export default MyApp;
