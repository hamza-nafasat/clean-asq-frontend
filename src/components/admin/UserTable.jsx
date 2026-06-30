import { INITIAL_USER_FORM } from "@/constants/constants";
import { getTableStyles } from "@/data/data";
import { useGetAllRolesQuery } from "@/redux/apis/roleApis";
import {
  useCreateUserMutation,
  useDeleteSingleUserMutation,
  useGetAllUsersQuery,
  useUpdateSingleUserMutation,
} from "@/redux/apis/userApis";
import { Lock, MoreVertical, Pencil, Trash } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { IoMdPersonAdd } from "react-icons/io";
import { toast } from "react-toastify";
import ConfirmationModal from "../shared/ConfirmationModal";
import Modal from "../shared/Modal";
import Button from "../shared/small/Button";
import Checkbox from "../shared/small/Checkbox";
import TextField from "../shared/small/TextField";
import { ThreeDotEditViewDelete } from "../shared/ThreeDotViewEditDelete";
import { useBranding } from "../../hooks/BrandingContext";
import { formateDateAndTime } from "@/utils/userUtils";
import getEnv from "@/lib/env";
import { useScreenContext } from "@/hooks/useScreenContext";

const SERVER_URL = getEnv("SERVER_URL");

const UserTable = () => {
  const { data: users, isLoading: isLoadingUsers } = useGetAllUsersQuery();
  const { data: userTypeOptions, isLoading: isLoadingUserTypeOptions } = useGetAllRolesQuery();
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteSingleUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateSingleUserMutation();

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
    screenId: "user-management",
    screenName: "User Management",
    assistantName: "User Management Assistant",
    description:
      "The User Management screen lets admins create, edit, and delete user accounts, assign roles, and manage passwords. Each user has a first name, last name, email, and an assigned role.",
    aiEndpoint: `${SERVER_URL}/api/ai/user-chat`,
    greeting: `Hi! I'm your **User Management Assistant**.\n\nI can help you:\n- **List and categorize** users by role\n- **Spot duplicate accounts** based on email\n- **Create new users** and assign them to a role\n- **Edit user information** (name, email, role)\n- **Generate a secure random password** for a user\n- **Delete users** based on your instructions\n\nWhat would you like to do?`,
    currentState: {
      users: (users?.data || []).map((u) => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: { _id: u.role?._id, name: u.role?.name },
        createdAt: u.createdAt?.split("T")[0],
        lastActive: u.lastActive?.split("T")[0] || null,
      })),
      availableRoles: (userTypeOptions?.data || []).map((r) => ({ _id: r._id, name: r.name })),
    },
    actions: {
      createUser: async ({ firstName, lastName, email, password, roleId }) => {
        try {
          const res = await createUser({ firstName, lastName, email, password, role: roleId }).unwrap();
          if (!res?.success) throw new Error(res?.message);
        } catch (err) {
          toast.error(err?.data?.message || err?.message || "Failed to create user");
          throw err;
        }
      },
      updateUser: async ({ userId, firstName, lastName, email, roleId }) => {
        try {
          const payload = { _id: userId };
          if (firstName) payload.firstName = firstName;
          if (lastName) payload.lastName = lastName;
          if (email) payload.email = email;
          if (roleId) payload.role = roleId;
          const res = await updateUser(payload).unwrap();
          if (!res?.success) throw new Error(res?.message);
        } catch (err) {
          toast.error(err?.data?.message || err?.message || "Failed to update user");
          throw err;
        }
      },
      changePassword: async ({ userId, newPassword }) => {
        try {
          const res = await updateUser({ _id: userId, password: newPassword }).unwrap();
          if (!res?.success) throw new Error(res?.message);
        } catch (err) {
          toast.error(err?.data?.message || err?.message || "Failed to change password");
          throw err;
        }
      },
      changePasswords: async ({ updates }) => {
        const errors = [];
        for (const { userId, newPassword } of updates) {
          try {
            await updateUser({ _id: userId, password: newPassword }).unwrap();
          } catch {
            errors.push(userId);
          }
        }
        if (errors.length) {
          toast.error(`Failed to update ${errors.length} of ${updates.length} passwords`);
          throw new Error(`Failed to update ${errors.length} passwords`);
        }
      },
      deleteUser: async ({ userId }) => {
        try {
          const res = await deleteUser({ _id: userId }).unwrap();
          if (!res?.success) throw new Error(res?.message);
        } catch (err) {
          toast.error(err?.data?.message || err?.message || "Failed to delete user");
          throw err;
        }
      },
      deleteUsers: async ({ userIds }) => {
        const errors = [];
        for (const userId of userIds) {
          try {
            await deleteUser({ _id: userId }).unwrap();
          } catch {
            errors.push(userId);
          }
        }
        if (errors.length) {
          toast.error(`Failed to delete ${errors.length} of ${userIds.length} users`);
          throw new Error(`Failed to delete ${errors.length} users`);
        }
      },
    },
    deps: { userCount: users?.data?.length, roleCount: userTypeOptions?.data?.length },
  });

  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
        ...(name === "type" && !["client", "client-mbr", "super-bank"].includes(value) ? { businessName: "" } : {}),
      }));
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [formErrors],
  );

  const handleEditInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setEditModalData((prev) => {
      if (!prev) return prev;
      if (type === "checkbox") {
        return { ...prev, [name]: checked };
      } else {
        return { ...prev, [name]: value };
      }
    });
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
      console.error("Error creating user:", error);
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
      console.error("Error updating user:", error);
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  const handleChangePassword = async () => {
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
      console.error("Error changing password:", error);
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  const renderFormField = useCallback((field, value, onChange, type = "text", error = null, options = null) => {
    const labelText = field
      .split(/(?=[A-Z])/)
      .join(" ")
      .replace(/^\w/, (c) => c.toUpperCase());

    if (type === "select" && options) {
      return (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">{labelText}</label>
          <select
            name={field}
            value={value}
            onChange={onChange}
            className={`border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select {labelText}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
    }

    if (type === "checkbox") {
      return (
        <div className="mb-4 flex items-center space-x-2">
          <Checkbox name={field} checked={value} onChange={onChange} label={labelText} />
          {error && <p className="ml-2 text-xs text-red-500">{error}</p>}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <TextField
          label={labelText}
          name={field}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${labelText}`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }, []);

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
    () => [
      {
        name: "Name",
        selector: (row) => row?.firstName + " " + row?.lastName,
        sortable: true,
      },

      {
        name: "Email",
        selector: (row) => row?.email,
        sortable: true,
      },
      {
        name: "Role",
        selector: (row) => row?.role?.name,
        sortable: true,
      },

      {
        name: "Last Active",
        selector: (row) => formateDateAndTime(row?.lastActive),
        sortable: true,
      },

      {
        name: "Create Date",
        selector: (row) => row?.createdAt?.split("T")[0],
        sortable: true,
      },
      {
        name: "Action",
        cell: (row) => {
          if (!actionMenuRefs.current.has(row?._id)) {
            actionMenuRefs.current.set(row?._id, React.createRef());
          }
          const rowRef = actionMenuRefs.current.get(row?._id);
          return (
            <div className="relative" ref={rowRef}>
              <button
                onClick={() => setActionMenu((prevActionMenu) => (prevActionMenu === row?._id ? null : row?._id))}
                className="rounded p-1 hover:bg-gray-100 cursor-pointer"
                aria-label="Actions"
              >
                <MoreVertical size={18} />
              </button>
              {actionMenu === row?._id && <ThreeDotEditViewDelete buttons={ButtonsForThreeDot} row={row} />}
            </div>
          );
        },
      },
    ],
    [ButtonsForThreeDot, actionMenu],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideAllMenus = Array.from(actionMenuRefs.current.values()).every(
        (ref) => !ref.current?.contains(event.target),
      );
      if (clickedOutsideAllMenus) {
        setActionMenu(null);
      }
    };
    if (actionMenu !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionMenu]);

  return (
    <div className="mt-5" data-testid="users-page">
      <div className="mb-5 flex items-center justify-between">
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
      </div>

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

      {isModalOpen && (
        <Modal
          saveButtonText="Create User"
          title="Add User"
          onClose={() => {
            setIsModalOpen(false);
            setFormData(INITIAL_USER_FORM);
            setFormErrors({});
          }}
          onSave={handleAddUser}
          isLoading={isCreatingUser}
        >
          {renderFormField("firstName", formData.firstName, handleInputChange, "text", formErrors.firstName)}
          {renderFormField("lastName", formData.lastName, handleInputChange, "text", formErrors.lastName)}
          {renderFormField(
            "role",
            formData.role,
            handleInputChange,
            "select",
            formErrors.role,
            userTypeDropdownOptions,
          )}
          {["r2", "r3", "r4", "r5"].includes(formData.role) &&
            renderFormField("businessName", formData.businessName, handleInputChange, "text", formErrors.businessName)}
          {renderFormField("email", formData.email, handleInputChange, "email", formErrors.email)}
          {renderFormField("password", formData.password, handleInputChange, "password", formErrors.password)}
        </Modal>
      )}

      {editModalData && (
        <Modal
          saveButtonText="Save"
          title="Edit User"
          onClose={() => {
            setEditModalData(null);
            setFormErrors({});
          }}
          onSave={handleEditUser}
          isLoading={isUpdatingUser}
        >
          {renderFormField("firstName", editModalData.firstName, handleEditInputChange, "text", formErrors.firstName)}
          {renderFormField("lastName", editModalData.lastName, handleEditInputChange, "text", formErrors.lastName)}
          {renderFormField(
            "role",
            editModalData.role,
            handleEditInputChange,
            "select",
            formErrors.role,
            userTypeDropdownOptions,
          )}
          {["r2", "r3", "r4", "r5"].includes(editModalData.role) &&
            renderFormField(
              "businessName",
              editModalData.businessName,
              handleEditInputChange,
              "text",
              formErrors.businessName,
            )}
          {renderFormField("email", editModalData.email, handleEditInputChange, "email", formErrors.email)}
        </Modal>
      )}

      {passwordModalData && (
        <Modal
          title="Change Password"
          onClose={() => {
            setPasswordModalData(null);
            setFormErrors({});
          }}
          onSave={handleChangePassword}
          isLoading={isUpdatingUser}
        >
          {renderFormField(
            "password",
            passwordModalData.password,
            handlePasswordInputChange,
            "password",
            formErrors.password,
          )}
        </Modal>
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation}
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

UserTable.propTypes = {
  // Add any props if needed
};

export default UserTable;
