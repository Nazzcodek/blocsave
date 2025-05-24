import React from "react";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

const CTA = () => {
  const { authenticated } = usePrivy();
  const router = useRouter();

  // AuthButton component that conditionally renders based on auth state
  const AuthButton = ({ label, className = "" }) => {
    const handleClick = () => {
      if (authenticated) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    };

    return (
      <button
        onClick={handleClick}
        className={`bg-[#079669] hover:bg-[#068256] text-white rounded-full ${className}`}
      >
        {authenticated ? "Go to Dashboard" : label}
      </button>
    );
  };

  return (
    <>
      <section className="py-20 bg-black text-white">
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px] text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 max-w-2xl mx-auto">
            Beat inflation and preserve your wealth
          </h2>
          <p className="mb-8 max-w-xl mx-auto text-lg sm:text-xl">
            Convert local currency to USDC stablecoins and access high-yield
            DeFi
          </p>

          <AuthButton
            label="Get Started"
            className="py-3 px-8 mb-16 flex items-center mx-auto"
          />

          {/* Footer Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-left mb-12">
            <div>
              <h3 className="font-bold mb-4">BlocSave</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Campaigns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Branding
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Offline
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Services</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Email Marketing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Campaigns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Branding
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Offline
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Services</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Email Marketing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Campaigns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Branding
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Offline
                  </a>
                </li>
              </ul>
            </div>

            <div className="hidden sm:block">
              <h3 className="font-bold mb-4">Services</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Email Marketing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Campaigns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Branding
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#079669]">
                    Offline
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-3 md:col-span-1">
              <h3 className="font-bold mb-4">Subscribe to our newsletter</h3>
              <div className="flex mt-4">
                <input
                  type="email"
                  placeholder="Email address"
                  className="px-4 py-2 bg-gray-800 text-white rounded-l-lg focus:outline-none w-full"
                />
                <button className="bg-[#079669] px-4 rounded-r-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo at bottom */}
      <div className="bg-black h-24 flex items-end w-full">
        <div className="w-full px-0">
          <Image
            src="/icons/blocksav.svg"
            alt="Blocsave"
            width={300}
            height={100}
            className="w-full object-contain"
            layout="responsive"
          />
        </div>
      </div>
    </>
  );
};

export default CTA;
