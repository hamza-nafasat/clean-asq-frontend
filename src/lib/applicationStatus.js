export const APPLICATION_STATUS = {
  draft: "draft",
  submitted: "submitted",
};

const META = {
  [APPLICATION_STATUS.draft]: {
    label: "Draft",
    description: "Not submitted yet",
    className: "bg-amber-100 text-amber-800 ring-amber-200",
  },
  [APPLICATION_STATUS.submitted]: {
    label: "Submitted",
    description: "Sent for review",
    className: "bg-green-100 text-green-800 ring-green-200",
  },
};

const UNKNOWN = {
  label: "Unknown",
  description: "",
  className: "bg-gray-100 text-gray-700 ring-gray-200",
};

export const getApplicationStatusMeta = (status) => META[status] ?? UNKNOWN;
