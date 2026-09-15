import { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForgetPasswordMutation } from "@/redux/apis/auth.apis";
import { useGetAllRolesQuery } from "@/redux/apis/role-management.apis";
import {
  useCreateUserMutation,
  useDeleteSingleUserMutation,
  useGetAllUsersQuery,
  useUpdateSingleUserMutation,
} from "@/redux/apis/user-management.apis";
import { Lock, MoreVertical, Pencil, Trash } from "lucide-react";
import DataTable from "react-data-table-component";
import { IoMdPersonAdd } from "react-icons/io";
import { toast } from "react-toastify";
import useBranding from "@/hooks/useBranding";
import { useScreenContext } from "@/hooks/useScreenContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Modal from "@/components/modals/SaveCancelModal";
import Button from "@/components/shared/Button";
import { ThreeDotEditViewDelete } from "@/components/shared/ThreeDotViewEditDelete";
import { FIELD_TYPES } from "@/constants";
import getEnv from "@/utils/env";
import { getTableStyles } from "@/utils/tableStyles";
import UserManagementAddEditModal from "./UserManagementAddEditModal";
import UserManagementFormField from "./UserManagementFormField";
import {
  INITIAL_USER_FORM,
  USER_AI_CHAT_PATH,
  USER_FORM_FIELDS,
  USER_MODAL_MODES,
  USER_SCREEN_CONTEXT,
} from "../utils/user-management.constants";
import {
  applyUserFormChange,
  buildUserScreenActions,
  buildUserScreenState,
  formateDateAndTime,
} from "../utils/user-management.utils";

const SERVER_URL = getEnv("SERVER_URL");

const buildColumns = ({ actionMenu, actionMenuRefs, buttons, setActionMenu }) => [
  { name: "Name", selector: (row) => row?.firstName + " " + row?.lastName, sortable: true },
  { name: "Email", selector: (row) => row?.email, sortable: true },
  { name: "Role", selector: (row) => row?.role?.name, sortable: true },
  { name: "Last Active", selector: (row) => formateDateAndTime(row?.lastActive), sortable: true },
  { name: "Create Date", selector: (row) => row?.createdAt?.split("T")[0], sortable: true },
  {
    name: "Action",
    cell: (row) => {
      if (!actionMenuRefs.current.has(row?._id)) {
        actionMenuRefs.current.set(row?._id, createRef());
      }
      const rowRef = actionMenuRefs.current.get(row?._id);
      return (
        <div className="relative" ref={rowRef}>
          <button
            type="button"
            onClick={() => setActionMenu((prevActionMenu) => (prevActionMenu === row?._id ? null : row?._id))}
            className="rounded p-1 hover:bg-gray-100 cursor-pointer"
            aria-label="Actions"
          >
            <MoreVertical size={18} />
          </button>
          {actionMenu === row?._id && <ThreeDotEditViewDelete buttons={buttons} row={row} />}
        </div>
      );
    },
  },
];

