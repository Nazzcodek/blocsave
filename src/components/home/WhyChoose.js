import React from "react";

// Community Savings Circle component for better organization
const CommunitySavingsCircle = () => {
  return (
    <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-sm w-full max-w-4xl mx-auto">
      {/* Top row - Members */}
      <div className="relative flex justify-center">
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-6">
          {/* Member A */}
          <div className="flex flex-col items-center">
            <p className="font-medium mb-1 text-sm">Member A</p>
            <img
              src="/icons/Memoji3.svg"
              alt="Member A"
              className="w-12 h-12"
            />
            <div className="w-[2px] h-2 bg-[#079669]"></div>
            <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium mt-0.5">
              100 USDC
            </span>
            <div className="w-[2px] h-2 bg-[#079669]"></div>
          </div>

          {/* Member B */}
          <div className="flex flex-col items-center">
            <p className="font-medium mb-1 text-sm">Member B</p>
            <img
              src="/icons/Memoji2.svg"
              alt="Member B"
              className="w-12 h-12"
            />
            <div className="w-[2px] h-2 bg-[#079669]"></div>
            <span className="bg-blue-100 text-blue-600 px-1 py-1 rounded-full text-xs font-medium mt-0.5">
              100 USDC
            </span>
            <div className="w-[2px] h-2 bg-[#079669]"></div>
          </div>

          {/* Member C */}
          <div className="flex flex-col items-center">
            <p className="font-medium mb-1 text-sm">Member C</p>
            <img src="/icons/Memoji.svg" alt="Member C" className="w-12 h-12" />
            <div className="w-[2px] h-2 bg-[#079669]"></div>
            <span className="bg-[#0796691a] text-[#079669] px-1 py-1 rounded-full text-xs font-medium mt-0.5">
              100 USDC
            </span>
            <div className="w-[2px] h-2 bg-[#079669]"></div>
          </div>

          {/* Member D */}
          <div className="flex flex-col items-center">
            <p className="font-medium mb-1 text-sm">Member D</p>
            <img
              src="/icons/Memoji1.svg"
              alt="Member D"
              className="w-12 h-12"
            />
            <div className="w-[2px] h-2 bg-[#079669]"></div>
            <span className="bg-yellow-100 text-yellow-600 px-1 py-1 rounded-full text-xs font-medium mt-0.5">
              100 USDC
            </span>
            <div className="w-[2px] h-2 bg-[#079669]"></div>
          </div>
        </div>

        {/* Horizontal line connecting all verticals */}
        <div className="absolute w-full bottom-0 flex justify-center">
          <div className="w-[80%] h-[2px] bg-[#079669]"></div>
        </div>
      </div>

      {/* Vertical line to pool (touches horizontal and pool box) */}
      <div className="flex justify-center -mt-0.5">
        <div className="w-[2px] h-2 bg-[#079669]"></div>
      </div>

      {/* Weekly Pool Amount */}
      <div className="flex justify-center my-0 relative -mt-0.5">
        <div className="bg-[#0796691a] rounded-lg py-1 px-4 text-center z-10">
          <p className="text-sm text-gray-700 font-medium">
            WEEKLY POOL AMOUNT
          </p>
          <p className="text-3xl font-bold text-green-600">500USDC</p>
        </div>
      </div>

      {/* Vertical line to recipient (touches pool box and recipient) */}
      <div className="flex justify-center -mt-0.5">
        <div className="w-[2px] h-6 bg-[#079669]"></div>
      </div>

      {/* Recipient of the week */}
      <div className="flex justify-center mb-1 -mt-0.5">
        <div className="bg-[#0796691a] rounded-lg py-1 px-3 text-center w-64">
          <p className="text-xs font-medium">Recipient of the week</p>
          <p className="font-medium mb-1 text-sm">Member C</p>
          <div className="flex justify-center">
            <img src="/icons/Memoji.svg" alt="Member C" className="w-12 h-12" />
          </div>
          <span className="bg-[#0796691a] text-green-600 px-1 py-1 rounded-full text-xs font-medium inline-block mb-2">
            500USDC
          </span>
          <p className="text-xs text-gray-700">Get full pooled amount</p>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="text-center px-1">
        <p className="text-xs sm:text-base md:text-lg font-bold max-w-[300px] mx-auto">
          Process continues until each member has received the pool
        </p>
      </div>
    </div>
  );
};

