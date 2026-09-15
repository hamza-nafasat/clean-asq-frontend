import Modal from "@/components/modals/SaveCancelModal";
import RoleManagementPermissionsGrid from "./RoleManagementPermissionsGrid";
import { ROLE_STATUS, VIEW_FIELD_CLASS_NAME } from "../utils/roleManagement.constants";
import { getDatePart } from "../utils/roleManagement.utils";

const RoleManagementViewModal = ({ initialData = null, allPermissions = [], isLoading = false, onClose }) => {
  if (!initialData) return null;

  return (
    <Modal title="View Role" onClose={onClose} hideSaveButton isLoading={isLoading}>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Role Name</label>
        <div className={VIEW_FIELD_CLASS_NAME}>{initialData.name}</div>
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <div className={VIEW_FIELD_CLASS_NAME}>
          <span className="text-textPrimary inline-flex rounded-full px-2 py-1 text-xs font-semibold">
            {initialData.status === ROLE_STATUS.ACTIVE ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Created Date</label>
        <div className={VIEW_FIELD_CLASS_NAME}>{getDatePart(initialData?.createdAt)}</div>
      </div>
      <RoleManagementPermissionsGrid allPermissions={allPermissions} permissions={initialData?.permissions} />
    </Modal>
  );
};

export default RoleManagementViewModal;
