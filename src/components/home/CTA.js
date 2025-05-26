import React from "react";
import Image from "next/image";

const CTA = () => {
  return (
    <>
      <section className="py-10 sm:py-20 bg-black text-white">
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px] text-center">
          {/* Footer Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 text-left mb-8 sm:mb-12">
            <div>
              <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">BlocSave</h3>
              <ul className="space-y-2 sm:space-y-4">
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Campaigns
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Branding
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Offline
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Services</h3>
              <ul className="space-y-2 sm:space-y-4">
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Email Marketing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Campaigns
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Branding
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Offline
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Services</h3>
              <ul className="space-y-2 sm:space-y-4">
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Email Marketing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Campaigns
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Branding
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Offline
                  </a>
                </li>
              </ul>
            </div>

            <div className="hidden sm:block">
              <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Services</h3>
              <ul className="space-y-2 sm:space-y-4">
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Email Marketing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Campaigns
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Branding
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm sm:text-base hover:text-[#079669]">
                    Offline
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-3 md:col-span-1 mt-6 sm:mt-0">
              <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Subscribe to our newsletter</h3>
              <div className="flex mt-2 sm:mt-4">
                <input
                  type="email"
                  placeholder="Email address"
                  className="px-3 sm:px-4 py-2 bg-gray-800 text-white text-sm sm:text-base rounded-l-lg focus:outline-none w-full"
                />
                <button className="bg-[#079669] px-3 sm:px-4 rounded-r-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
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
    </>
  );
};

export default CTA;
