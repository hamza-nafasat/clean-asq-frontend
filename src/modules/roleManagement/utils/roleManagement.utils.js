import { FIELD_TYPES } from "@/constants";
import { SYSTEM_ROLES } from "@/utils/permissions";

export const isSystemRole = (role) => Object.values(SYSTEM_ROLES).includes(role?.name);

export const isAdminRole = (role) => role?.name === SYSTEM_ROLES.ADMIN;

export const toRoleForm = (role) => ({
  _id: role._id,
  roleName: role.name,
  permissions: (role.permissions ?? []).map((permission) => permission._id),
});

export const getRoleNameError = (roleName) => (roleName.trim() ? "" : "Please enter a role name");

export const getPermissionsError = (permissions) => (permissions.length ? "" : "Please select at least one permission");

// checkbox names are permission ids
export const applyRoleFormChange = (prev, { name, value, type, checked }) => {
  if (type !== FIELD_TYPES.CHECKBOX) return { ...prev, [name]: value };
  const permissions = checked ? [...prev.permissions, name] : prev.permissions.filter((id) => id !== name);
  return { ...prev, permissions };
};

const getPermissionIds = (permissions, permissionNames) =>
  permissions.filter((permission) => permissionNames.includes(permission.name)).map((permission) => permission._id);

const runRoleAction = async (request, fallbackMessage, toastError) => {
  try {
    const res = await request();
    if (!res?.success) throw new Error(res?.message);
  } catch (error) {
    toastError(error?.data?.message || error?.message || fallbackMessage);
    throw error;
  }
};

export const buildRoleScreenState = (roles = [], permissions = []) => ({
  roles: roles.map((role) => ({
    _id: role._id,
    name: role.name,
    permissions: (role.permissions ?? []).map((permission) => permission.name),
  })),
  availablePermissions: permissions.map((permission) => ({ _id: permission._id, name: permission.name })),
});

export const buildRoleScreenActions = ({ roles = [], permissions = [], createRole, editRole, deleteRole, toastError }) => ({
  createRole: ({ name, permissionNames }) =>
    runRoleAction(
      () => createRole({ name, permissions: getPermissionIds(permissions, permissionNames) }).unwrap(),
      "Failed to create role",
      toastError,
    ),
  updateRole: async ({ roleId, name, permissionNames }) => {
    const role = roles.find((item) => item._id === roleId);
    if (!role) throw new Error("Role not found");
    const permissionIds = permissionNames
      ? getPermissionIds(permissions, permissionNames)
      : (role.permissions ?? []).map((permission) => permission._id);
    return runRoleAction(
      () => editRole({ _id: roleId, name: name || role.name, permissions: permissionIds }).unwrap(),
      "Failed to update role",
      toastError,
    );
  },
  deleteRole: ({ roleId }) =>
    runRoleAction(() => deleteRole({ _id: roleId }).unwrap(), "Failed to delete role", toastError),
});
