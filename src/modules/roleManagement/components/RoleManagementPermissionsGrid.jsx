import RoleManagementPermissionGroup from "./RoleManagementPermissionGroup";
import { groupPermissions } from "../utils/roleManagement.utils";

const RoleManagementPermissionsGrid = ({
  allPermissions = [],
  permissionIds = [],
  error = "",
  onChange,
  onToggleMany,
}) => {
  const groups = groupPermissions(allPermissions);
  const allIds = allPermissions.map((permission) => permission._id);

  return (
    <section className="mt-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-700">Access Permissions</h3>
        {onToggleMany && (
          <div className="flex gap-4 text-sm">
            <button type="button" className="text-primary hover:underline" onClick={() => onToggleMany(allIds, true)}>
              Select all
            </button>
            <button type="button" className="text-gray-600 hover:underline" onClick={() => onToggleMany(allIds, false)}>
              Clear all
            </button>
          </div>
        )}
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {groups.map((group) => (
          <RoleManagementPermissionGroup
            key={group.name}
            name={group.name}
            permissions={group.permissions}
            selectedIds={permissionIds}
            onChange={onChange}
            onToggleMany={onToggleMany}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
};

export default RoleManagementPermissionsGrid;
