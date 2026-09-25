import { Pencil, Trash } from "lucide-react";
import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import ReadOnlyTextCell from "@/components/shared/ReadOnlyTextCell";
import { ROW_ACTIONS } from "@/constants";

export const buildLookupColumns = ({ actionMenu, getRowRef, onToggleMenu, onEdit, onDelete }) =>
  [
    {
      name: "Search Object Key",
      selector: (row) => row?.searchObjectKey || "",
      sortable: true,
    },
    {
      name: "Company Identification",
      cell: (row) =>
        Array.isArray(row.companyIdentification) ? <span>{row.companyIdentification.join(", ")}</span> : <span>-</span>,
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
      cell: (row) => <ReadOnlyTextCell value={row?.extractionPrompt || ""} />,
    },
    {
      name: "Extract As",
      cell: (row) => <span>{row?.extractAs || "-"}</span>,
    },
    {
      name: "Active",
      cell: (row) => <input type="checkbox" checked={!!row?.isActive} disabled className="cursor-not-allowed" />,
    },
    (onEdit || onDelete) && {
      name: "Action",
      cell: (row) => {
        const buttons = [
          onEdit && { name: ROW_ACTIONS.EDIT, icon: <Pencil size={16} className="mr-2" />, onClick: () => onEdit(row) },
          onDelete && {
            name: ROW_ACTIONS.DELETE,
            icon: <Trash size={16} className="mr-2" />,
            onClick: async () => onDelete(row),
          },
        ].filter(Boolean);

        return (
          <RowActionMenuCell
            row={row}
            buttons={buttons}
            isOpen={actionMenu === row._id}
            onToggle={() => onToggleMenu?.(row._id)}
            rowRef={getRowRef(row.id)}
            iconClassName="cursor-pointer"
          />
        );
      },
    },
  ].filter(Boolean);
