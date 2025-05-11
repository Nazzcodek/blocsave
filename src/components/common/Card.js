import React from "react";

const Card = ({
  children,
  title,
  subtitle,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  footer,
  actions,
  noPadding = false,
  bordered = true,
  shadow = "sm",
}) => {
  // Shadow options
  const shadows = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  return (
    <div
      className={`
        bg-white rounded-lg overflow-hidden
        ${bordered ? "border border-gray-200" : ""}
        ${shadows[shadow] || shadows.sm}
        ${className}
      `}
    >
      {(title || subtitle || actions) && (
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>

          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
        </div>
      )}

      <div className={`${!noPadding ? "p-6" : ""} ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div
          className={`px-6 py-4 bg-gray-50 border-t border-gray-100 ${footerClassName}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
