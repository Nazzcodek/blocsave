import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { authenticated } = usePrivy();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, []);

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
    <header className="bg-black text-white">
      <nav className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px] py-4 flex justify-between items-center relative">
        <div className="flex items-center">
          <Image
            src="/icons/logo-green.svg"
            alt="Blocsave Logo"
            width={30}
            height={30}
            className="mr-2"
          />
          <span className="text-xl font-bold">blocsave</span>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          <a href="#features" className="hover:text-green-400">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-green-400">
            How it works
          </a>
          <a href="#testimonials" className="hover:text-green-400">
            Testimonials
          </a>
          <a href="#faqs" className="hover:text-green-400">
            FAQs
          </a>
          <AuthButton label="Login / Sign Up" className="py-2 px-4 lg:px-6" />
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 py-4 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px]">
          <div className="flex flex-col space-y-4 border-b border-gray-800 pb-6">
            <a href="#features" className="hover:text-green-400">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-green-400">
              How it works
            </a>
            <a href="#testimonials" className="hover:text-green-400">
              Testimonials
            </a>
            <a href="#faqs" className="hover:text-green-400">
              FAQs
            </a>
            <AuthButton label="Login / Sign Up" className="py-2 px-6 w-full" />
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px] pt-8 text-center" ref={headerRef}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6">
          <div className="flex flex-col items-center">
            <span className={`inline-block overflow-hidden whitespace-nowrap ${isVisible ? 'animate-[typing_2s_steps(30,end)]' : 'w-0'}`}>
              The better way to
            </span>
            <span className={`inline-block overflow-hidden whitespace-nowrap ${isVisible ? 'animate-[typing_2s_steps(30,end)_2s]' : 'w-0'}`}>
              save <span className="italic">your money</span>
            </span>
            <span className={`inline-block overflow-hidden whitespace-nowrap ${isVisible ? 'animate-[typing_2s_steps(30,end)_4s]' : 'w-0'}`}>
              in Stablecoins
            </span>
          </div>
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-[20px] mb-10 max-w-xl mx-auto">
          Quicksave anytime, lock funds with Safelock, and build wealth together
          through community saving circles (Ajo/Esusu)
        </p>
        <AuthButton
          label="Get Started"
          className="py-4 px-8 rounded-full mb-8"
        />
      </div>

      <div className="w-full flex justify-center">
        <img
          src="/icons/brown-thumb.svg"
          alt="Dollar Sign"
          style={{ marginBottom: "-1px" }}
        />
      </div>
    </header>
  );
};

export default Header;
