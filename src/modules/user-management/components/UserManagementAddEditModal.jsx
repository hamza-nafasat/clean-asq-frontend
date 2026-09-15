import Modal from "@/components/modals/SaveCancelModal";
import { FIELD_TYPES } from "@/constants";
import UserManagementFormField from "./UserManagementFormField";
import { BUSINESS_ROLE_IDS, USER_FORM_FIELDS, USER_MODAL_MODES } from "../utils/user-management.constants";

const UserManagementAddEditModal = ({
  isOpen = false,
  mode = USER_MODAL_MODES.ADD,
  initialData = null,
  errors = {},
  roleOptions = [],
  isLoading = false,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;
  const isEditMode = mode === USER_MODAL_MODES.EDIT;

  return (
    <Modal
      saveButtonText={isEditMode ? "Save" : "Create User"}
      title={isEditMode ? "Edit User" : "Add User"}
      onClose={onClose}
      onSave={onSubmit}
      isLoading={isLoading}
    >
      <UserManagementFormField
        field={USER_FORM_FIELDS.FIRST_NAME}
        value={initialData?.firstName}
        onChange={onChange}
        error={errors.firstName}
      />
      <UserManagementFormField
        field={USER_FORM_FIELDS.LAST_NAME}
        value={initialData?.lastName}
        onChange={onChange}
        error={errors.lastName}
      />
      <UserManagementFormField
        field={USER_FORM_FIELDS.ROLE}
        value={initialData?.role}
        onChange={onChange}
        type={FIELD_TYPES.SELECT}
        error={errors.role}
        options={roleOptions}
      />
      {BUSINESS_ROLE_IDS.includes(initialData?.role) && (
        <UserManagementFormField
          field={USER_FORM_FIELDS.BUSINESS_NAME}
          value={initialData?.businessName}
          onChange={onChange}
          error={errors.businessName}
        />
      )}
      <UserManagementFormField
        field={USER_FORM_FIELDS.EMAIL}
        value={initialData?.email}
        onChange={onChange}
        type={FIELD_TYPES.EMAIL}
        error={errors.email}
      />
      {!isEditMode && (
        <UserManagementFormField
          field={USER_FORM_FIELDS.PASSWORD}
          value={initialData?.password}
          onChange={onChange}
          type={FIELD_TYPES.PASSWORD}
          error={errors.password}
        />
      )}
    </Modal>
  );
};

export default UserManagementAddEditModal;
