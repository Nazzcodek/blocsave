import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import {
  RiLogoutBoxLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
} from "react-icons/ri";

const Sidebar = ({
  collapsed,
  toggleSidebar,
  isMobileOpen,
  toggleMobileSidebar,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "/icons/home.svg",
    },
    {
      name: "Quick Save",
      path: "/quicksave",
      icon: "/icons/quicksave.svg",
    },
    {
      name: "SafeLock",
      path: "/safelock",
      icon: "/icons/safelock.svg",
    },
    {
      name: "Adashe",
      path: "/adashe",
      icon: "/icons/adashe.svg",
    },
    {
      name: "Activity",
      path: "/activity",
      icon: "/icons/Chart_Pie.svg",
    },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Base sidebar classes for both mobile and desktop
  const sidebarClasses = `bg-[#FCFCFC] border-r border-gray-100 transition-all duration-300 ease-in-out h-full
    ${collapsed && !isMobileOpen ? "w-20" : "w-64"} 
    ${isMobileOpen ? "fixed top-0 left-0 z-50" : ""}`;

  return (
    <>
      {/* Backdrop for mobile sidebar */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}

      <div className={sidebarClasses}>
        <div className="flex flex-col h-full relative">
          {/* Mobile close button */}
          {isMobileOpen && (
            <button
              onClick={toggleMobileSidebar}
              className="absolute top-4 right-4 p-1 lg:hidden"
              aria-label="Close sidebar"
            >
              <RiCloseLine size={24} color="#6B7280" />
            </button>
          )}

          {/* Desktop toggle button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-16 bg-white border border-gray-200 rounded-full p-1 hidden lg:flex items-center justify-center shadow-md z-10"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <RiArrowRightSLine size={16} color="#6B7280" />
            ) : (
              <RiArrowLeftSLine size={16} color="#6B7280" />
            )}
          </button>

          <div className="p-6">
            <div
              className={`flex items-center ${
                collapsed ? "justify-center" : "space-x-4"
              } mb-8`}
            >
              <Image
                src="/icons/logo-green.svg"
                alt="Blocsave logo"
                width={28}
                height={28}
                priority
              />
              {(!collapsed || isMobileOpen) && (
                <span className="text-xl font-semibold text-gray-900">
                  Blocsave
                </span>
              )}
            </div>

            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = router.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-[#079669] text-white rounded-[40px]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                    } ${collapsed && !isMobileOpen ? "justify-center" : ""}`}
                    onClick={isMobileOpen ? toggleMobileSidebar : undefined}
                  >
                    <div
                      className={`flex-shrink-0 ${
                        collapsed && !isMobileOpen ? "mx-auto" : ""
                      }`}
                    >
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={20}
                        height={20}
                        className={`${isActive ? "brightness-0 invert" : ""}`}
                        priority
                      />
                    </div>
                    {(!collapsed || isMobileOpen) && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div
            className={`mt-auto p-6 ${
              collapsed && !isMobileOpen ? "flex justify-center" : ""
            }`}
          >
            <button
              onClick={handleLogout}
              className={`flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 ${
                collapsed && !isMobileOpen ? "justify-center w-auto" : "w-full"
              }`}
            >
              <RiLogoutBoxLine
                className={`w-5 h-5 ${
                  collapsed && !isMobileOpen ? "" : "mr-3"
                }`}
              />
              {(!collapsed || isMobileOpen) && "Log out"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
