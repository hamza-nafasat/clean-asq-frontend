import { getApplicationStatusMeta } from "@/lib/applicationStatus";

function ApplicationStatusBadge({ status, className = "" }) {
  const { label, description, className: tone } = getApplicationStatusMeta(status);

  return (
    <span
      title={description || undefined}
      data-testid={`application-status-${status}`}
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tone} ${className}`}
    >
      {label}
    </span>
  );
}

export default ApplicationStatusBadge;
