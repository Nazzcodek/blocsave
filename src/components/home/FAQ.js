import React, { useState } from "react";

const FAQ = () => {
  // State for FAQ accordion
  const [openFaq, setOpenFaq] = useState(null);

  // Toggle FAQ function
  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  // FAQ data
  const faqData = [
    {
      question: "How does Quicksave work?",
      answer:
        "Quicksave allows you to deposit funds anytime and withdraw whenever you need them with no fixed schedule or hidden fees. Your money earns interest while it's deposited.",
    },
    {
      question: "What are the SafeLock options?",
      answer:
        "SafeLock allows you to lock your funds for a fixed period to earn higher returns of up to 9%. You choose your lock duration, but funds are inaccessible until maturity.",
    },
    {
      question: "How secure is my money with Blocsave?",
      answer:
        "Blocsave uses smart contracts and trusted DeFi protocols to secure your funds. We implement industry-standard security measures and regular audits to ensure your funds are protected.",
    },
    {
      question: "How can I join Group Savings?",
      answer:
        "You can create or join a savings circle through the Ajo/Adashe option. Simply select this option after signing up, then either create a new circle or join an existing one with an invitation code.",
    },
    {
      question: "Are there any fees for using Blocsave?",
      answer:
        "Blocsave promises no hidden fees. There may be minimal network fees for certain transactions, but we're transparent about all costs before you confirm any action.",
    },
  ];

  return (
    <section id="faqs" className="py-20 bg-black text-white rounded-t-[32px]">
      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px]">
        <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-28 2xl:gap-48">
          <div className="lg:w-2/5 mb-12 lg:mb-0 max-w-md">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 ">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-300">
              Find answers to common questions about Blocsave and our savings
              options.
            </p>
          </div>

          {/* Right side - FAQ accordion */}
          <div className="lg:w-3/5">
            {faqData.map((faq, index) => (
              <div key={index} className="mb-12 border-b border-gray-700 pb-4">
                <button
                  className="w-full text-left flex justify-between items-center py-2"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-lg sm:text-xl font-medium">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-6 h-6 flex-shrink-0 transition-transform ${
                      openFaq === index ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="mt-2 pl-2 text-base sm:text-lg">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
