import { SUBMISSION_TYPES } from "@/constants";

const STATUS_META = {
  [SUBMISSION_TYPES.DRAFT]: {
    label: "Draft",
    description: "Not submitted yet",
    className: "bg-amber-100 text-amber-800 ring-amber-200",
  },
  [SUBMISSION_TYPES.SUBMITTED]: {
    label: "Submitted",
    description: "Sent for review",
    className: "bg-green-100 text-green-800 ring-green-200",
  },
};

const UNKNOWN_STATUS_META = { label: "Unknown", description: "", className: "bg-gray-100 text-gray-700 ring-gray-200" };

const MyApplicationsStatusBadge = ({ status, className = "" }) => {
  const { label, description, className: tone } = STATUS_META[status] ?? UNKNOWN_STATUS_META;

  return (
    <span
      title={description || undefined}
      data-testid={`application-status-${status}`}
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tone} ${className}`}
    >
      {label}
    </span>
  );
};

export default MyApplicationsStatusBadge;
