import React from "react";
import { cn } from "@/lib/utils";
import Spinner from "./Spinner";

const BASE_CLASSES = `
    cursor-pointer py-[4px]
    font-medium transition-all duration-300
    flex items-center justify-center gap-2
  `;

const SIZE_CLASSES = {
  default: "rounded-[4px] px-[14px]",
  lg: "rounded-[12px] px-6",
  field: "rounded-[4px] px-[14px] h-12.5",
  pill: "rounded-[20px] px-[14px]",
};

const VARIANT_CLASSES = {
  primary: `
      btn-branded-primary bg-[var(--primary)] text-buttonTextPrimary
      hover:brightness-110 border-none
    `,
  secondary: `
      bg-[var(--secondary)]  text-buttonTextSecondary
      hover:brightness-110 border-none
    `,
  pill: `
      btn-branded-primary bg-[var(--primary)] text-buttonTextPrimary
      hover:brightness-110
      hover:bg-primary text-textPrimary border-secondary border
    `,
};

const DEFAULT_VARIANT_CLASSES = "border-none";

// compact filled button used inside field customizer modals
const STANDARD_CLASSES =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3";

const STANDARD_VARIANT = "standard";
const PILL_VARIANT = "pill";

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
  size = "default",
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

  const sizeClasses = variant === PILL_VARIANT ? SIZE_CLASSES.pill : (SIZE_CLASSES[size] ?? SIZE_CLASSES.default);
  const disabledClasses = disabled || loading ? "opacity-40! cursor-not-allowed!" : "";

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={` ${BASE_CLASSES} ${sizeClasses} ${VARIANT_CLASSES[variant] ?? DEFAULT_VARIANT_CLASSES} ${disabledClasses} ${className} `}
      style={style}
      {...props}
    >
      {loading ? (
        <>
          <Spinner variant="svg" size="md" className="mr-2 -ml-1" />
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
