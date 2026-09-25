import useRowActionMenu from "@/hooks/useRowActionMenu";
import AppDataTable from "@/components/shared/AppDataTable";
import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import { TABLE_WRAPPER_RADII } from "@/utils/tableStyles";

const buildColumns = ({ actionMenu, onToggleMenu, getRowRef, rowButtons }) => [
  { name: "Name", selector: (row) => row?.name, sortable: true },
  { name: "Url", selector: (row) => row?.url || "N/A", sortable: true },
  { name: "logos", selector: (row) => row?.logos?.length || 0, sortable: true },
  { name: "Font family", selector: (row) => row?.fontFamily || "N/A", sortable: true },
  {
    name: "Action",
    cell: (row) => (
      <RowActionMenuCell
        row={row}
        buttons={rowButtons}
        isOpen={actionMenu === row?._id}
        onToggle={() => onToggleMenu(row?._id)}
        rowRef={getRowRef(row?._id)}
        buttonClassName="cursor-pointer rounded p-1 hover:bg-gray-100"
      />
    ),
  },
];

const BrandingTable = ({ brandings = [], rowButtons = [] }) => {
  const {
    openRowId: actionMenu,
    setOpenRowId: setActionMenu,
    toggleMenu,
    getRowRef,
  } = useRowActionMenu({ closeOnOutsideClick: true });

  const buttonsWithClose = rowButtons.map((button) => ({
    ...button,
    onClick: async (row) => {
      await button.onClick(row);
      setActionMenu(null);
    },
  }));

  return (
    <AppDataTable
      data={brandings}
      columns={buildColumns({ actionMenu, onToggleMenu: toggleMenu, getRowRef, rowButtons: buttonsWithClose })}
      wrapperRadius={TABLE_WRAPPER_RADII.MD}
      highlightOnHover
      fixedHeader
      persistTableHead
      responsive
      pagination
    />
  );
};

export default BrandingTable;
