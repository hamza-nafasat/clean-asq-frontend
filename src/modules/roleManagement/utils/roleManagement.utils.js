import { FIELD_TYPES } from "@/constants";
import { PERMISSION_GROUPS, SYSTEM_ROLES } from "@/utils/permissions";
import { CREATED_DATE_OPTIONS, DATE_LOCALE, OTHER_PERMISSION_GROUP } from "./roleManagement.constants";

export const isSystemRole = (role) => Object.values(SYSTEM_ROLES).includes(role?.name);

export const isAdminRole = (role) => role?.name === SYSTEM_ROLES.ADMIN;

export const formatCreatedDate = (date) => (date ? new Date(date).toLocaleDateString(DATE_LOCALE, CREATED_DATE_OPTIONS) : "");

export const getPermissionPercent = (count, total) => (total ? Math.min(100, Math.round((count / total) * 100)) : 0);

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

// add or remove many ids at once
export const setRolePermissions = (prev, ids, checked) => {
  const rest = prev.permissions.filter((id) => !ids.includes(id));
  return { ...prev, permissions: checked ? [...rest, ...ids] : rest };
};

// permission records in their module groups
export const groupPermissions = (permissions = []) => {
  const byName = new Map(permissions.map((permission) => [permission.name, permission]));
  const groupedNames = new Set(PERMISSION_GROUPS.flatMap((group) => group.permissions));
  const groups = PERMISSION_GROUPS.map((group) => ({
    name: group.name,
    permissions: group.permissions.map((name) => byName.get(name)).filter(Boolean),
  }));
  const other = permissions.filter((permission) => !groupedNames.has(permission.name));
  return [...groups, { name: OTHER_PERMISSION_GROUP, permissions: other }].filter((group) => group.permissions.length);
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
