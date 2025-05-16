import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { HiMenu } from "react-icons/hi";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";

const Header = ({ toggleMobileSidebar }) => {
  const { user: storeUser } = useSelector((state) => state.auth);
  const { user: privyUser, ready, authenticated, logout } = usePrivy();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleMenuClick = () => {
    console.log("Menu clicked, toggling sidebar");
    toggleMobileSidebar();
  };

  const truncateAddress = (address) => {
    if (!address || typeof address !== "string") return "0x";
    const start = address.substring(0, 6);
    const end = address.substring(address.length - 4);
    return `${start}...${end}`;
  };

  const copyToClipboard = (text) => {
    if (typeof text === "string") {
      navigator.clipboard.writeText(text);
      console.log("Copied to clipboard:", text);
    }
  };

  // Get wallet address safely
  const getWalletAddress = () => {
    // Check if privyUser exists and has a wallet array
    if (privyUser?.wallet && typeof privyUser.wallet === "object") {
      // Handle if wallet is an object with address property
      if (privyUser.wallet.address && typeof privyUser.wallet.address === "string") {
        return privyUser.wallet.address;
      }

      // Handle if wallet is an array of wallets
      if (Array.isArray(privyUser.wallets) && privyUser.wallets.length > 0) {
        const firstWallet = privyUser.wallets[0];
        if (typeof firstWallet === "object" && firstWallet?.address) {
          return firstWallet.address;
        }
      }
    }

    // Fallback to store user ID
    return storeUser?.userId || "";
  };

  // Safely get user email
  const getUserEmail = () => {
    // First check if email is directly available as a string
    if (privyUser?.email && typeof privyUser.email === 'string') {
      return privyUser.email;
    }
    
    // Check if user has linked accounts with email
    if (Array.isArray(privyUser?.linkedAccounts)) {
      // Find the first linked account with email type
      const emailAccount = privyUser.linkedAccounts.find(
        account => account.type === 'email'
      );
      if (emailAccount?.address) {
        return emailAccount.address;
      }
    }
    
    // Check if email is stored in a different format
    if (privyUser?.verifiedEmails && Array.isArray(privyUser.verifiedEmails) && privyUser.verifiedEmails.length > 0) {
      return privyUser.verifiedEmails[0];
    }
    
    // Fallback to store user email
    return storeUser?.email || "";
  };

  const userAddress = getWalletAddress();
  const userEmail = getUserEmail();
  const displayAddress = truncateAddress(userAddress);

  // Navigate to profile page
  const navigateToProfile = () => {
    router.push("/profile");
    setIsDropdownOpen(false);
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between bg-white">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          className="lg:hidden flex items-center"
          onClick={handleMenuClick}
          aria-label="Open sidebar"
        >
          <HiMenu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Logo - Mobile only */}
        <div className="lg:hidden ml-4">
          <Image
            src="/icons/logo-green.svg"
            alt="Blocsave logo"
            width={28}
            height={28}
            priority
          />
        </div>
      </div>

      {/* Right section with user info and dropdown */}
      <div className="ml-auto relative" ref={dropdownRef}>
        {!ready ? (
          <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
        ) : authenticated || storeUser ? (
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-4 py-2 rounded bg-[#079669] text-white hover:bg-[#068256] transition-colors"
          >
            <span className="text-sm font-medium mr-2">
              {userEmail ? userEmail.split('@')[0] : displayAddress || "User"}
            </span>
            {isDropdownOpen ? (
              <FiChevronUp className="w-4 h-4" />
            ) : (
              <FiChevronDown className="w-4 h-4" />
            )}
          </button>
        ) : (
          <button
            onClick={() => router.push("/auth/login")}
            className="flex items-center px-4 py-2 rounded bg-[#079669] text-white hover:bg-[#068256] transition-colors"
          >
            <span className="text-sm font-medium">Log In</span>
          </button>
        )}

        {/* Dropdown Menu */}
        {isDropdownOpen && (authenticated || storeUser) && (
          <div className="absolute right-0 mt-2 w-64 sm:w-64 xs:w-56 bg-white rounded shadow-md z-50 border border-gray-100">
            {/* Menu Items */}
            <div className="py-1">
              {/* Profile Link - Added this section */}
              <button
                onClick={navigateToProfile}
                className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-50"
              >
                <img
                  src="/icons/user.svg"
                  alt="Profile"
                  className="w-5 h-5 mr-3 text-gray-500"
                />
                <span className="text-[14px] text-gray-800">View Profile</span>
              </button>
              
              {/* User ID with copy button */}
              <div className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/icons/user-wallet.svg"
                    alt="User"
                    className="w-5 h-5 mr-3 text-gray-500"
                  />
                  <span className="text-[14px] sm:text-[14px] xs:text-[12px] text-gray-800 truncate">
                    {displayAddress || "0x1....4ddeyd"}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(userAddress)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Copy address"
                >
                  <img src="/icons/copy.svg" alt="Copy" className="w-5 h-5" />
                </button>
              </div>
              <button className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-50">
                <img
                  src="/icons/safelock.svg"
                  alt="MFA"
                  className="w-5 h-5 mr-3 text-gray-500"
                />
                <span className="text-[14px] text-gray-800">Enable MFA</span>
              </button>

              <div className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/icons/mail.svg"
                    alt="Email"
                    className="w-5 h-5 mr-3"
                  />
                  <span className="text-[14px] text-gray-800">
                    Linked email
                  </span>
                </div>
                <span className="text-[10px] text-gray-500">
                  {userEmail || "No email linked"}
                </span>
              </div>

              <button className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-50">
                <img
                  src="/icons/key.svg"
                  alt="Wallet"
                  className="w-5 h-5 mr-3 text-gray-500"
                />
                <span className="text-[14px] text-gray-800">Export Wallet</span>
              </button>

              <button className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-50">
                <img
                  src="/icons/messages.svg"
                  alt="Contact"
                  className="w-5 h-5 mr-3 text-gray-500"
                />
                <span className="text-[14px] text-gray-800">
                  Contact Support
                </span>
              </button>
            </div>

            {/* Log Out Button */}
            <div className="border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-50"
              >
                <img
                  src="/icons/logout-right.svg"
                  alt="Log Out"
                  className="w-5 h-5 mr-3 text-gray-500"
                />
                <span className="text-[14px] text-gray-800">Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
