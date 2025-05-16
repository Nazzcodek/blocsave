import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

const ProfilePage = () => {
  const { user, authenticated, ready, logout } = usePrivy();
  const [isEditing, setIsEditing] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (!ready) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            You must be logged in to view your profile
          </h2>
          <Button onClick={() => (window.location.href = "/auth/login")}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  // Format wallet address
  const formatAddress = (address) => {
    if (!address || typeof address !== "string") return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Get wallet address safely
  const getWalletAddress = () => {
    // Check if user exists and has a wallet
    if (user?.wallet && typeof user.wallet === "object") {
      // Handle if wallet is an object with address property
      if (user.wallet.address && typeof user.wallet.address === "string") {
        return user.wallet.address;
      }
    }

    // Handle if user has wallets array
    if (Array.isArray(user?.wallets) && user.wallets.length > 0) {
      const firstWallet = user.wallets[0];
      if (typeof firstWallet === "object" && firstWallet?.address) {
        return firstWallet.address;
      }
    }

    return "";
  };

  // Get user's email safely
  const getUserEmail = () => {
    // First check if email is directly available as a string
    if (user?.email && typeof user.email === "string") {
      return user.email;
    }

    // Check if user has linked accounts with email
    if (Array.isArray(user?.linkedAccounts)) {
      // Find the first linked account with email type
      const emailAccount = user.linkedAccounts.find(
        (account) => account.type === "email"
      );
      if (emailAccount?.address) {
        return emailAccount.address;
      }
    }

    // Check if email is stored in a different format
    if (
      user?.verifiedEmails &&
      Array.isArray(user.verifiedEmails) &&
      user.verifiedEmails.length > 0
    ) {
      return user.verifiedEmails[0];
    }

    return "";
  };

  const walletAddress = getWalletAddress();
  const userEmail = getUserEmail();

  // Get first character for avatar display
  const getAvatarInitial = () => {
    if (userEmail && typeof userEmail === "string" && userEmail.length > 0) {
      return userEmail.charAt(0).toUpperCase();
    }

    if (
      walletAddress &&
      typeof walletAddress === "string" &&
      walletAddress.length > 0
    ) {
      return walletAddress.substring(0, 2);
    }

    return "U"; // Default fallback
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 col-span-1">
          <div className="flex flex-col items-center mb-6">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                className="rounded-full w-32 h-32 mb-4 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <span className="text-4xl text-primary-600 font-semibold">
                  {getAvatarInitial()}
                </span>
              </div>
            )}
            <h2 className="text-xl font-semibold">
              {userEmail || formatAddress(walletAddress) || "User"}
            </h2>
            <p className="text-gray-500 text-sm">
              {userEmail ? "Email Login" : "Wallet Login"}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Account Details */}
        <Card className="p-6 col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Account Details</h2>
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  defaultValue={userEmail || ""}
                  disabled={!userEmail}
                  placeholder="No email associated"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded-md">
                  {userEmail || "No email associated"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address
              </label>
              <div className="p-2 bg-gray-50 rounded-md flex justify-between items-center">
                <span className="text-sm font-mono break-all">
                  {walletAddress || "No wallet connected"}
                </span>
                {walletAddress && (
                  <button
                    onClick={() => navigator.clipboard.writeText(walletAddress)}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>

            {isEditing && <Button className="mt-4 w-full">Save Changes</Button>}
          </div>
        </Card>
      </div>

      {/* Security Settings */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-6">Security Settings</h2>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Export Wallet</h3>
              <p className="text-sm text-gray-500">
                Export your wallet credentials securely
              </p>
            </div>
            <Button variant="outline">Export</Button>
          </div>
        </div>
      </Card>

      {/* Transaction History Card - Would need to be implemented with real data */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
        <div className="text-center text-gray-500 py-6">
          No recent activity to display
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
