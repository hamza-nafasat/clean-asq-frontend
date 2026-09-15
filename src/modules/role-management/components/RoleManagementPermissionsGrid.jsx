import Checkbox from "@/components/shared/Checkbox";

const RoleManagementPermissionsGrid = ({ allPermissions = [], permissions = [], onChange }) => {
  const isViewMode = !onChange;

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-medium text-gray-700">Access Permissions</h3>
      <div className="grid grid-cols-2 gap-2">
        {allPermissions?.map((permission) => (
          <Checkbox
            key={permission._id}
            id={permission._id}
            value={permission}
            name={permission._id}
            label={permission.name}
            checked={permissions.some((p) => p._id === permission._id)}
            onChange={isViewMode ? null : (e) => onChange?.(e, permission)}
            disabled={isViewMode}
          />
        ))}
      </div>
    </div>
  );
};

export default RoleManagementPermissionsGrid;
