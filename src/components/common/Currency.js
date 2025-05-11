// CurrencySelect.jsx
import React, { useState, useRef, useEffect } from "react";
import { RiArrowDownSLine } from "react-icons/ri";

const CurrencySelect = ({ value, onChange, options = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the selected option
  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Render currency flag or icon
  const renderCurrencyIcon = (option) => {
    if (option.flag) {
      return (
        <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
          <img
            src={`/flags/${option.flag}.svg`}
            alt={option.label}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (option.icon === "usdc") {
      return (
        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
          <span className="text-xs font-bold">$</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center py-1 px-2 rounded-md hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption && (
          <>
            {renderCurrencyIcon(selectedOption)}
            <span className="font-medium">{selectedOption.label}</span>
          </>
        )}
        <RiArrowDownSLine className="ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border">
          <ul className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 flex items-center hover:bg-gray-100"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {renderCurrencyIcon(option)}
                  <span>{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrencySelect;
