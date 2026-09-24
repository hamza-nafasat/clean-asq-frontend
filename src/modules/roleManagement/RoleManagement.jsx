import { useState } from "react";
import { useSelector } from "react-redux";
import {
  useCreateRoleMutation,
  useDeleteSingleRoleMutation,
  useGetAllPermissionsQuery,
  useGetAllRolesQuery,
  useUpdateSingleRoleMutation,
} from "@/redux/apis/roleManagement.apis";
import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import useDeleteConfirmation from "@/hooks/useDeleteConfirmation";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import RoleManagementAddEditModal from "./components/RoleManagementAddEditModal";
import RoleManagementHeading from "./components/RoleManagementHeading";
import RoleManagementTable from "./components/RoleManagementTable";
import RoleManagementViewModal from "./components/RoleManagementViewModal";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import {
  INITIAL_ROLE_FORM,
  ROLE_ACTION_NAMES,
  ROLE_AI_CHAT_PATH,
  ROLE_MODAL_MODES,
  ROLE_SCREEN_CONTEXT,
} from "./utils/roleManagement.constants";
import {
  applyRoleFormChange,
  buildRoleScreenActions,
  buildRoleScreenState,
  getPermissionsError,
  getRoleNameError,
  isAdminRole,
  isSystemRole,
  toRoleForm,
} from "./utils/roleManagement.utils";

const SERVER_URL = getEnv("SERVER_URL");

const RoleManagement = () => {
  const user = useSelector((state) => state.auth.user);
  const canCreateRole = usePermission(PERMISSIONS.CREATE_ROLE);
  const canUpdateRole = usePermission(PERMISSIONS.UPDATE_ROLE);
  const canDeleteRole = usePermission(PERMISSIONS.DELETE_ROLE);
  const rolesQuery = useGetAllRolesQuery();
  const permissionsQuery = useGetAllPermissionsQuery();
  const [createRole, { isLoading: isCreatingRole }] = useCreateRoleMutation();
  const [editRole, { isLoading: isEditingRole }] = useUpdateSingleRoleMutation();
  const [deleteRole, { isLoading: isDeletingRole }] = useDeleteSingleRoleMutation();
  const [modalMode, setModalMode] = useState(null);
  const [roleForm, setRoleForm] = useState(INITIAL_ROLE_FORM);
  const [errors, setErrors] = useState({});
  const [roleToView, setRoleToView] = useState(null);

  const roles = rolesQuery.data?.data ?? [];
  const permissions = permissionsQuery.data?.data ?? [];
  const isEditMode = modalMode === ROLE_MODAL_MODES.EDIT;
  const roleBeingEdited = roles.find((role) => role._id === roleForm._id);

  const {
    target: roleToDelete,
    openConfirmation: openDeleteConfirmation,
    closeConfirmation,
    handleConfirm: handleDeleteRole,
  } = useDeleteConfirmation({
    onDelete: async (role) => {
      try {
        const res = await deleteRole({ _id: role._id }).unwrap();
        if (res?.success) {
          toast.success(res.message);
          return true;
        }
      } catch (error) {
        console.error("Delete role error:", error);
        toast.error(error?.data?.message || "Failed to delete role");
      }
    },
  });

  useScreenContext({
    ...ROLE_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}${ROLE_AI_CHAT_PATH}`,
    currentState: buildRoleScreenState(roles, permissions),
    actions: buildRoleScreenActions({ roles, permissions, createRole, editRole, deleteRole, toastError: toast.error }),
    deps: { roleCount: roles.length, permissionCount: permissions.length },
  });

  const handleOpenAdd = () => {
    setRoleForm(INITIAL_ROLE_FORM);
    setErrors({});
    setModalMode(ROLE_MODAL_MODES.ADD);
  };

  const handleOpenEdit = (role) => {
    setRoleForm(toRoleForm(role));
    setErrors({});
    setModalMode(ROLE_MODAL_MODES.EDIT);
  };

  const handleChange = (e) => {
    setRoleForm((prev) => applyRoleFormChange(prev, e.target));
    setErrors({});
  };

  const handleSubmit = async () => {
    const nextErrors = {
      roleName: getRoleNameError(roleForm.roleName),
      permissions: getPermissionsError(roleForm.permissions),
    };
    if (nextErrors.roleName || nextErrors.permissions) return setErrors(nextErrors);

    const body = { name: roleForm.roleName, permissions: roleForm.permissions };
    try {
      const res = isEditMode ? await editRole({ _id: roleForm._id, ...body }).unwrap() : await createRole(body).unwrap();
      if (res?.success) {
        toast.success(res.message);
        setModalMode(null);
      }
    } catch (error) {
      console.error("Save role error:", error);
      toast.error(error?.data?.message || (isEditMode ? "Failed to update role" : "Failed to create role"));
    }
  };

  const handleRetry = () => {
    rolesQuery.refetch();
    permissionsQuery.refetch();
  };

  // backend refuses the hidden actions
  const getRowActions = (role) => {
    const isOwnRole = role._id === user?.role?._id;
    const actions = [{ name: ROLE_ACTION_NAMES.VIEW, icon: <FiEye size={16} className="mr-2" />, onClick: setRoleToView }];
    if (canUpdateRole && !isOwnRole && !isAdminRole(role)) {
      actions.push({ name: ROLE_ACTION_NAMES.EDIT, icon: <FiEdit2 size={16} className="mr-2" />, onClick: handleOpenEdit });
    }
    if (canDeleteRole && !isOwnRole && !isSystemRole(role)) {
      actions.push({ name: ROLE_ACTION_NAMES.DELETE, icon: <FiTrash2 size={16} className="mr-2" />, onClick: openDeleteConfirmation });
    }
    return actions;
  };

  return (
    <article className="mt-5 w-full" data-testid="roles-page">
      <RoleManagementHeading canCreateRole={canCreateRole} isCreating={isCreatingRole} onAddRole={handleOpenAdd} />

      <RoleManagementTable
        roles={roles}
        isLoading={rolesQuery.isLoading || permissionsQuery.isLoading}
        isError={rolesQuery.isError || permissionsQuery.isError}
        onRetry={handleRetry}
        getRowActions={getRowActions}
      />

      <RoleManagementAddEditModal
        isOpen={Boolean(modalMode)}
        mode={modalMode ?? ROLE_MODAL_MODES.ADD}
        initialData={roleForm}
        errors={errors}
        allPermissions={permissions}
        isNameLocked={isEditMode && isSystemRole(roleBeingEdited)}
        isLoading={isCreatingRole || isEditingRole}
        onChange={handleChange}
        onClose={() => setModalMode(null)}
        onSubmit={handleSubmit}
      />

      <RoleManagementViewModal
        isOpen={Boolean(roleToView)}
        initialData={roleToView}
        allPermissions={permissions}
        onClose={() => setRoleToView(null)}
      />

      <ConfirmationModal
        isOpen={Boolean(roleToDelete)}
        onClose={closeConfirmation}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone.`}
        isLoading={isDeletingRole}
        confirmButtonText="Delete Role"
        confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
        cancelButtonText="Keep Role"
      />
    </article>
  );
};

export default RoleManagement;
