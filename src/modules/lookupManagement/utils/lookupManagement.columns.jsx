import { createRef } from "react";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { ThreeDotEditViewDelete } from "@/components/shared/ThreeDotViewEditDelete";
import { ROW_ACTIONS } from "@/constants";

export const buildLookupColumns = ({ actionMenu, actionMenuRefs, onToggleMenu, onEdit, onDelete }) => [
  {
    name: "Search Object Key",
    selector: (row) => row?.searchObjectKey || "",
    sortable: true,
  },
  {
    name: "Company Identification",
    cell: (row) =>
      Array.isArray(row.companyIdentification) ? (
        <span>{row.companyIdentification.join(", ")}</span>
      ) : (
        <span>-</span>
      ),
  },
  {
    name: "Search Terms",
    selector: (row) => row?.searchTerms || "",
    sortable: true,
  },
  {
    name: "Extraction Prompt",
    sortable: true,
    width: "20%",
    cell: (row) => (
      <textarea
        value={row?.extractionPrompt || ""}
        readOnly
        className="text-textPrimary border-frameColor w-full resize-none rounded-md border bg-[#FAFBFF] p-2 text-sm"
        rows={2}
      />
    ),
  },
  {
    name: "Extract As",
    cell: (row) => <span>{row?.extractAs || "-"}</span>,
  },
  {
    name: "Active",
    cell: (row) => <input type="checkbox" checked={!!row?.isActive} disabled className="cursor-not-allowed" />,
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
        { name: ROW_ACTIONS.DELETE, icon: <Trash size={16} className="mr-2" />, onClick: async () => onDelete?.(row) },
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
