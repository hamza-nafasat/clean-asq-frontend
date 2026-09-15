import { createRef, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import {
  useCreateRoleMutation,
  useDeleteSingleRoleMutation,
  useGetAllPermissionsQuery,
  useGetAllRolesQuery,
  useUpdateSingleRoleMutation,
} from "@/redux/apis/role-management.apis";
import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import { Eye, MoreVertical, Pencil, Trash } from "lucide-react";
import DataTable from "react-data-table-component";
import { FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";
import useBranding from "@/hooks/useBranding";
import { useScreenContext } from "@/hooks/useScreenContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import { ThreeDotEditViewDelete } from "@/components/shared/ThreeDotViewEditDelete";
import getEnv from "@/utils/env";
import { getTableStyles } from "@/utils/tableStyles";
import RoleManagementAddEditModal from "./RoleManagementAddEditModal";
import RoleManagementViewModal from "./RoleManagementViewModal";
import {
  INITIAL_ROLE_FORM,
  ROLE_ACTION_NAMES,
  ROLE_AI_CHAT_PATH,
  ROLE_MODAL_MODES,
  ROLE_SCREEN_CONTEXT,
} from "../utils/role-management.constants";
import {
  applyRoleFormChange,
  applyRolePermissionChange,
  buildRoleScreenActions,
  buildRoleScreenState,
  getDatePart,
} from "../utils/role-management.utils";

const SERVER_URL = getEnv("SERVER_URL");

const buildColumns = ({ actionMenu, actionMenuRefs, buttons, setActionMenu }) => [
  { name: "Role Name", selector: (row) => row.name, sortable: true },
  { name: "_id", selector: (row) => row._id, sortable: true },
  { name: "Created At", selector: (row) => getDatePart(row.createdAt), sortable: true },
  {
    name: "Action",
    cell: (row) => {
      if (!actionMenuRefs.current.has(row._id)) {
        actionMenuRefs.current.set(row._id, createRef());
      }
      const rowRef = actionMenuRefs.current.get(row._id);

      return (
        <div className="relative" ref={rowRef}>
          <button
            type="button"
            onClick={() => setActionMenu((prevActionMenu) => (prevActionMenu === row._id ? null : row._id))}
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Actions"
          >
            <MoreVertical size={18} />
          </button>
          {actionMenu === row._id && <ThreeDotEditViewDelete buttons={buttons} row={row} />}
        </div>
      );
    },
  },
];

const RoleManagementTable = () => {
  const { data: permissionsData, isLoading: isLoadingPermissions } = useGetAllPermissionsQuery();
  const { data: roles, isLoading: isLoadingRoles } = useGetAllRolesQuery();
  const [deleteRole, { isLoading: isDeletingRole }] = useDeleteSingleRoleMutation();
  const [editRole, { isLoading: isEditingRole }] = useUpdateSingleRoleMutation();
  const [getUserProfile, { isLoading: isGettingUserProfile }] = useGetMyProfileFirstTimeMutation();
  const [createRole, { isLoading: isCreatingRole }] = useCreateRoleMutation();

  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [viewModalData, setViewModalData] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [formData, setFormData] = useState(INITIAL_ROLE_FORM);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [rowForDelete, setRowForDelete] = useState(null);
  const actionMenuRefs = useRef(new Map());
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const getUserAndSetBranding = useCallback(async () => {
    try {
      const res = await getUserProfile().unwrap();
      dispatch(res?.success ? userExist(res?.data) : userNotExist());
    } catch (error) {
      console.error("Get user profile error:", error);
      dispatch(userNotExist());
    }
  }, [getUserProfile, dispatch]);

  const ButtonsForThreeDot = [
    {
      name: ROLE_ACTION_NAMES.VIEW,
      icon: <Eye size={16} className="mr-2" />,
      onClick: (row) => {
        setViewModalData(row);
        setActionMenu(null);
      },
    },
    {
      name: ROLE_ACTION_NAMES.EDIT,
      icon: <Pencil size={16} className="mr-2" />,
      onClick: (row) => {
        setEditModalData({ ...row, roleName: row.name });
        setActionMenu(null);
      },
    },
    {
      name: ROLE_ACTION_NAMES.DELETE,
      icon: <Trash size={16} className="mr-2" />,
      onClick: (row) => {
        setDeleteConfirmation(row);
        setActionMenu(null);
        setRowForDelete(row?._id);
      },
    },
  ];

  const handleInputChange = useCallback((e) => setFormData((prev) => applyRoleFormChange(prev, e.target)), []);

  const handleEditInputChange = useCallback(
    (e) => setEditModalData((prev) => (prev ? applyRoleFormChange(prev, e.target) : prev)),
    [],
  );

  const handleEditPermissionChange = useCallback(
    (e, permission) => setEditModalData((prev) => applyRolePermissionChange(prev, e.target, permission)),
    [],
  );

  useScreenContext({
    ...ROLE_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}${ROLE_AI_CHAT_PATH}`,
    currentState: buildRoleScreenState(roles?.data || [], permissionsData?.data || []),
    actions: buildRoleScreenActions({
      roles: roles?.data || [],
      permissions: permissionsData?.data || [],
      createRole,
      editRole,
      deleteRole,
      refreshUser: getUserAndSetBranding,
      toastError: toast.error,
    }),
    deps: { roleCount: roles?.data?.length, permissionCount: permissionsData?.data?.length },
  });

  const handleAddRole = async () => {
    try {
      const res = await createRole({ name: formData.roleName, permissions: formData.permissions }).unwrap();
      if (res?.success) {
        toast.success(res.message);
        setFormData(INITIAL_ROLE_FORM);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Create role error:", error);
      toast.error(error?.data?.message || "Failed to create role");
    }
  };

  const handleEditRole = async () => {
    try {
      const res = await editRole({
        _id: editModalData?._id,
        name: editModalData.roleName,
        permissions: editModalData.permissions?.map((permission) => permission?._id),
      }).unwrap();
      if (res?.success) {
        toast.success(res.message);
        setEditModalData(null);
        await getUserAndSetBranding();
      } else {
        toast.error(res?.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Update role error:", error);
      toast.error(error?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteRole = async () => {
    try {
      const res = await deleteRole({ _id: rowForDelete }).unwrap();
      if (res?.success) {
        toast.success(res.message);
        setDeleteConfirmation(null);
        setActionMenu(null);
        setRowForDelete(null);
      }
    } catch (error) {
      console.error("Delete role error:", error);
      toast.error(error?.data?.message || "Failed to delete role");
    }
  };

  const handleCloseAddModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_ROLE_FORM);
  };

  useEffect(() => {
    if (actionMenu === null) return;
    const handleClickOutside = (event) => {
      const clickedOutsideAllMenus = Array.from(actionMenuRefs.current.values()).every(
        (ref) => !ref.current?.contains(event.target),
      );
      if (clickedOutsideAllMenus) setActionMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionMenu]);

  return (
    <div className="mt-5 w-full" data-testid="roles-page">
      <header className="mb-5 flex items-center justify-between">
        <h2 className="text-textPrimary text-xl font-semibold">Role Management</h2>
        <div>
          <Button
            icon={FaUserShield}
            label="Add Role"
            onClick={() => setIsModalOpen(true)}
            disabled={isCreatingRole}
            data-testid="roles-create-btn"
          />
        </div>
      </header>

      <DataTable
        data-testid="roles-table"
        data={roles?.data || []}
        columns={buildColumns({ actionMenu, actionMenuRefs, buttons: ButtonsForThreeDot, setActionMenu })}
        customStyles={tableStyles}
        pagination
        highlightOnHover
        progressPending={isLoadingRoles || isLoadingPermissions}
        noDataComponent="No roles found"
        className="rounded-t-xl!"
      />

      <RoleManagementAddEditModal
        isOpen={isModalOpen}
        mode={ROLE_MODAL_MODES.ADD}
        initialData={formData}
        allPermissions={permissionsData?.data}
        isLoading={isCreatingRole}
        onChange={handleInputChange}
        onPermissionChange={handleInputChange}
        onClose={handleCloseAddModal}
        onSubmit={handleAddRole}
      />

      <RoleManagementAddEditModal
        isOpen={Boolean(editModalData)}
        mode={ROLE_MODAL_MODES.EDIT}
        initialData={editModalData}
        allPermissions={permissionsData?.data}
        isLoading={isEditingRole}
        onChange={handleEditInputChange}
        onPermissionChange={handleEditPermissionChange}
        onClose={() => setEditModalData(null)}
        onSubmit={handleEditRole}
      />

      <RoleManagementViewModal
        initialData={viewModalData}
        allPermissions={permissionsData?.data}
        isLoading={isGettingUserProfile}
        onClose={() => setViewModalData(null)}
      />

      <ConfirmationModal
        isOpen={Boolean(deleteConfirmation)}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${deleteConfirmation?.name}"? This action cannot be undone.`}
        isLoading={isDeletingRole}
        confirmButtonText="Delete Role"
        confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
        cancelButtonText="Keep Role"
      />
    </div>
  );
};

export default RoleManagementTable;
