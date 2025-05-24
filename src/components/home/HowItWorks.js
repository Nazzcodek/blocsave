import React from "react";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 md:py-40 bg-white">
      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px]">
        {/* Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 relative">
          {/* Left column - content area with larger padding */}
          <div className="py-12 md:py-20 lg:py-32 pr-4 md:pr-8 lg:pr-16 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
              How Blocsave Works
            </h2>
            <p className="mb-4 text-gray-600">
              Saving made simple, smart, and secure.
            </p>

            <button className="bg-[#079669] hover:bg-[#07966977] text-white font-medium rounded-full py-3 px-8 flex items-center mb-10 sm:mb-16 transition duration-300">
              Start Saving Now
              <svg
                className="w-4 h-4 ml-2"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-8">
              {/* Step 1 */}
              <div className="flex flex-col">
                <div className="mb-2 text-[#079669]">
                  <img
                    src="icons/user-edit.svg"
                    alt="User"
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Sign Up</h3>
                  <p className="text-gray-600 text-sm">
                    Get started with just your email or phone number.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col">
                <div className="mb-2 text-[#079669]">
                  <img src="icons/coin.svg" alt="Fund" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Fund Account</h3>
                  <p className="text-gray-600 text-sm">
                    Fund with your local currency via bank transfer or USSD. You
                    can also fund directly from your crypto wallet.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col">
                <div className="mb-2 text-[#079669]">
                  <img
                    src="icons/color-swatch.svg"
                    alt="Lock"
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                    Choose a Saving Method
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Select between, Quick Save, SafeLock, or Adashe (Group
                    Savings)
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col">
                <div className="mb-2 text-[#079669]">
                  <img src="icons/tree.svg" alt="Grow" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                    Watch Your Money Grow
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Track your savings, earn interest, and withdraw funds when
                    you need them.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column with background image */}
          <div className="relative hidden md:block h-full">
            <div className="absolute inset-0 overflow-hidden">
              <img
                src="/icons/compliance_1.svg"
                alt="Compliance design"
                className="absolute top-0 right-0 bottom-0 h-full w-auto max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