const UserManagementTable = () => {
  const { data: users, isLoading: isLoadingUsers } = useGetAllUsersQuery();
  const { data: userTypeOptions, isLoading: isLoadingUserTypeOptions } = useGetAllRolesQuery();
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteSingleUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateSingleUserMutation();
  const [sendPasswordResetLink] = useForgetPasswordMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [passwordModalData, setPasswordModalData] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [formData, setFormData] = useState(INITIAL_USER_FORM);
  const [formErrors, setFormErrors] = useState({});
  const actionMenuRefs = useRef(new Map());
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [userIdForDelete, setUserIdForDelete] = useState(null);

  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  useScreenContext({
    ...USER_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}${USER_AI_CHAT_PATH}`,
    currentState: buildUserScreenState(users?.data || [], userTypeOptions?.data || []),
    actions: buildUserScreenActions({
      users: users?.data || [],
      createUser,
      updateUser,
      deleteUser,
      sendPasswordResetLink,
      toastError: toast.error,
    }),
    deps: { userCount: users?.data?.length, roleCount: userTypeOptions?.data?.length },
  });

  const handleInputChange = useCallback(
    (e) => {
      const { name } = e.target;
      setFormData((prev) => applyUserFormChange(prev, e.target));
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [formErrors],
  );

  const handleEditInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setEditModalData((prev) => (prev ? { ...prev, [name]: type === FIELD_TYPES.CHECKBOX ? checked : value } : prev));
  }, []);

  const handlePasswordInputChange = useCallback((e) => {
    const { value } = e.target;
    setPasswordModalData((prev) => ({ ...prev, password: value }));
  }, []);

  const handleAddUser = async () => {
    try {
      const res = await createUser(formData).unwrap();
      if (res.success) {
        toast.success(res.message);
        setIsModalOpen(false);
        setFormData(INITIAL_USER_FORM);
        setFormErrors({});
      }
    } catch (error) {
      console.error("Create user error:", error);
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  const handleEditUser = async () => {
    try {
      const res = await updateUser(editModalData).unwrap();
      if (res.success) {
        toast.success(res.message);
        setEditModalData(null);
        setFormErrors({});
        setActionMenu(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Update user error:", error);
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  // TODO: call the change password endpoint
  const handleChangePassword = () => {
    setPasswordModalData(null);
    setFormErrors({});
  };

  const handleDeleteUser = async () => {
    try {
      const res = await deleteUser({ _id: userIdForDelete }).unwrap();
      if (res.success) {
        toast.success(res?.message);
        setDeleteConfirmation(null);
        setActionMenu(null);
      }
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  const handleCloseAddModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_USER_FORM);
    setFormErrors({});
  };

  const handleCloseEditModal = () => {
    setEditModalData(null);
    setFormErrors({});
  };

  const handleClosePasswordModal = () => {
    setPasswordModalData(null);
    setFormErrors({});
  };

  const userTypeDropdownOptions = useMemo(
    () => userTypeOptions?.data?.map((option) => ({ value: option?._id, label: option?.name })),
    [userTypeOptions?.data],
  );

  const ButtonsForThreeDot = useMemo(
    () => [
      {
        name: "Change Password",
        icon: <Lock size={16} className="mr-2" />,
        onClick: (row) => {
          setPasswordModalData({ id: row?._id, password: "" });
          setActionMenu(null);
        },
      },
      {
        name: "Edit",
        icon: <Pencil size={16} className="mr-2" />,
        onClick: (row) => {
          setEditModalData({ ...row, role: row?.role?._id });
          setActionMenu(null);
        },
      },
      {
        name: "Delete",
        icon: <Trash size={16} className="mr-2" />,
        onClick: (row) => {
          setDeleteConfirmation(row);
          setActionMenu(null);
          setUserIdForDelete(row?._id);
        },
      },
    ],
    [],
  );

  const columns = useMemo(
    () => buildColumns({ actionMenu, actionMenuRefs, buttons: ButtonsForThreeDot, setActionMenu }),
    [ButtonsForThreeDot, actionMenu],
  );

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
    <div className="mt-5" data-testid="users-page">
      <header className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#323332]">User Table</h2>
        <div className="flex gap-2">
          <Button
            icon={IoMdPersonAdd}
            label="Add User"
            onClick={() => setIsModalOpen(true)}
            disabled={isCreatingUser}
            data-testid="invite-user-btn"
          />
        </div>
      </header>

      <DataTable
        data-testid="users-table"
        customStyles={tableStyles}
        columns={columns}
        data={users?.data || []}
        pagination
        progressPending={isLoadingUsers || isLoadingUserTypeOptions}
        noDataComponent="No users found"
        className="rounded-t-xl!"
        highlightOnHover
        fixedHeader
        persistTableHead
        responsive
      />

      <UserManagementAddEditModal
        isOpen={isModalOpen}
        mode={USER_MODAL_MODES.ADD}
        initialData={formData}
        errors={formErrors}
        roleOptions={userTypeDropdownOptions}
        isLoading={isCreatingUser}
        onChange={handleInputChange}
        onClose={handleCloseAddModal}
        onSubmit={handleAddUser}
      />

      <UserManagementAddEditModal
        isOpen={Boolean(editModalData)}
        mode={USER_MODAL_MODES.EDIT}
        initialData={editModalData}
        errors={formErrors}
        roleOptions={userTypeDropdownOptions}
        isLoading={isUpdatingUser}
        onChange={handleEditInputChange}
        onClose={handleCloseEditModal}
        onSubmit={handleEditUser}
      />

      {passwordModalData && (
        <Modal
          title="Change Password"
          onClose={handleClosePasswordModal}
          onSave={handleChangePassword}
          isLoading={isUpdatingUser}
        >
          <UserManagementFormField
            field={USER_FORM_FIELDS.PASSWORD}
            value={passwordModalData.password}
            onChange={handlePasswordInputChange}
            type={FIELD_TYPES.PASSWORD}
            error={formErrors.password}
          />
        </Modal>
      )}

      <ConfirmationModal
        isOpen={Boolean(deleteConfirmation)}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete the user ${deleteConfirmation?.name}? This action cannot be undone.`}
        isLoading={isDeletingUser}
        confirmButtonText="Delete User"
        confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
        cancelButtonText="Keep User"
      />
    </div>
  );
};

export default UserManagementTable;
