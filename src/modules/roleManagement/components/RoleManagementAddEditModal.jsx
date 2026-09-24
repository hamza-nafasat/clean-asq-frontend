import SaveCancelModal from "@/components/modals/SaveCancelModal";
import TextField from "@/components/shared/TextField";
import RoleManagementPermissionsGrid from "./RoleManagementPermissionsGrid";
import { ROLE_FORM_FIELDS, ROLE_MODAL_MODES } from "../utils/roleManagement.constants";

const RoleManagementAddEditModal = ({
  isOpen = false,
  mode = ROLE_MODAL_MODES.ADD,
  initialData = null,
  errors = {},
  allPermissions = [],
  isNameLocked = false,
  isLoading = false,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;
  const isEditMode = mode === ROLE_MODAL_MODES.EDIT;

  return (
    <SaveCancelModal title={isEditMode ? "Edit Role" : "Add Role"} onClose={onClose} onSave={onSubmit} isLoading={isLoading}>
      <TextField
        label="Role Name"
        name={ROLE_FORM_FIELDS.ROLE_NAME}
        placeholder="Enter Role Name"
        value={initialData?.roleName}
        disabled={isNameLocked}
        error={errors.roleName}
        onChange={onChange}
        className="mb-4"
      />
      <RoleManagementPermissionsGrid
        allPermissions={allPermissions}
        permissionIds={initialData?.permissions}
        error={errors.permissions}
        onChange={onChange}
      />
    </SaveCancelModal>
  );
};

export default RoleManagementAddEditModal;
