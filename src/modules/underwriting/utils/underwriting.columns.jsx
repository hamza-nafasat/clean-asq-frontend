import { sanitizeHtml } from "@/lib/sanitizeHtml";
import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import { formatDateTime } from "@/utils/date";
import { HISTORY_STATUS_LABELS } from "./underwriting.constants";
import { getSectionName, orDash } from "./underwriting.utils";

const PILL_CLASSES = "rounded-sm bg-gray-100 px-2.5 py-0.75 text-xs font-bold text-gray-700";

// date column that sorts by the real date
const dateColumn = {
  name: "Date/Time",
  selector: (row) => row.updatedAt,
  sortable: true,
  wrap: true,
  cell: (row) => formatDateTime(row.updatedAt),
};

export const buildHistoryColumns = ({ sectionNames = {} }) => [
  dateColumn,
  {
    name: "User",
    selector: (row) => row.name || row.email,
    sortable: true,
    wrap: true,
    cell: (row) => (
      <span className="min-w-0">
        <span className="text-textPrimary block font-medium">{orDash(row.name)}</span>
        <span className="block truncate text-xs text-gray-500">{row.email}</span>
      </span>
    ),
  },
  {
    name: "User Type",
    selector: (row) => row.role,
    sortable: true,
    cell: (row) => <span className="capitalize">{orDash(row.role)}</span>,
  },
  { name: "Section", selector: (row) => getSectionName(sectionNames, row.sectionKey), sortable: true, wrap: true },
  {
    name: "Action/Status",
    selector: (row) => row.status,
    sortable: true,
    cell: (row) => <span className={PILL_CLASSES}>{HISTORY_STATUS_LABELS[row.status] ?? orDash(row.status)}</span>,
  },
  { name: "Comment/Details", selector: (row) => orDash(row.comment), sortable: true, wrap: true, grow: 2 },
];

export const buildVersionColumns = ({ openRowId, getRowRef, onToggleMenu, buttons }) => [
  dateColumn,
  { name: "User Name", selector: (row) => orDash(row.actor?.name), sortable: true },
  { name: "Email", selector: (row) => orDash(row.actor?.email), sortable: true, wrap: true },
  {
    name: "Role",
    selector: (row) => row.actor?.role,
    sortable: true,
    cell: (row) => <span className="capitalize">{orDash(row.actor?.role)}</span>,
  },
  { name: "Form Name", selector: (row) => orDash(row.form?.name), sortable: true },
  { name: "Version", selector: (row) => row.version, sortable: true },
  { name: "Fields Changed", selector: (row) => row.diff?.length ?? 0, sortable: true },
  {
    name: "Action",
    cell: (row) => (
      <RowActionMenuCell
        row={row}
        buttons={buttons}
        isOpen={openRowId === row._id}
        onToggle={() => onToggleMenu(row._id)}
        rowRef={getRowRef(row._id)}
        buttonClassName="cursor-pointer rounded p-1 hover:bg-gray-100"
      />
    ),
  },
];

export const ALERT_COLUMNS = [
  { name: "Rule No", selector: (row) => row.number, sortable: true, width: "110px" },
  {
    name: "Alert Name",
    selector: (row) => row.name,
    sortable: true,
    width: "200px",
    cell: (row) => <span className="text-textPrimary font-semibold capitalize">{row.name}</span>,
  },
  {
    name: "Alert Message",
    selector: (row) => row.message,
    sortable: true,
    grow: 2,
    wrap: true,
    cell: (row) => (
      <div className="text-textPrimary border-frameColor w-full rounded-md border p-2 text-sm">
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(row.message) || "" }} />
        {row.error && <span className="text-sm text-red-500">{row.error}</span>}
      </div>
    ),
  },
];
