import React from "react";
import { cn } from "@/lib/utils";

const BASE_CLASSES = `
    cursor-pointer rounded-[4px] px-[14px] py-[4px]
    font-medium transition-all duration-300
    flex border-none items-center justify-center gap-2
  `;

const VARIANT_CLASSES = {
  primary: `
      btn-branded-primary bg-[var(--primary)] text-buttonTextPrimary
      hover:brightness-110
    `,
  secondary: `
      bg-[var(--secondary)]  text-buttonTextSecondary
      hover:brightness-110
    `,
};

// compact filled button used inside field customizer modals
const STANDARD_CLASSES =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3";

const STANDARD_VARIANT = "standard";

const Button = ({
  label,
  children,
  onClick,
  className = "",
  type = "button",
  icon: LeftIcon,
  rightIcon: RightIcon,
  cnLeft,
  cnRight,
  variant = "primary",
  loading = false,
  disabled = false,
  style = {},
  ...props
}) => {
  if (variant === STANDARD_VARIANT) {
    return (
      <button type={type} onClick={onClick} disabled={disabled} className={cn(STANDARD_CLASSES, className)} {...props}>
        {children ?? label}
      </button>
    );
  }

  const disabledClasses = disabled || loading ? "opacity-40! cursor-not-allowed!" : "";

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={` ${BASE_CLASSES} ${VARIANT_CLASSES[variant] || ""} ${disabledClasses} ${className} `}
      style={style}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="mr-2 -ml-1 h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0
              0 5.373 0 12h4zm2 5.291A7.962
              7.962 0 014 12H0c0 3.042 1.135
              5.824 3 7.938l3-2.647z"
            />
          </svg>
          {label}
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className={cnLeft} />}
          <span>{label}</span>
          {RightIcon && <RightIcon className={cnRight} />}
        </>
      )}
    </button>
  );
};

export default Button;
