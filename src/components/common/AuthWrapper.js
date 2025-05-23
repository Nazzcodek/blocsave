import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image";

const publicPaths = [
  "/",
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
        <div className="animate-pulse">
          <Image
            src="/icons/logo-green.svg"
            alt="Blocsave logo"
            width={80}
            height={80}
            priority
            className="animate-[pulse_2s_ease-in-out_infinite]"
          />
        </div>
      </div>
    );
  }

  return children;
};

export default AuthWrapper;
