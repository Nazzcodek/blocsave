// Modal.jsx
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { RiCloseLine } from "react-icons/ri";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const modalRef = useRef(null);

  // Size variants
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      // Only close if clicking outside the modal content
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      // Use mousedown on the backdrop element only, not the entire document
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.addEventListener("mousedown", handleOutsideClick);
      }
    }

    return () => {
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.removeEventListener("mousedown", handleOutsideClick);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 modal-backdrop"
      onClick={(e) => {
        // Only close if clicking the backdrop directly (not bubbled events)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} animate-fadeIn max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to backdrop
      >
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 flex-grow">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
