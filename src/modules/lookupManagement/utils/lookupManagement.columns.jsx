import { FiEdit2, FiTrash2 } from "react-icons/fi";
import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import ReadOnlyTextCell from "@/components/shared/ReadOnlyTextCell";
import { ROW_ACTIONS } from "@/constants";

const BADGE_CLASSES =
  "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset";
const ACTIVE_BADGE_TONE = "bg-green-100 text-green-800 ring-green-200";
const INACTIVE_BADGE_TONE = "bg-gray-100 text-gray-700 ring-gray-200";

const getActiveLabel = (row) => (row?.isActive ? "Active" : "Inactive");

const renderActiveBadge = (row) => (
  <span className={`${BADGE_CLASSES} ${row?.isActive ? ACTIVE_BADGE_TONE : INACTIVE_BADGE_TONE}`}>
    {getActiveLabel(row)}
  </span>
);

export const buildLookupColumns = ({ openRowId, getRowRef, onToggleMenu, onEdit, onDelete }) =>
  [
    {
      name: "Lookup Key",
      selector: (row) => row?.searchObjectKey || "",
      sortable: true,
    },
    {
      name: "Company Identification",
      cell: (row) => (Array.isArray(row.companyIdentification) ? row.companyIdentification.join(", ") : "—"),
    },
    {
      name: "Search Terms",
      selector: (row) => row?.searchTerms || "",
      sortable: true,
    },
    {
      name: "Extraction Prompt",
      selector: (row) => row?.extractionPrompt || "",
      sortable: true,
      width: "20%",
      cell: (row) => <ReadOnlyTextCell value={row?.extractionPrompt || ""} />,
    },
    {
      name: "Extract As",
      cell: (row) => row?.extractAs || "—",
    },
    {
      name: "Status",
      selector: getActiveLabel,
      sortable: true,
      cell: renderActiveBadge,
    },
    (onEdit || onDelete) && {
      name: "Action",
      cell: (row) => {
        const buttons = [
          onEdit && {
            name: ROW_ACTIONS.EDIT,
            icon: <FiEdit2 size={16} className="mr-2" />,
            onClick: onEdit,
          },
          onDelete && {
            name: ROW_ACTIONS.DELETE,
            icon: <FiTrash2 size={16} className="mr-2" />,
            onClick: onDelete,
          },
        ].filter(Boolean);

        return (
          <RowActionMenuCell
            row={row}
            buttons={buttons}
            isOpen={openRowId === row._id}
            onToggle={() => onToggleMenu?.(row._id)}
            rowRef={getRowRef(row._id)}
          />
        );
      },
    },
  ].filter(Boolean);
