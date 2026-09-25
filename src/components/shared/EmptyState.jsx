import { FiInbox } from "react-icons/fi";
import { cn } from "@/lib/utils";

// panel: the full-width "nothing here" card
const PANEL_CLASSES = {
  root: "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14",
  icon: "bg-primary/10 text-primary rounded-full p-4",
  text: "text-center [&>p:first-child]:text-base",
  description: "mt-1 max-w-md text-sm text-gray-500",
};

const EmptyState = ({
  variant = "default",
  icon = null,
  title = "",
  description = null,
  className = "",
  iconClassName = "",
  textClassName = "text-center",
  descriptionClassName = "text-xs text-gray-400 mt-1",
  children = null,
}) => {
  if (variant === "panel") {
    return (
      <div className={cn(PANEL_CLASSES.root, className)}>
        <div className={PANEL_CLASSES.icon}>{icon ?? <FiInbox size={28} />}</div>
        <div className={PANEL_CLASSES.text}>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          {description && <p className={PANEL_CLASSES.description}>{description}</p>}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={iconClassName}>{icon}</div>
      <div className={textClassName}>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className={descriptionClassName}>{description}</p>
      </div>
      {children}
    </div>
  );
};

export default EmptyState;
