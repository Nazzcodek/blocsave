import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

const publicPaths = [
  "/",
  "/home",
  "/auth/login",
  // Add other public paths here
];

const AuthWrapper = ({ children }) => {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    // Only check authentication after Privy is ready
    if (ready) {
      const isPublicPath = publicPaths.some(
        (path) => router.pathname === path || router.pathname.startsWith(path)
      );

      if (!authenticated && !isPublicPath) {
        // Redirect unauthenticated users to login page
        router.push("/");
      }
    }
  }, [ready, authenticated, router]);

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        <span className="ml-3">Loading authentication...</span>
      </div>
    );
  }

  return children;
};

export default AuthWrapper;
