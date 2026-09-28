import { cn } from "@/lib/utils";
import { APPLICATION_STATUSES, SUBMISSION_TYPES } from "@/constants";

const STATUS_STYLES = {
  [APPLICATION_STATUSES.APPROVED]: "bg-green-100 text-green-600",
  [APPLICATION_STATUSES.REJECTED]: "bg-red-100 text-red-500",
  [APPLICATION_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800",
  [APPLICATION_STATUSES.REVIEWING]: "bg-blue-100 text-blue-500",
  [SUBMISSION_TYPES.DRAFT]: "bg-yellow-100 text-yellow-800",
};
const UNKNOWN_STATUS_STYLE = "bg-gray-100 text-gray-600";

const ApplicationStatusPill = ({ status = "", className = "" }) => (
  <span
    className={cn(
      "rounded-sm px-2.5 py-0.75 text-center font-bold capitalize",
      STATUS_STYLES[status.toLowerCase()] ?? UNKNOWN_STATUS_STYLE,
      className,
    )}
  >
    {status}
  </span>
);

export default ApplicationStatusPill;
