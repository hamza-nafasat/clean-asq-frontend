import Modal from "@/components/modals/SaveCancelModal";
import { FIELD_TYPES } from "@/constants";
import FormField from "@/components/global/FormField";
import RoleManagementPermissionsGrid from "./RoleManagementPermissionsGrid";
import { ROLE_FORM_FIELDS, ROLE_FORM_FIELD_PROPS, ROLE_MODAL_MODES, ROLE_STATUS_OPTIONS } from "../utils/roleManagement.constants";

const RoleManagementAddEditModal = ({
  isOpen = false,
  mode = ROLE_MODAL_MODES.ADD,
  initialData = null,
  allPermissions = [],
  isLoading = false,
  onChange,
  onPermissionChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;
  const isEditMode = mode === ROLE_MODAL_MODES.EDIT;

  return (
    <Modal
      {...(isEditMode ? { saveButtonText: "Edit" } : {})}
      title={isEditMode ? "Edit Role" : "Add Role"}
      onClose={onClose}
      onSave={onSubmit}
      isLoading={isLoading}
    >
      <FormField
        {...ROLE_FORM_FIELD_PROPS}
        field={ROLE_FORM_FIELDS.ROLE_NAME}
        value={initialData?.roleName}
        onChange={onChange}
        type={FIELD_TYPES.TEXT}
      />
      <FormField
        {...ROLE_FORM_FIELD_PROPS}
        field={ROLE_FORM_FIELDS.STATUS}
        value={initialData?.status}
        onChange={onChange}
        type={FIELD_TYPES.SELECT}
        options={ROLE_STATUS_OPTIONS}
      />
      <RoleManagementPermissionsGrid
        allPermissions={allPermissions}
        permissions={initialData?.permissions}
        onChange={onPermissionChange}
      />
    </Modal>
  );
};

export default RoleManagementAddEditModal;
