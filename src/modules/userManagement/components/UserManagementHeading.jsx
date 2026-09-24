import { useState } from "react";
import { useCreateUserMutation } from "@/redux/apis/userManagement.apis";
import { IoMdPersonAdd } from "react-icons/io";
import { toast } from "react-toastify";
import usePermission from "@/hooks/usePermission";
import Button from "@/components/shared/Button";
import UserManagementAddEditModal from "./UserManagementAddEditModal";
import { MODAL_MODES } from "@/constants";
import { PERMISSIONS } from "@/utils/permissions";
import { INITIAL_USER_FORM } from "../utils/userManagement.constants";
import { validateUserForm } from "../utils/userManagement.utils";

const UserManagementHeading = ({ roleOptions = [] }) => {
  const canCreateUser = usePermission(PERMISSIONS.CREATE_USER);
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_USER_FORM);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_USER_FORM);
    setFormErrors({});
  };

  const handleAddUser = async () => {
    const errors = validateUserForm(formData, MODAL_MODES.ADD);
    if (Object.keys(errors).length) return setFormErrors(errors);
    try {
      const res = await createUser(formData).unwrap();
      toast.success(res.message);
      handleClose();
    } catch (error) {
      console.error("Create user error:", error);
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  return (
    <>
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-textPrimary text-xl font-semibold">User Table</h1>
        {canCreateUser && (
          <Button
            type="button"
            icon={IoMdPersonAdd}
            label="Add User"
            onClick={() => setIsModalOpen(true)}
            disabled={isCreatingUser}
            data-testid="invite-user-btn"
          />
        )}
      </header>

      <UserManagementAddEditModal
        isOpen={isModalOpen}
        mode={MODAL_MODES.ADD}
        initialData={formData}
        errors={formErrors}
        roleOptions={roleOptions}
        isLoading={isCreatingUser}
        onChange={handleChange}
        onClose={handleClose}
        onSubmit={handleAddUser}
      />
    </>
  );
};

export default UserManagementHeading;
