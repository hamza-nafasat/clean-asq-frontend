import { DATE_TIME_OPTIONS } from "./underwriting.constants";

export const formatDateTime = (date) => new Date(date || "").toLocaleString("en-US", DATE_TIME_OPTIONS);

export const buildHistoryColumns = () => [
  { name: "Date/Time", selector: (row) => formatDateTime(row?.updatedAt), sortable: true, wrap: true },
  { name: "User", selector: (row) => `${row?.email}`, sortable: true, wrap: true },
  { name: "User Type", selector: (row) => `${row?.role}`, sortable: true, wrap: true },
  { name: "Section", selector: (row) => row?.sectionKey, sortable: true, wrap: true },
  { name: "Action/Status", selector: (row) => row?.status, sortable: true, wrap: true },
  { name: "Comment/Details", selector: (row) => row?.comment, sortable: true, wrap: true },
];

export const buildVersionColumns = () => [
  { name: "Date/Time", selector: (row) => formatDateTime(row?.updatedAt), sortable: true, wrap: true },
  { name: "User Name", selector: (row) => `${row?.actor?.name}`, sortable: true },
  { name: "email", selector: (row) => `${row?.actor?.email}`, sortable: true, wrap: true },
  { name: "Role", selector: (row) => `${row?.actor?.role}`, sortable: true },
  { name: "Form Name", selector: (row) => row?.form?.name, sortable: true },
  { name: "Version", selector: (row) => row?.version, sortable: true },
  { name: "Fields Changed", selector: (row) => row?.diff?.length, sortable: true, wrap: true },
];
