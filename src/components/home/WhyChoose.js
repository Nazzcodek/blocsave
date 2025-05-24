import React, { useState, useEffect, useRef } from "react";
import { useExchangeRate, convertNairaToUSDC } from "../../utils/priceUtils";

const CommunitySavingsCircle = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleMembers, setVisibleMembers] = useState([
    false,
    false,
    false,
    false,
  ]);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Start revealing members one by one
          const revealMembers = () => {
            setVisibleMembers((prev) => {
              const newState = [...prev];
              const firstHiddenIndex = newState.findIndex((v) => !v);
              if (firstHiddenIndex !== -1) {
                newState[firstHiddenIndex] = true;
                return newState;
              }
              return prev;
            });
          };

          // Reveal each member with a delay
          const delays = [0, 300, 600, 900];
          delays.forEach((delay) => {
            setTimeout(() => {
              revealMembers();
            }, delay);
          });
        } else {
          setVisibleMembers([false, false, false, false]);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWeek((prev) => (prev % 4) + 1);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getRecipientForWeek = (week) => {
    const recipients = {
      1: { name: "Kwame", amount: "500USDC" },
      2: { name: "Adebayo", amount: "500USDC" },
      3: { name: "Amara", amount: "500USDC" },
      4: { name: "Dami", amount: "500USDC" },
    };
    return recipients[week];
  };

  const recipient = getRecipientForWeek(currentWeek);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl p-2 border border-gray-200 shadow-sm w-full max-w-4xl mx-auto"
    >
      {/* Top row - Members */}
      <div className="relative flex justify-center">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Member A */}
          <div
            className={`flex flex-col items-center transition-all duration-500 hover:scale-105 ${
              visibleMembers[0]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <p className="font-medium mb-1 text-sm text-gray-800">Adebayo</p>
            <img
              src="/icons/Memoji3.svg"
              alt="Adebayo"
              className="w-12 h-12 transition-transform duration-300 hover:scale-110"
            />
            <div className="w-[2px] h-2 bg-[#079669]"></div>
            <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium mt-0.5">
              100 USDC
            </span>
            <div className="w-[2px] h-4 bg-[#079669]"></div>
          </div>

          {/* Member B */}
          <div
            className={`flex flex-col items-center transition-all duration-500 hover:scale-105 ${
              visibleMembers[1]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <p className="font-medium mb-1 text-sm text-gray-800">Amara</p>
            <img
              src="/icons/Memoji2.svg"
              alt="Amara"
              className="w-12 h-12 transition-transform duration-300 hover:scale-110"
            />
            <div className="w-[2px] h-2 bg-[#079669]"></div>
            <span className="bg-blue-100 text-blue-600 px-1 py-1 rounded-full text-xs font-medium mt-0.5">
              100 USDC
            </span>
            <div className="w-[2px] h-4 bg-[#079669]"></div>
          </div>

          {/* Member C */}
          <div
            className={`flex flex-col items-center transition-all duration-500 hover:scale-105 ${
              visibleMembers[2]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <p className="font-medium mb-1 text-sm text-gray-800">Kwame</p>
            <img
              src="/icons/Memoji.svg"
              alt="Kwame"
              className="w-12 h-12 transition-transform duration-300 hover:scale-110"
            />
            <div className="w-[2px] h-2 bg-[#079669]"></div>
            <span className="bg-[#0796691a] text-[#079669] px-1 py-1 rounded-full text-xs font-medium mt-0.5">
              100 USDC
            </span>
            <div className="w-[2px] h-4 bg-[#079669]"></div>
          </div>

          {/* Member D */}
          <div
            className={`flex flex-col items-center transition-all duration-500 hover:scale-105 ${
              visibleMembers[3]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <p className="font-medium mb-1 text-sm text-gray-800">Dami</p>
            <img
              src="/icons/Memoji1.svg"
              alt="Dami"
              className="w-12 h-12 transition-transform duration-300 hover:scale-110"
            />
            <div className="w-[2px] h-2 bg-[#079669]"></div>
            <span className="bg-yellow-100 text-yellow-600 px-1 py-1 rounded-full text-xs font-medium mt-0.5">
              100 USDC
            </span>
            <div className="w-[2px] h-4 bg-[#079669]"></div>
          </div>
        </div>

        {/* Horizontal line connecting all verticals */}
        <div className="absolute w-full bottom-0 flex justify-center">
          <div className="w-[calc(100%-2rem)] h-[2px] bg-[#079669]"></div>
        </div>
      </div>

      {/* Vertical line to pool (touches horizontal and pool box) */}
      <div className="flex justify-center -mt-0.5">
        <div className="w-[2px] h-6 bg-[#079669]"></div>
      </div>

      {/* Weekly Pool Amount */}
      <div className="flex justify-center my-0 relative -mt-0.5">
        <div className="bg-[#0796691a] rounded-lg py-1 px-4 text-center z-10">
          <p className="text-sm text-gray-800 font-medium">
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
          <p className="text-xs font-medium text-gray-800">
            Recipient of Week {currentWeek}
          </p>
          <div
            className={`transition-opacity duration-500 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            <p className="font-medium mb-1 text-sm text-gray-800">
              {recipient.name}
            </p>
            <div className="flex justify-center">
              <img
                src={`/icons/Memoji${
                  currentWeek === 1
                    ? ""
                    : currentWeek === 2
                    ? "3"
                    : currentWeek === 3
                    ? "2"
                    : "1"
                }.svg`}
                alt={recipient.name}
                className="w-12 h-12"
              />
            </div>
            <span className="bg-[#0796691a] text-green-600 px-1 py-1 rounded-full text-xs font-medium inline-block mb-2">
              {recipient.amount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Smart Savings Flowchart component
const SmartSavingsFlow = () => {
  return (
    <div className="bg-[#F6F6F6] rounded-2xl p-6 shadow-sm w-full max-w-4xl mx-auto">
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

const SelectBankCard = () => {
  return (
    <div className="w-[300px] sm:w-[387.64px] h-[225.21px] bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl shadow-sm p-3 sm:p-4 relative mx-auto">
      <button className="absolute right-3 sm:right-4 top-3 sm:top-4">
        <img src="/icons/cancel.svg" alt="Close" className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>

      <div className="text-center">
        <p className="text-[10px] font-semibold text-gray-800">Select Bank</p>
      </div>

      <div className="mt-4 sm:mt-6 border border-[#DFE2E6] rounded-lg p-3 sm:p-4 bg-white/50">
        <p className="text-[10px] font-semibold text-gray-800">
          Daniel Cameron
        </p>
        <div className="flex items-center text-[10px] text-gray-600 mt-1">
          <span className="font-medium">Access Bank</span>
          <span className="mx-1">|</span>
          <span>0097191121</span>
        </div>
      </div>

      <div className="flex items-center justify-end mt-2">
        <button className="flex items-center gap-1 text-[10px] text-[#079669] font-medium">
          <img src="/icons/add.svg" alt="Add" className="w-3 h-3 sm:w-4 sm:h-4" />
          Add your NGN Bank Account
        </button>
      </div>

      <button className="w-full mt-4 sm:mt-6 bg-[#079669] text-white py-2 sm:py-2.5 rounded-lg text-[10px] font-medium hover:bg-[#06805a] transition-colors">
        Continue
      </button>
    </div>
  );
};

const FundWalletCard = () => {
  const [amount, setAmount] = useState(100000);
  const { exchangeRate, isLoading } = useExchangeRate();
  const netAmount = amount;
  const usdcAmount = exchangeRate ? convertNairaToUSDC(amount, exchangeRate) : 0;

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value ? parseInt(value) : 0);
  };

  return (
    <div className="w-[300px] sm:w-[387.64px] h-[255.21px] bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl shadow-sm p-3 sm:p-4 relative mx-auto">
      <div className="text-center">
        <p className="text-[10px] font-semibold text-gray-800">Fund Wallet</p>
      </div>

      <div className="mt-4 sm:mt-6 rounded-lg p-3 sm:p-4 bg-[#ECFDF5]">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <span className="text-[10px] text-gray-600">Amount to Save</span>
          <div className="flex items-center">
            <span className="text-[10px] font-semibold text-gray-800">₦</span>
            <input
              type="text"
              value={amount.toLocaleString()}
              onChange={handleAmountChange}
              className="w-20 sm:w-24 text-right text-[10px] font-semibold text-gray-800 bg-transparent border-none focus:outline-none pl-1"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <span className="text-[10px] text-gray-600">Network Fee</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-gray-800 line-through opacity-50">
              $0.001
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <span className="text-[10px] text-gray-600">Net amount</span>
          <span className="text-[10px] font-semibold text-gray-800">
            ₦{netAmount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-600">You'll receive</span>
          <span className="text-[10px] font-semibold text-[#079669]">
            {isLoading ? "Loading..." : `${usdcAmount} USDC`}
          </span>
        </div>
      </div>

      <button className="w-full mt-4 sm:mt-6 bg-[#079669] text-white py-2 sm:py-2.5 rounded-lg text-[10px] font-medium hover:bg-[#06805a] transition-colors">
        Continue
      </button>
    </div>
  );
};

const WhyChoose = () => {
  const [isSwitched, setIsSwitched] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCard, setActiveCard] = useState("selectBank");

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=ngn"
        );
        const data = await response.json();
        setExchangeRate(data["usd-coin"].ngn);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRate();
    // Refresh rate every 5 minutes
    const interval = setInterval(fetchExchangeRate, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitch = () => {
    setIsSwitched(!isSwitched);
  };

  return (
    <section id="features" className="bg-[#F6F6F6] py-10 sm:py-20">
      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px]">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-center text-gray-900">
          Why Choose Blocsave
        </h2>
        <p className="text-base sm:text-lg text-center mb-8 sm:mb-12 max-w-3xl mx-auto text-gray-700 px-4">
          Blocsave gives you full control, better returns, and the tools to save
          consistently — all without the limits of traditional banks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
          {/* Beat Inflation */}
          <div className="bg-white pt-6 sm:pt-8 px-4 sm:px-8 pb-0 rounded-2xl shadow-sm flex flex-col h-full">
            <div className="flex-grow">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">
                Beat Inflation. Preserve Your Wealth.
              </h3>
              <p className="text-base sm:text-lg xl:text-xl mb-4 sm:mb-6 text-gray-700">
                Blocsave helps you stay ahead by locking in value, earning
                returns, and building consistent saving habits that protect your
                money over time.
              </p>
            </div>
            <div className="mt-auto pb-0 mb-4">
              <div className="bg-[#025A0E] rounded-xl p-4 sm:p-8 flex items-center justify-center relative gap-6 sm:gap-12 w-full max-w-[518px] h-auto sm:h-[308px] mx-auto mb-4">
                <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm w-[120px] h-[120px] sm:w-[177.59px] sm:h-[177.59px] flex flex-col items-center justify-center">
                  <img
                    src={isSwitched ? "/icons/usdc.png" : "/icons/NGN.png"}
                    alt="Currency"
                    className="w-[80px] h-[80px] sm:w-[127px] sm:h-[127px] object-contain"
                  />
                  {!isLoading && exchangeRate && (
                    <p className="text-xs font-bold text-gray-600 mt-2">
                      {isSwitched
                        ? "1 USDC"
                        : `₦${exchangeRate.toLocaleString()}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSwitch}
                  className="absolute left-1/2 -translate-x-1/2 hover:scale-110 transition-transform duration-200 z-10"
                >
                  <img
                    src="/icons/switch.png"
                    alt="Switch"
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                  />
                </button>
                <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm w-[120px] h-[120px] sm:w-[177.59px] sm:h-[177.59px] flex flex-col items-center justify-center">
                  <img
                    src={isSwitched ? "/icons/NGN.png" : "/icons/usdc.png"}
                    alt="Currency"
                    className="w-[80px] h-[80px] sm:w-[127px] sm:h-[127px] object-contain"
                  />
                  {!isLoading && exchangeRate && (
                    <p className="text-xs font-bold text-gray-600 mt-2">
                      {isSwitched
                        ? `₦${exchangeRate.toLocaleString()}`
                        : "1 USDC"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Community-Powered Savings */}
          <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">
              Community-Powered Savings
            </h3>
            <p className="text-base sm:text-lg xl:text-xl mb-4 sm:mb-6 text-gray-700">
              A rotating savings and interest-free loan system. Members
              contribute regularly and take turns receiving the pooled funds
              used for personal goals or urgent needs (known as Ajo/Esusu)
            </p>
            <div className="overflow-x-auto">
              <CommunitySavingsCircle />
            </div>
          </div>

          {/* Smart Savings */}
          <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">
              Smart Savings powered by AI Agents
            </h3>
            <p className="text-base sm:text-lg xl:text-xl mb-4 sm:mb-6 text-gray-700">
              Savings powered by smart contracts and trusted DeFi protocols.
              Funds lock securely for a set time and return with profit — like
              they never left.
            </p>
            <div className="overflow-x-auto">
              <SmartSavingsFlow />
            </div>
          </div>

          {/* Save and Withdraw */}
          <div className="bg-white p-4 sm:p-8 pb-16 sm:pb-24 rounded-2xl shadow-sm min-h-[500px]">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">
              Save and Withdraw, Your Way
            </h3>
            <p className="text-base sm:text-lg xl:text-xl mb-4 sm:mb-6 text-gray-700">
              Top up with Naira via bank transfer, USSD, or crypto — and
              withdraw directly to your Nigerian bank account in a few taps.
              Fast, flexible, and stress-free.
            </p>
            <div className="flex justify-center mt-8 sm:mt-16 relative">
              <div
                className={`transform -translate-x-2 sm:-translate-x-4 translate-y-2 sm:translate-y-4 z-0 xs:translate-y-1 sm:translate-y-0 sm:-translate-x-8 transition-all duration-300 cursor-pointer ${
                  activeCard === "fundWallet" ? "z-20" : "z-0"
                }`}
                onMouseEnter={() => setActiveCard("fundWallet")}
                onMouseLeave={() => setActiveCard("selectBank")}
                onClick={() => setActiveCard("fundWallet")}
              >
                <FundWalletCard />
              </div>
              <div
                className={`transform rotate-[20deg] z-10 absolute top-0 left-1/2 -translate-x-1/2 ml-3 sm:ml-6 mt-1 transition-all duration-300 cursor-pointer ${
                  activeCard === "selectBank" ? "z-20" : "z-10"
                }`}
                onMouseEnter={() => setActiveCard("selectBank")}
                onMouseLeave={() => setActiveCard("selectBank")}
                onClick={() => setActiveCard("selectBank")}
              >
                <SelectBankCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
