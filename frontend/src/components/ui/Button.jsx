import React from "react";
import PropTypes from "prop-types";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  disabled = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 " +
    "disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700",
    secondary:
      "bg-secondary-600 text-white hover:bg-secondary-700 dark:bg-secondary-600 dark:hover:bg-secondary-700",
    outline:
      "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700",
    ghost:
      "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200",
    danger:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      className={[
        baseStyles,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        widthClass,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "ghost",
    "danger",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  disabled: PropTypes.bool,
};

export default Button;
