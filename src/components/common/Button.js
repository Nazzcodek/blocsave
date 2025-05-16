// Button.jsx
import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon,
  iconPosition = "left",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) => {
  // Variant styles - only apply if no custom className is provided with same properties
  const variants = {
    primary: "bg-green-500 hover:bg-green-600 text-white",
    secondary: "bg-blue-500 hover:bg-blue-600 text-white",
    outline: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    custom: "", // Add custom variant that doesn't apply default styling
  };

  // Size styles
  const sizes = {
    xs: "text-xs py-1 px-2",
    sm: "text-sm py-2 px-3",
    md: "text-sm py-2.5 px-4",
    lg: "text-base py-3 px-5",
    xl: "text-lg py-3.5 px-6",
  };

  // Disabled styles
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  // Determine if we should use variant styling or let custom className take priority
  const useCustomStyling = className.includes("bg-") || variant === "custom";

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-colors duration-150 ease-in-out
        font-medium leading-none
        ${!useCustomStyling ? variants[variant] : ""}
        ${sizes[size]}
        ${disabledClasses}
        ${className}
      `}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </button>
  );
};

export default Button;
