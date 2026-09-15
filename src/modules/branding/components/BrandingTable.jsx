import { useEffect, useRef, useState, createRef } from "react";
import DataTable from "react-data-table-component";
import { MoreVertical } from "lucide-react";
import { ThreeDotEditViewDelete } from "@/components/shared/ThreeDotViewEditDelete";

const buildColumns = ({ actionMenu, setActionMenu, actionMenuRefs, rowButtons }) => [
  { name: "Name", selector: (row) => row?.name, sortable: true },
  { name: "Url", selector: (row) => row?.url || "N/A", sortable: true },
  { name: "logos", selector: (row) => row?.logos?.length || 0, sortable: true },
  { name: "Font family", selector: (row) => row?.fontFamily || "N/A", sortable: true },
  {
    name: "Action",
    cell: (row) => {
      if (!actionMenuRefs.current.has(row?._id)) actionMenuRefs.current.set(row?._id, createRef());
      return (
        <div className="relative" ref={actionMenuRefs.current.get(row?._id)}>
          <button
            type="button"
            onClick={() => setActionMenu((prev) => (prev === row?._id ? null : row?._id))}
            className="cursor-pointer rounded p-1 hover:bg-gray-100"
            aria-label="Actions"
          >
            <MoreVertical size={18} />
          </button>
          {actionMenu === row?._id && <ThreeDotEditViewDelete buttons={rowButtons} row={row} />}
        </div>
      );
    },
  },
];

const BrandingTable = ({ brandings = [], rowButtons = [], tableStyles = {}, isLoading = false }) => {
  const actionMenuRefs = useRef(new Map());
  const [actionMenu, setActionMenu] = useState(null);

  // close the open row menu on an outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideAllMenus = Array.from(actionMenuRefs.current.values()).every(
        (ref) => !ref.current?.contains(event.target),
      );
      if (clickedOutsideAllMenus) setActionMenu(null);
    };
    if (actionMenu !== null) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionMenu]);

  const buttonsWithClose = rowButtons.map((button) => ({
    ...button,
    onClick: async (row) => {
      await button.onClick(row);
      setActionMenu(null);
    },
  }));

  return (
    <DataTable
      data={brandings}
      columns={buildColumns({ actionMenu, setActionMenu, actionMenuRefs, rowButtons: buttonsWithClose })}
      customStyles={tableStyles}
      progressPending={isLoading}
      noDataComponent="No Brandings Found"
      className="rounded-md!"
      highlightOnHover
      fixedHeader
      persistTableHead
      responsive
      pagination
    />
  );
};

export default BrandingTable;
