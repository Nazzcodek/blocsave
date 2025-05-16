import React, { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import Card from "@/components/common/Card";

const Login = () => {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const { redirect } = router.query;

  useEffect(() => {
    if (ready && authenticated) {
      // If user is already authenticated, redirect them
      router.push(redirect || "/dashboard");
    }
  }, [ready, authenticated, router, redirect]);

  if (!ready) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="/icons/logo-green.svg"
            alt="Logo"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Get started with your secure wallet and savings experience
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={login}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </span>
            Sign in with Email or Wallet
          </button>

          <div className="text-sm text-center">
            <p className="text-gray-600">
              By signing in, you agree to our Terms and Privacy Policy
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
