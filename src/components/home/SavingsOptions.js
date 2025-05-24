import React from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

// QuickSave Card Component
const QuickSaveCard = () => {
  const router = useRouter();
  const { authenticated } = usePrivy();

  const handleQuickSave = () => {
    if (authenticated) {
      router.push("/quicksave");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div
      className="bg-[#C7F2E5] p-6 sm:p-8 lg:p-10 rounded-[32px] h-full relative overflow-hidden"
      style={{ height: "auto", minHeight: "520px", maxHeight: "610px" }}
    >
      <div className="max-w-full sm:max-w-[70%] md:max-w-[68%] z-10 relative">
        <h3 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-8 text-gray-900">
          Quick Save
        </h3>
        <p className="mb-5 sm:mb-9 text-lg sm:text-xl text-gray-800">
          Save anytime, on your terms, with instant deposits
        </p>
        <ul className="ml-6 mb-6 sm:mb-10 space-y-3 sm:space-y-7 text-base sm:text-lg lg:text-xl text-gray-700">
          <li className="flex items-start">
            <span className="mr-2 text-[#079669]">•</span>
            <span>Save any amount, anytime</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-[#079669]">•</span>
            <span>Withdraw anytime</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-[#079669]">•</span>
            <span>No fixed schedule required</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-[#079669]">•</span>
            <span>No hidden fees</span>
          </li>
        </ul>
        <button
          onClick={handleQuickSave}
          className="bg-[#079669] text-white py-3 px-4 sm:py-4 sm:px-6 rounded-full text-lg sm:text-xl flex items-center mb-2 hover:bg-[#06805a] transition-colors"
        >
          Make a quick save
          <svg
            className="w-3 h-3 ml-1"
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
      <div className="absolute right-0 bottom-0 z-0">
        <img
          src="/icons/house_1.svg"
          alt="House"
          className="w-50 h-50 sm:w-50 sm:h-50 object-contain"
        />
      </div>
    </div>
  );
};

// SafeLock Card Component
const SafeLockCard = () => {
  const router = useRouter();
  const { authenticated } = usePrivy();

  const handleSafeLock = () => {
    if (authenticated) {
      router.push("/safelock");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div
      className="bg-[#E0F4FE] p-6 sm:p-8 lg:p-10 rounded-[32px] h-full relative overflow-hidden"
      style={{ height: "auto", minHeight: "520px", maxHeight: "610px" }}
    >
      <div className="max-w-full sm:max-w-[70%] md:max-w-[65%] z-10 relative">
        <h3 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-8 text-gray-900">
          Safe Lock
        </h3>
        <p className="mb-5 sm:mb-9 text-lg sm:text-xl text-gray-800">
          Lock your funds for a fixed period and earn higher returns. Perfect
          for medium-term goals.
        </p>
        <ul className="ml-6 mb-6 sm:mb-10 space-y-3 sm:space-y-7 text-base sm:text-lg lg:text-xl text-gray-700">
          <li className="flex items-start">
            <span className="mr-2 text-[#079669]">•</span>
            <span>Up to 9% returns</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-[#079669]">•</span>
            <span>Lock funds for a fixed period</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-[#079669]">•</span>
            <span>Choose your own lock duration</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-[#079669]">•</span>
            <span>Funds are inaccessible until maturity</span>
          </li>
        </ul>
        <button
          onClick={handleSafeLock}
          className="bg-[#079669] text-white py-3 px-4 sm:py-4 sm:px-6 rounded-full text-lg sm:text-xl flex items-center mb-2 hover:bg-[#06805a] transition-colors"
        >
          Lock your funds
          <svg
            className="w-3 h-3 ml-1"
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
      <div className="absolute right-0 bottom-0 z-0">
        <img
          src="/icons/savings.svg"
          alt="Safe Lock"
          className="w-50 h-50 sm:w-50 sm:h-50 object-contain"
        />
      </div>
    </div>
  );
};

// Ajo/Adashe Card Component
const AjoAdasheCard = () => {
  const router = useRouter();
  const { authenticated } = usePrivy();

  const handleAjoAdashe = () => {
    if (authenticated) {
      router.push("/adashe");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div
      className="bg-[#255A64] text-white p-6 sm:p-8 lg:p-10 rounded-[32px] relative overflow-hidden"
      style={{ height: "auto", minHeight: "480px", maxHeight: "580px" }}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 max-w-full md:max-w-[70%] z-10 relative">
          <h3 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-8">
            Ajo/Adashe
            <span className="text-xl sm:text-2xl lg:text-3xl font-normal ml-2 block sm:inline text-white/90">
              (group savings)
            </span>
          </h3>
          <p className="mb-5 sm:mb-9 text-lg sm:text-xl font-normal max-w-[580px] text-white/90">
            Save together with friends, family, or colleagues. Pool resources
            and take turns receiving the pot.
          </p>
          <ul className="ml-6 mb-8 sm:mb-12 text-lg sm:text-xl space-y-3 sm:space-y-7 font-normal text-white/90">
            <li className="flex items-start">
              <span className="mr-2 text-white">•</span>
              <span>Create or join a savings circle</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-white">•</span>
              <span>Automated rotation and distribution</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-white">•</span>
              <span>Scheduled payments (e.g., weekly, monthly)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-white">•</span>
              <span>Payout order set by rotation or lottery</span>
            </li>
          </ul>
          <button
            onClick={handleAjoAdashe}
            className="bg-white text-[#255A64] py-3 px-4 sm:py-4 sm:px-6 rounded-full text-lg sm:text-xl flex items-center mb-2 hover:bg-white/90 transition-colors"
          >
            Join group savings
            <svg
              className="w-3 h-3 ml-1"
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
        <div className="absolute right-0 bottom-0 z-0">
          <img
            src="/icons/block-stack.svg"
            alt="Group Savings"
            className="w-50 h-50 sm:w-50 sm:h-50 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

const SavingsOptions = () => {
  return (
    <section className="py-10 bg-white">
      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px]">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-4 sm:mb-8 text-gray-900">
          Flexible Savings Solutions
        </h2>
        <p className="text-center text-xl sm:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto text-gray-700">
          Choose the savings option that fits your goals, whether you need daily
          access, higher returns, or want to save with friends.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Quick Save */}
          <QuickSaveCard />

          {/* Safe Lock */}
          <SafeLockCard />
        </div>

        {/* Ajo/Adashe - Full width */}
        <AjoAdasheCard />
      </div>
    </section>
  );
};

export default SavingsOptions;
