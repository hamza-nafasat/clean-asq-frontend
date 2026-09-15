import { MoreVertical } from "lucide-react";
import { ThreeDotEditViewDelete } from "@/components/shared/ThreeDotViewEditDelete";

// columns for the sortable rules table
export const buildRuleColumns = ({ actionMenu, onToggleMenu, menuButtons }) => [
  {
    name: "",
    width: "20px",
    cell: () => null,
    isDragHandle: true,
  },
  {
    name: "No",
    width: "64px",
    center: true,
    selector: (row) => row.order,
    cell: (row) => <span className="text-textPrimary text-sm">{row.order}</span>,
  },
  {
    name: "Rule Name",
    width: "192px",
    selector: (row) => row.name,
    cell: (row) => <span className="text-textPrimary font-semibold capitalize text-sm">{row.name}</span>,
  },
  {
    name: "Rule Prompt",
    grow: 1,
    selector: (row) => row.prompt,
    cell: (row) => (
      <textarea
        value={row.prompt}
        readOnly
        className="text-textPrimary border border-frameColor w-full resize-none rounded-md bg-[#FAFBFF] p-2 text-sm"
        rows={2}
      />
    ),
  },
  {
    name: "Category",
    width: "112px",
    selector: (row) => row.category,
    cell: (row) => <span className="font-semibold capitalize text-sm">{row.category}</span>,
  },
  {
    name: "Status",
    width: "96px",
    selector: (row) => row.isActive,
    cell: (row) => (
      <span className={`font-semibold capitalize text-sm ${row.isActive ? "text-green-600" : "text-red-500"}`}>
        {row.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    name: "Actions",
    width: "96px",
    cell: (row) => (
      <div className="relative">
        <button
          type="button"
          onClick={() => onToggleMenu(row._id)}
          className="cursor-pointer rounded p-1 hover:bg-gray-100"
          aria-label="Actions"
        >
          <MoreVertical size={18} />
        </button>
        {actionMenu === row._id && <ThreeDotEditViewDelete buttons={menuButtons} row={row} />}
      </div>
    ),
  },
];
