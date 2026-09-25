import { useEffect, useRef } from "react";

const RoleManagementPermissionGroup = ({ name, permissions = [], selectedIds = [], onChange, onToggleMany }) => {
  const moduleCheckboxRef = useRef(null);
  const ids = permissions.map((permission) => permission._id);
  const selectedCount = ids.filter((id) => selectedIds.includes(id)).length;
  const isAllSelected = selectedCount === ids.length;
  const isPartlySelected = selectedCount > 0 && !isAllSelected;
  const isReadOnly = !onChange;
  const moduleId = `permission-group-${name.toLowerCase().replace(/\s+/g, "-")}`;

  // indeterminate exists only as a property
  useEffect(() => {
    if (moduleCheckboxRef.current) moduleCheckboxRef.current.indeterminate = isPartlySelected;
  }, [isPartlySelected]);

  return (
    <fieldset className="border-frameColor min-w-0 rounded-lg border p-4">
      <legend className="sr-only">{name}</legend>
      <div className="border-frameColor flex items-center gap-2 border-b pb-2">
        <input
          ref={moduleCheckboxRef}
          type="checkbox"
          id={moduleId}
          checked={isAllSelected}
          onChange={(e) => onToggleMany?.(ids, e.target.checked)}
          disabled={isReadOnly}
          className="accent-primary h-4 w-4 shrink-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <label htmlFor={moduleId} className="text-textPrimary min-w-0 truncate text-sm font-semibold">
          {name}
        </label>
        <span className="ml-auto shrink-0 text-xs text-gray-500">
          {selectedCount}/{ids.length}
        </span>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {permissions.map((permission) => (
          <li key={permission._id} className="flex items-start gap-2">
            <input
              type="checkbox"
              id={permission._id}
              name={permission._id}
              checked={selectedIds.includes(permission._id)}
              onChange={onChange}
              disabled={isReadOnly}
              className="accent-primary mt-0.5 h-4 w-4 shrink-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <label htmlFor={permission._id} className="min-w-0 text-sm text-gray-700">
              <span className="text-textPrimary block font-medium">{permission.title ?? permission.name}</span>
              {permission.description && (
                <span className="block text-xs text-gray-500 first-letter:uppercase">{permission.description}</span>
              )}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
};

export default RoleManagementPermissionGroup;
