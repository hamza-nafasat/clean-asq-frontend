import { cn } from "@/lib/utils";

// page title, description and actions
const PageHeading = ({ title, description, actions, className }) => (
  <header className={cn("flex flex-wrap items-center justify-between gap-4", className)}>
    <div className="min-w-0">
      <h1 className="text-textPrimary text-xl font-semibold md:text-2xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-gray-500 md:text-base">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </header>
);

export default PageHeading;
