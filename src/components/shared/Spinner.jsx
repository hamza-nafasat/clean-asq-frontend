const SVG_SIZE_CLASSES = {
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const BORDER_SIZE_CLASSES = {
  xs: "h-3 w-3 border-2",
  sm: "h-3.5 w-3.5 border-2",
  md: "h-4 w-4 border-2",
  lg: "h-5 w-5 border-2",
  xl: "h-10 w-10 border-4",
};

const TONE_CLASSES = {
  muted: "border-gray-300 border-t-gray-600",
  neutral: "border-gray-300 border-t-primary",
  light: "border-white/40 border-t-white",
  primary: "border-primary/20 border-t-primary",
  primarySoft: "border-primary/30 border-t-primary",
};

const LOADER_CLASSES = "border-light h-8 w-8 animate-spin rounded-full border-b-2";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

// variant: "svg" (circle + arc), "border" (ring with coloured top), "loader" (page loader ring)
const Spinner = ({ variant = "border", size = "xs", tone = "primary", as = "span", className = "" }) => {
  if (variant === "svg") {
    return (
      <svg
        className={joinClasses(className, SVG_SIZE_CLASSES[size], "animate-spin text-current")}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }

  if (variant === "loader") return <div className={LOADER_CLASSES}></div>;

  const borderClasses = joinClasses(BORDER_SIZE_CLASSES[size], TONE_CLASSES[tone], "rounded-full animate-spin", className);
  return as === "div" ? <div className={borderClasses} /> : <span className={borderClasses} />;
};

export default Spinner;
