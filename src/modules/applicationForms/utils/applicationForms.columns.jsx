import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import ReadOnlyTextCell from "@/components/shared/ReadOnlyTextCell";

// columns for the sortable rules table
export const buildRuleColumns = ({ actionMenu, onToggleMenu, menuButtons, canReorder }) =>
  [
    canReorder && {
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
        <ReadOnlyTextCell
          value={row.prompt}
          className="text-textPrimary border border-frameColor w-full resize-none rounded-md bg-[#FAFBFF] p-2 text-sm"
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
    menuButtons.length > 0 && {
      name: "Actions",
      width: "96px",
      cell: (row) => (
        <RowActionMenuCell
          row={row}
          buttons={menuButtons}
          isOpen={actionMenu === row._id}
          onToggle={() => onToggleMenu(row._id)}
          buttonClassName="cursor-pointer rounded p-1 hover:bg-gray-100"
        />
      ),
    },
  ].filter(Boolean);
