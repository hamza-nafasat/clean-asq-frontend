import useRowActionMenu from "@/hooks/useRowActionMenu";
import { FiAlertCircle } from "react-icons/fi";
import AppDataTable from "@/components/shared/AppDataTable";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import RoleManagementPermissionCount from "./RoleManagementPermissionCount";
import { formatCreatedDate, isSystemRole } from "../utils/roleManagement.utils";

const buildColumns = ({ totalPermissions, openRowId, getRowRef, getRowActions, onToggleMenu }) => [
  {
    name: "Role",
    selector: (row) => row.name,
    sortable: true,
    grow: 2,
    cell: (row) => (
      <span className="flex min-w-0 items-center gap-2">
        <span className="text-textPrimary truncate font-medium capitalize">{row.name}</span>
        {isSystemRole(row) && (
          <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">System</span>
        )}
      </span>
    ),
  },
  {
    name: "Permissions",
    selector: (row) => row.permissions?.length ?? 0,
    sortable: true,
    grow: 2,
    cell: (row) => <RoleManagementPermissionCount count={row.permissions?.length ?? 0} total={totalPermissions} />,
  },
  {
    name: "Created",
    selector: (row) => row.createdAt,
    format: (row) => formatCreatedDate(row.createdAt),
    sortable: true,
  },
  {
    name: "Actions",
    right: true,
    width: "100px",
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

const RoleManagementTable = ({
  roles = [],
  totalPermissions = 0,
  isLoading = false,
  isError = false,
  onRetry,
  getRowActions,
}) => {
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
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load roles">
        <Button type="button" label="Try again" onClick={onRetry} />
      </EmptyState>
    );
  }

  return (
    <AppDataTable
      data-testid="roles-table"
      data={roles}
      columns={buildColumns({
        totalPermissions,
        openRowId,
        getRowRef,
        getRowActions: getClosingRowActions,
        onToggleMenu: toggleMenu,
      })}
      pagination
      highlightOnHover
      progressPending={isLoading}
      noDataComponent="No roles yet"
      emptyDescription="Create a role to control what people can do."
      className="rounded-t-xl!"
    />
  );
};

export default RoleManagementTable;
