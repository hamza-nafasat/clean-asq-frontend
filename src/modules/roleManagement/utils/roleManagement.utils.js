import { FIELD_TYPES } from "@/constants";

export const getDatePart = (date) => date?.split("T")?.[0];

// add form keeps permission ids
export const applyRoleFormChange = (prev, { name, value, type, checked }) => {
  if (type !== FIELD_TYPES.CHECKBOX) return { ...prev, [name]: value };
  const permissions = checked ? [...prev.permissions, name] : prev.permissions.filter((id) => id !== name);
  return { ...prev, permissions };
};

// edit form keeps permission objects
export const applyRolePermissionChange = (prev, { name, checked }, permission) => {
  let permissions = prev?.permissions || [];
  if (checked) {
    if (!permissions.some((p) => p._id === name)) {
      permissions = [...permissions, permission];
    }
  } else {
    permissions = permissions.filter((p) => p._id !== name);
  }
  return { ...prev, permissions };
};

const getPermissionIds = (permissions = [], permissionNames) =>
  permissions.filter((p) => permissionNames.includes(p.name)).map((p) => p._id);

const runRoleAction = async (request, fallbackMessage, toastError) => {
  try {
    const res = await request();
    if (!res?.success) throw new Error(res?.message);
  } catch (err) {
    toastError(err?.data?.message || err?.message || fallbackMessage);
    throw err;
  }
};

export const buildRoleScreenState = (roles = [], permissions = []) => ({
  roles: roles.map((r) => ({
    _id: r._id,
    name: r.name,
    permissions: (r.permissions || []).map((p) => p.name),
  })),
  availablePermissions: permissions.map((p) => ({ _id: p._id, name: p.name })),
});

export const buildRoleScreenActions = ({
  roles = [],
  permissions = [],
  createRole,
  editRole,
  deleteRole,
  refreshUser,
  toastError,
}) => ({
  createRole: ({ name, permissionNames }) =>
    runRoleAction(
      async () => {
        const res = await createRole({ name, permissions: getPermissionIds(permissions, permissionNames) }).unwrap();
        if (res?.success) await refreshUser();
        return res;
      },
      "Failed to create role",
      toastError,
    ),
  updateRole: async ({ roleId, name, permissionNames }) => {
    const role = roles.find((r) => r._id === roleId);
    if (!role) throw new Error("Role not found");
    const permissionIds = permissionNames
      ? getPermissionIds(permissions, permissionNames)
      : (role.permissions || []).map((p) => p._id);
    return runRoleAction(
      async () => {
        const res = await editRole({ _id: roleId, name: name || role.name, permissions: permissionIds }).unwrap();
        if (res?.success) await refreshUser();
        return res;
      },
      "Failed to update role",
      toastError,
    );
  },
  deleteRole: ({ roleId }) =>
    runRoleAction(() => deleteRole({ _id: roleId }).unwrap(), "Failed to delete role", toastError),
});
