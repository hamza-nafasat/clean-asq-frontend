import { createRef } from "react";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { ThreeDotEditViewDelete } from "@/components/shared/ThreeDotViewEditDelete";
import { ROW_ACTIONS } from "@/constants";

const formatDate = (value) => new Date(value)?.toLocaleDateString("en-US") || "";

const renderFormsCell = (row, forms) => {
  const activeFormIds = new Set((forms || []).map((f) => String(f._id)));
  const parts = (row?.forms || []).map((item, i) => {
    const isStale = !item?._id || !activeFormIds.has(String(item._id));
    return isStale ? (
      <span key={i} className="text-amber-600" title="This form no longer exists — the strategy has a stale reference">
        {item?.name || item?.headerText || "(deleted)"} ⚠
      </span>
    ) : (
      <span key={i}>{item?.name || item?.headerText}</span>
    );
  });
  if (!parts.length) return <span className="text-gray-400">—</span>;
  return (
    <span className="flex flex-wrap gap-x-1">
      {parts.map((p, i) => (i < parts.length - 1 ? [p, <span key={`sep-${i}`}>,&nbsp;</span>] : p))}
    </span>
  );
};

export const buildStrategiesColumns = ({ forms, actionMenu, actionMenuRefs, onToggleMenu, onEdit, onDelete }) => [
  {
    name: "Name",
    selector: (row) => row?.name || "",
    sortable: true,
  },
  {
    name: "Form",
    cell: (row) => renderFormsCell(row, forms),
  },
  {
    name: "Strategies Key",
    cell: (row) =>
      Array.isArray(row?.searchStrategies) ? row?.searchStrategies?.map((item) => item?.searchObjectKey).join(", ") : "-",
    grow: 2,
    sortable: true,
  },
  {
    name: "Created At",
    sortable: true,
    cell: (row) => formatDate(row?.createdAt),
  },
  {
    name: "Updated At",
    cell: (row) => formatDate(row?.updatedAt),
  },
  {
    name: "Action",
    cell: (row) => {
      if (!actionMenuRefs.current.has(row.id)) {
        actionMenuRefs.current.set(row.id, createRef());
      }
      const rowRef = actionMenuRefs.current.get(row.id);
      const buttons = [
        { name: ROW_ACTIONS.EDIT, icon: <Pencil size={16} className="mr-2" />, onClick: () => onEdit?.(row) },
        { name: ROW_ACTIONS.DELETE, icon: <Trash size={16} className="mr-2" />, onClick: () => onDelete?.(row) },
      ];

      return (
        <div className="relative" ref={rowRef}>
          <button
            type="button"
            onClick={() => onToggleMenu?.(row._id)}
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Actions"
          >
            <MoreVertical className="cursor-pointer" size={18} />
          </button>

          {actionMenu === row._id && <ThreeDotEditViewDelete buttons={buttons} row={row} />}
        </div>
      );
    },
  },
];
