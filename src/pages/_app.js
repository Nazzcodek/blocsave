import { Provider } from "react-redux";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import store from "../redux/store";
import Layout from "../components/common/Layout";
import { WalletProviders } from "../components/wallet/Providers";
import ModalController from "../components/common/ModalController";
import "../styles/globals.css";

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

  // Custom auth check could be added here if needed
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = localStorage.getItem('token');
  //     if (!token && !router.pathname.includes('/auth/')) {
  //       router.push('/auth/login');
  //     } else {
  //       setIsAuthenticated(true);
  //     }
  //   };
  //   checkAuth();
  // }, [router.pathname]);

  return (
    <Provider store={store}>
      <WalletProviders>
        {/* If loading is needed, add a loading spinner here */}
        {loading && (
          <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-50 z-50">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Wrap all pages in our global layout */}
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ModalController />
      </WalletProviders>
    </Provider>
  );
}

export default MyApp;
