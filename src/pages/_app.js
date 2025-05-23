import { Provider } from "react-redux";
import { usePathname } from "next/navigation";
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
import { baseSepolia } from "viem/chains";

function MyApp({ Component, pageProps }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  // Handle route change loading states
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        defaultChain: baseSepolia,
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        appearance: {
          theme: 'light',
          accentColor: '#079669',
        },
        loginMethods: ['email', 'wallet'],
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
            {pathname === "/" ? (
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
