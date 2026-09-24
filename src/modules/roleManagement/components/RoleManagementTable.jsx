import useRowActionMenu from "@/hooks/useRowActionMenu";
import AppDataTable from "@/components/shared/AppDataTable";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import { getDatePart } from "@/utils/date";

const buildColumns = ({ openRowId, getRowRef, getRowActions, onToggleMenu }) => [
  { name: "Role Name", selector: (row) => row.name, sortable: true },
  { name: "Created At", selector: (row) => getDatePart(row.createdAt), sortable: true },
  {
    name: "Action",
    cell: (row) => (
      <RowActionMenuCell
        row={row}
        buttons={getRowActions(row)}
        isOpen={openRowId === row._id}
        onToggle={() => onToggleMenu(row._id)}
        rowRef={getRowRef(row._id)}
      />
    ),
  },
];

const RoleManagementTable = ({ roles = [], isLoading = false, isError = false, onRetry, getRowActions }) => {
  const { openRowId, setOpenRowId, toggleMenu, getRowRef } = useRowActionMenu({ closeOnOutsideClick: true });

  // close menu before each action
  const getClosingRowActions = (row) =>
    getRowActions(row).map((action) => ({
      ...action,
      onClick: (clickedRow) => {
        setOpenRowId(null);
        action.onClick(clickedRow);
      },
    }));

  if (isError) {
    return (
      <EmptyState title="Could not load roles">
        <Button type="button" label="Try again" onClick={onRetry} className="mx-auto mt-3" />
      </EmptyState>
    );
  }

  return (
    <AppDataTable
      data-testid="roles-table"
      data={roles}
      columns={buildColumns({ openRowId, getRowRef, getRowActions: getClosingRowActions, onToggleMenu: toggleMenu })}
      pagination
      highlightOnHover
      progressPending={isLoading}
      noDataComponent="No roles found"
      className="rounded-t-xl!"
    />
  );
};

export default RoleManagementTable;
