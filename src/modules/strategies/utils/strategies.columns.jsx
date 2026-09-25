import { FiEdit2, FiTrash2 } from "react-icons/fi";
import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import { ROW_ACTIONS } from "@/constants";

const getLookupKeys = (row) =>
  Array.isArray(row?.searchStrategies) ? row.searchStrategies.map((item) => item?.searchObjectKey).join(", ") : "-";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-US") : "—");

const renderFormsCell = (row, forms) => {
  const activeFormIds = new Set((forms || []).map((f) => String(f._id)));
  const rowForms = row?.forms || [];
  if (!rowForms.length) return <span className="text-gray-400">—</span>;
  return (
    <span className="flex flex-wrap gap-x-1">
      {rowForms.map((item, index) => {
        const isStale = !item?._id || (forms && !activeFormIds.has(String(item._id)));
        const separator = index < rowForms.length - 1 ? "," : "";
        return isStale ? (
          <span
            key={item?._id ?? `stale-${item?.name}`}
            className="text-amber-600"
            title="This form no longer exists — the strategy has a stale reference"
          >
            {item?.name || item?.headerText || "(deleted)"} <span aria-hidden="true">⚠</span>
            <span className="sr-only">(form no longer exists)</span>
            {separator}
          </span>
        ) : (
          <span key={item._id}>
            {item?.name || item?.headerText}
            {separator}
          </span>
        );
      })}
    </span>
  );
};

export const buildStrategiesColumns = ({ forms, openRowId, getRowRef, onToggleMenu, onEdit, onDelete }) =>
  [
    {
      name: "Name",
      selector: (row) => row?.name || "",
      sortable: true,
    },
    {
      name: "Forms",
      cell: (row) => renderFormsCell(row, forms),
    },
    {
      name: "Lookup Keys",
      selector: getLookupKeys,
      cell: getLookupKeys,
      grow: 2,
      sortable: true,
    },
    {
      name: "Created At",
      selector: (row) => row?.createdAt || "",
      sortable: true,
      cell: (row) => formatDate(row?.createdAt),
    },
    {
      name: "Updated At",
      selector: (row) => row?.updatedAt || "",
      sortable: true,
      cell: (row) => formatDate(row?.updatedAt),
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