// Smart Savings Flowchart component
const SmartSavingsFlow = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-4xl mx-auto">
      {/* First Row */}
      <div className="flex justify-center items-start mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl relative">
          {/* Horizontal connecting lines (desktop only) - behind boxes */}
          <div className="hidden sm:block h-[2px] bg-[#079669] absolute top-10 left-[16.67%] right-[16.67%] z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="bg-white rounded-lg shadow-sm p-2 text-center w-full mb-4">
              <div className="flex justify-center mb-3">
                <div className="text-green-600">
                  <img
                    src="/icons/Bank.svg"
                    alt="Bank"
                    className="w-8 h-8 mx-auto"
                  />
                </div>
              </div>
              <p className="text-xs font-medium">
                User deposits local
                <br />
                currency into Blocsave
              </p>
            </div>

            {/* Vertical connecting line (mobile only) */}
            <div className="sm:hidden h-6 w-[2px] bg-[#079669] mx-auto"></div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="bg-white rounded-lg shadow-sm p-2 text-center w-full mb-4">
              <div className="flex justify-center mb-3">
                <div className="text-green-600">
                  <img
                    src="/icons/swap.svg"
                    alt="Conversion"
                    className="w-8 h-8 mx-auto"
                  />
                </div>
              </div>
              <p className="text-xs font-medium">
                Local currency are
                <br />
                converted to USDC
              </p>
            </div>

            {/* Vertical connecting line (mobile only) */}
            <div className="sm:hidden h-6 w-[2px] bg-[#079669] mx-auto"></div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="bg-white rounded-lg shadow-sm p-2 text-center w-full mb-4">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <img
                    src="/icons/Memoji.svg"
                    alt="User"
                    className="w-8 h-8 mx-auto"
                  />
                  <span className="absolute -top-1 -right-1 bg-[#0796691a] text-green-600 text-xs px-1 rounded-sm">
                    100 USDC
                  </span>
                </div>
              </div>
              <p className="text-xs font-medium">
                User commits 100 USDC
                <br />
                from blocsave wallet
              </p>
            </div>

            {/* Vertical line to second row - both mobile and desktop */}
            <div className="h-6 sm:h-12 w-[2px] bg-[#079669] mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="flex justify-center items-start mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl relative">
          {/* Horizontal connecting lines (desktop only) - behind boxes */}
          <div className="hidden sm:block h-[2px] bg-[#079669] absolute top-10 left-[16.67%] right-[16.67%] z-0"></div>

          {/* Step 6 (desktop) / Step 4 (mobile) */}
          <div className="flex flex-col items-center relative order-3 sm:order-1 z-10">
            <div className="bg-white rounded-lg shadow-sm p-2 text-center w-full mb-4">
              <div className="flex justify-center mb-3">
                <div className="text-green-600">
                  <img
                    src="/icons/unlock.svg"
                    alt="Duration"
                    className="w-8 h-8 mx-auto"
                  />
                </div>
              </div>
              <p className="text-sm font-medium">
                Set lock
                <br />
                duration
              </p>
            </div>

            {/* Vertical connecting line to third row (desktop) */}
            <div className="hidden sm:block h-12 w-[2px] bg-[#079669] mx-auto"></div>

            {/* Vertical connecting line (mobile only) */}
            <div className="sm:hidden h-6 w-[2px] bg-[#079669] mx-auto"></div>
          </div>

          {/* Step 5 (stays the same for both mobile and desktop) */}
          <div className="flex flex-col items-center relative order-2 z-10">
            <div className="bg-white rounded-lg shadow-sm p-2 text-center w-full mb-4">
              <div className="flex justify-center mb-3">
                <div className="text-green-600">
                  <img
                    src="/icons/group.svg"
                    alt="AI"
                    className="w-8 h-8 mx-auto"
                  />
                </div>
              </div>
              <p className="text-xs font-medium">
                AI Auto-Allocates
                <br />
                to Yield Pools
              </p>
            </div>

            {/* Vertical connecting line (mobile only) */}
            <div className="sm:hidden h-6 w-[2px] bg-[#079669] mx-auto"></div>
          </div>

          {/* Step 4 (desktop) / Step 6 (mobile) */}
          <div className="flex flex-col items-center relative order-1 sm:order-3 z-10">
            <div className="bg-white rounded-lg shadow-sm p-2 text-center w-full mb-4">
              <div className="flex justify-center mb-3">
                <div className="text-green-600">
                  <img
                    src="/icons/wallet_green.svg"
                    alt="Lock"
                    className="w-8 h-8 mx-auto"
                  />
                </div>
              </div>
              <p className="text-sm font-medium">
                Lock period
                <br />
                completes
              </p>
            </div>

            {/* Vertical connecting line (mobile only) - connects to the third row */}
            <div className="sm:hidden h-6 w-[2px] bg-[#079669] mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="flex justify-center items-start">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl relative">
          {/* Horizontal connecting line (desktop only) - behind boxes */}
          <div className="hidden sm:block h-[2px] bg-[#079669] absolute top-10 left-[16.67%] w-[33.33%] z-0"></div>

          {/* Step 7 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="bg-white rounded-lg shadow-sm p-2 text-center w-full mb-4">
              <div className="flex justify-center mb-3">
                <div className="text-green-600">
                  <img
                    src="/icons/wallet-money.svg"
                    alt="Interest"
                    className="w-8 h-8 mx-auto"
                  />
                </div>
              </div>
              <p className="text-xs font-medium">
                Principal + Interest
                <br />
                returned to user wallet
              </p>
            </div>

            {/* Vertical connecting line (mobile only) */}
            <div className="sm:hidden h-6 w-[2px] bg-[#079669] mx-auto"></div>
          </div>

          {/* Step 8 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="bg-white rounded-lg shadow-sm p-2 text-center w-full mb-4">
              <div className="flex justify-center mb-3">
                <div className="text-green-600">
                  <img
                    src="/icons/Bank.svg"
                    alt="Withdraw"
                    className="w-8 h-8 mx-auto"
                  />
                </div>
              </div>
              <p className="text-xs font-medium">
                User Can Withdraw
                <br />
                to Local Currency
              </p>
            </div>
          </div>

          {/* Empty cell to maintain grid */}
          <div className="hidden sm:block"></div>
        </div>
      </div>
    </div>
  );
};
const WhyChoose = () => {
  return (
    <section id="features" className="py-20">
      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px]">
        <h2 className="text-4xl font-bold mb-4 text-center">
          Why Choose Blocsave
        </h2>
        <p className="text-lg text-center mb-12 max-w-3xl mx-auto">
          Blocsave gives you full control, better returns, and the tools to save
          consistently — all without the limits of traditional banks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Beat Inflation */}
          <div className="bg-white pt-8 px-8 pb-0 rounded-2xl shadow-sm flex flex-col h-full">
            <div className="flex-grow">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Beat Inflation. Preserve Your Wealth.
              </h3>
              <p className="text-lg xl:text-xl mb-6">
                Blocsave helps you stay ahead by locking in value, earning
                returns, and building consistent saving habits that protect your
                money over time.
              </p>
            </div>
            <div className="mt-auto pb-0 mb-0">
              <img
                src="/icons/exchange_frame.svg"
                alt="Currency Conversion"
                className="mx-auto block w-full max-w-xl"
              />
            </div>
          </div>

          {/* Community-Powered Savings */}
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Community-Powered Savings
            </h3>
            <p className="text-lg xl:text-xl mb-6">
              A rotating savings and interest-free loan system. Members
              contribute regularly and take turns receiving the pooled funds
              used for personal goals or urgent needs (known as Ajo/Esusu)
            </p>
            <CommunitySavingsCircle />
          </div>

          {/* Smart Savings */}
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Smart Savings powered by AI Agents
            </h3>
            <p className="text-lg xl:text-xl mb-6">
              Savings powered by smart contracts and trusted DeFi protocols.
              Funds lock securely for a set time and return with profit — like
              they never left.
            </p>
            <SmartSavingsFlow />
          </div>

          {/* Save and Withdraw */}
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Save and Withdraw, Your Way
            </h3>
            <p className="text-lg xl:text-xl mb-6">
              Top up with Naira via bank transfer, USSD, or crypto — and
              withdraw directly to your Nigerian bank account in a few taps.
              Fast, flexible, and stress-free.
            </p>
            <div className="flex justify-center">
              <img
                src="/icons/cards.svg"
                alt="Withdrawal Form"
                className="mx-auto block w-full max-w-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
