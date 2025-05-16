import { usePrivy } from "@privy-io/react-auth";
import React from "react";
import { useRouter } from "next/router";

const UserProfile = () => {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!ready || !authenticated) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-4 p-3 rounded-lg hover:bg-gray-50">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="User Avatar"
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-primary-600 font-semibold">
              {user?.email?.charAt(0)?.toUpperCase() ||
                user?.wallet?.address?.substring(0, 2)}
            </span>
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">
            {user?.email ||
              user?.wallet?.address?.substring(0, 6) +
                "..." +
                user?.wallet?.address?.substring(
                  user?.wallet?.address.length - 4
                )}
          </p>
          <p className="text-xs text-gray-500">
            {user?.email ? "Email Login" : "Wallet Login"}
          </p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Sign Out
      </button>
    </div>
  );
};

export default UserProfile;
