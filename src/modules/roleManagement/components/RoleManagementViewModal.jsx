import SaveCancelModal from "@/components/modals/SaveCancelModal";
import RoleManagementPermissionsGrid from "./RoleManagementPermissionsGrid";
import { getDatePart } from "@/utils/date";

const LABEL_CLASS_NAME = "mb-1 block text-sm font-medium text-gray-700";
const VALUE_CLASS_NAME =
  "border-frameColor flex h-11.25 w-full items-center rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base";

const RoleManagementViewModal = ({ isOpen = false, initialData = null, allPermissions = [], onClose }) => {
  if (!isOpen) return null;

  return (
    <SaveCancelModal title="View Role" onClose={onClose} hideSaveButton>
      <div className="mb-4">
        <p className={LABEL_CLASS_NAME}>Role Name</p>
        <p className={VALUE_CLASS_NAME}>{initialData.name}</p>
      </div>
      <div className="mb-4">
        <p className={LABEL_CLASS_NAME}>Created Date</p>
        <p className={VALUE_CLASS_NAME}>{getDatePart(initialData.createdAt)}</p>
      </div>
      <RoleManagementPermissionsGrid
        allPermissions={allPermissions}
        permissionIds={(initialData.permissions ?? []).map((permission) => permission._id)}
      />
    </SaveCancelModal>
  );
};

export default RoleManagementViewModal;
