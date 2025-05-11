import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ModalController from "./ModalController";
import FundWalletModalController from "../dashboard/modals/FundWalletModalController";

const Layout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Track if we're on mobile view
  const [isMobileView, setIsMobileView] = useState(false);

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
  ];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  // Effect to check authentication on route change
  useEffect(() => {
    // If you want to implement auth checking, you could do it here
    // For now, we'll assume all routes are accessible
  }, [router.pathname, dispatch]);

  // Effect to handle window resize and set mobile view state
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024; // 1024px is the lg breakpoint in Tailwind
      setIsMobileView(isMobile);

      // Auto-close mobile sidebar when switching to desktop
      if (!isMobile && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // For public routes like login, don't show the sidebar
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main>{children}</main>
      </div>
    );
  }

  // For authenticated routes, show the layout with sidebar and header
  return (
    <div className="min-h-screen flex text-gray-900">
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-20 hidden lg:block">
        <Sidebar
          collapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          isMobileOpen={false}
          toggleMobileSidebar={toggleMobileSidebar}
          isMobileView={false}
        />
      </div>

      {/* Mobile Sidebar - conditionally rendered */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden">
          <Sidebar
            collapsed={false}
            toggleSidebar={toggleSidebar}
            isMobileOpen={true}
            toggleMobileSidebar={toggleMobileSidebar}
            isMobileView={true}
          />
        </div>
      )}

      {/* Main content area with proper margin for sidebar on desktop only */}
      <div
        className={`flex-1 flex flex-col ${
          isMobileView ? "ml-0" : isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Fixed Header */}
        <div
          className="fixed top-0 right-0 z-10 bg-white shadow-none"
          style={{
            width: isMobileView
              ? "100%"
              : `calc(100% - ${isSidebarCollapsed ? "5rem" : "16rem"})`,
          }}
        >
          <Header toggleMobileSidebar={toggleMobileSidebar} />
        </div>

        {/* Main content with padding to account for fixed header */}
        <main className="flex-1 overflow-y-auto bg-white px-4 sm:px-6 md:px-10 lg:px-16 xl:px-48 py-6 mt-16">
          {children}
        </main>
      </div>
      
      {/* Global Modal Controllers */}
      <ModalController />
      <FundWalletModalController />
    </div>
  );
};

export default Layout;
