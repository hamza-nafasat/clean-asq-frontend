import { useMemo, useState } from "react";
import { useDeleteSingleUserMutation, useUpdateSingleUserMutation } from "@/redux/apis/userManagement.apis";
import { FiAlertCircle, FiEdit2, FiTrash2, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import usePermission from "@/hooks/usePermission";
import useRowActionMenu from "@/hooks/useRowActionMenu";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import AppDataTable from "@/components/shared/AppDataTable";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import UserManagementAddEditModal from "./UserManagementAddEditModal";
import { MODAL_MODES } from "@/constants";
import { getDatePart } from "@/utils/date";
import { PERMISSIONS } from "@/utils/permissions";
import { TABLE_WRAPPER_RADII } from "@/utils/tableStyles";
import { formatDateAndTime, getUserFullName, validateUserForm } from "../utils/userManagement.utils";

const buildColumns = ({ openRowId, getRowRef, buttons, onToggleMenu }) => [
  { name: "Name", selector: (row) => getUserFullName(row), sortable: true },
  { name: "Email", selector: (row) => row?.email, sortable: true },
  { name: "Role", selector: (row) => row?.role?.name, sortable: true },
  { name: "Last Active", selector: (row) => formatDateAndTime(row?.lastActive), sortable: true },
  { name: "Create Date", selector: (row) => getDatePart(row?.createdAt), sortable: true },
  ...(buttons.length
    ? [
        {
          name: "Action",
          cell: (row) => (
            <RowActionMenuCell
              row={row}
              buttons={buttons}
              isOpen={openRowId === row?._id}
              onToggle={() => onToggleMenu(row?._id)}
              rowRef={getRowRef(row?._id)}
              buttonClassName="rounded p-1 hover:bg-gray-100 cursor-pointer"
            />
          ),
        },
      ]
    : []),
];

const UserManagementTable = ({
  users = [],
  isFiltered = false,
  roleOptions = [],
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  const canUpdateUser = usePermission(PERMISSIONS.UPDATE_USER);
  const canDeleteUser = usePermission(PERMISSIONS.DELETE_USER);
  // role picker needs the roles list
  const canReadRole = usePermission(PERMISSIONS.READ_ROLE);
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateSingleUserMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteSingleUserMutation();
  const { openRowId, setOpenRowId, toggleMenu, getRowRef } = useRowActionMenu({ closeOnOutsideClick: true });

  const [userToEdit, setUserToEdit] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const rowButtons = useMemo(
    () =>
      [
        canUpdateUser &&
          canReadRole && {
            name: "Edit",
            icon: <FiEdit2 size={16} className="mr-2" />,
            onClick: (row) => {
              const { _id, firstName, lastName, email, role } = row;
              setUserToEdit({ _id, firstName, lastName, email, role: role?._id });
              setOpenRowId(null);
            },
          },
        canDeleteUser && {
          name: "Delete",
          icon: <FiTrash2 size={16} className="mr-2" />,
          onClick: (row) => {
            setUserToDelete(row);
            setOpenRowId(null);
          },
        },
      ].filter(Boolean),
    [canUpdateUser, canReadRole, canDeleteUser, setOpenRowId],
  );

  const columns = useMemo(
    () => buildColumns({ openRowId, getRowRef, buttons: rowButtons, onToggleMenu: toggleMenu }),
    [openRowId, getRowRef, rowButtons, toggleMenu],
  );

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUserToEdit((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCloseEdit = () => {
    setUserToEdit(null);
    setEditErrors({});
  };

  const handleSaveEdit = () => {
    const errors = validateUserForm(userToEdit, MODAL_MODES.EDIT);
    if (Object.keys(errors).length) return setEditErrors(errors);
    setIsConfirmingUpdate(true);
  };

  const handleConfirmUpdate = async () => {
    const { _id, firstName, lastName, email, role } = userToEdit;
    // send role only when it changed
    const currentRoleId = users.find((user) => user._id === _id)?.role?._id;
    const payload = { _id, firstName, lastName, email, ...(role !== currentRoleId && { role }) };
    try {
      const res = await updateUser(payload).unwrap();
      toast.success(res.message);
      setIsConfirmingUpdate(false);
      handleCloseEdit();
    } catch (error) {
      console.error("Update user error:", error);
      toast.error(error?.data?.message || "Failed to update user");
      setIsConfirmingUpdate(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteUser({ _id: userToDelete._id }).unwrap();
      toast.success(res.message);
      setUserToDelete(null);
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  if (isLoading) return <LoadingState title="Loading users" />;
  if (isError)
    return (
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load users">
        <Button type="button" label="Try again" onClick={onRetry} />
      </EmptyState>
    );
  if (!users.length && isFiltered)
    return (
      <EmptyState
        variant="panel"
        icon={<FiUsers size={28} />}
        title="No users match your filters"
        description="Try changing or clearing the filters."
      />
    );
  if (!users.length)
    return (
      <EmptyState
        variant="panel"
        icon={<FiUsers size={28} />}
        title="No users yet"
        description="Add a user to give someone access."
      />
    );

  return (
    <>
      <AppDataTable
        data-testid="users-table"
        columns={columns}
        data={users}
        pagination
        wrapperRadius={TABLE_WRAPPER_RADII.TOP_XL}
        highlightOnHover
        fixedHeader
        persistTableHead
        responsive
        noDataComponent="No users yet"
        emptyDescription="Add a user to give someone access."
      />

      <UserManagementAddEditModal
        isOpen={Boolean(userToEdit)}
        mode={MODAL_MODES.EDIT}
        initialData={userToEdit}
        errors={editErrors}
        roleOptions={roleOptions}
        isLoading={isUpdatingUser}
        onChange={handleEditChange}
        onClose={handleCloseEdit}
        onSubmit={handleSaveEdit}
      />

      <ConfirmationModal
        isOpen={isConfirmingUpdate}
        onClose={() => setIsConfirmingUpdate(false)}
        onConfirm={handleConfirmUpdate}
        title="Update User"
        message={`Are you sure you want to save the changes to ${getUserFullName(userToEdit)}?`}
        isLoading={isUpdatingUser}
        confirmButtonText="Save Changes"
      />

      <ConfirmationModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete the user ${getUserFullName(userToDelete)}? This action cannot be undone.`}
        isLoading={isDeletingUser}
        confirmButtonText="Delete User"
        cancelButtonText="Keep User"
      />
    </>
  );
};

export default UserManagementTable;
