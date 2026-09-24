import Checkbox from "@/components/shared/Checkbox";

const RoleManagementPermissionsGrid = ({ allPermissions = [], permissionIds = [], error = "", onChange }) => (
  <section className="mt-4">
    <h3 className="mb-2 text-sm font-medium text-gray-700">Access Permissions</h3>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {allPermissions.map((permission) => (
        <Checkbox
          key={permission._id}
          id={permission._id}
          name={permission._id}
          label={
            <>
              <span className="text-textPrimary block font-medium">{permission.title ?? permission.name}</span>
              {permission.description && (
                <span className="block text-xs text-gray-500 first-letter:uppercase">{permission.description}</span>
              )}
            </>
          }
          checked={permissionIds.includes(permission._id)}
          onChange={onChange}
          readOnly={!onChange}
          disabled={!onChange}
        />
      ))}
    </div>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </section>
);

export default RoleManagementPermissionsGrid;
