import Modal from "@/components/modals/SaveCancelModal";
import FormField from "@/components/global/FormField";
import { FIELD_TYPES, MODAL_MODES } from "@/constants";
import { USER_FORM_FIELDS, USER_FORM_FIELD_PROPS } from "../utils/userManagement.constants";

const UserManagementAddEditModal = ({
  isOpen = false,
  mode = MODAL_MODES.ADD,
  initialData = null,
  errors = {},
  roleOptions = [],
  isLoading = false,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;
  const isEditMode = mode === MODAL_MODES.EDIT;

  return (
    <Modal
      saveButtonText={isEditMode ? "Save" : "Create User"}
      title={isEditMode ? "Edit User" : "Add User"}
      onClose={onClose}
      onSave={onSubmit}
      isLoading={isLoading}
    >
      <FormField
        {...USER_FORM_FIELD_PROPS}
        field={USER_FORM_FIELDS.FIRST_NAME}
        value={initialData?.firstName}
        onChange={onChange}
        error={errors.firstName}
      />
      <FormField
        {...USER_FORM_FIELD_PROPS}
        field={USER_FORM_FIELDS.LAST_NAME}
        value={initialData?.lastName}
        onChange={onChange}
        error={errors.lastName}
      />
      <FormField
        {...USER_FORM_FIELD_PROPS}
        field={USER_FORM_FIELDS.ROLE}
        value={initialData?.role}
        onChange={onChange}
        type={FIELD_TYPES.SELECT}
        error={errors.role}
        options={roleOptions}
      />
      <FormField
        {...USER_FORM_FIELD_PROPS}
        field={USER_FORM_FIELDS.EMAIL}
        value={initialData?.email}
        onChange={onChange}
        type={FIELD_TYPES.EMAIL}
        error={errors.email}
      />
      {!isEditMode && (
        <FormField
          {...USER_FORM_FIELD_PROPS}
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
