// BankSelect.jsx
import React, { useState, useRef, useEffect } from "react";
import { RiArrowDownSLine } from "react-icons/ri";

const BankSelect = ({ onChange, defaultOption = "Select a bank" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef(null);

  // Demo bank list
  const banks = [
    { id: "access", name: "Access Bank" },
    { id: "firstbank", name: "First Bank" },
    { id: "gtb", name: "Guaranty Trust Bank" },
    { id: "paystack", name: "Paystack Titan" },
    { id: "zenith", name: "Zenith Bank" },
  ];

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

  const handleSelect = (bank) => {
    setSelected(bank);
    onChange(bank);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full inline-flex justify-between items-center py-2 px-3 border rounded-md hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm">
          {selected ? selected.name : defaultOption}
        </span>
        <RiArrowDownSLine />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-10 border max-h-60 overflow-y-auto">
          <ul className="py-1">
            {banks.map((bank) => (
              <li key={bank.id}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleSelect(bank)}
                >
                  {bank.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default BankSelect;