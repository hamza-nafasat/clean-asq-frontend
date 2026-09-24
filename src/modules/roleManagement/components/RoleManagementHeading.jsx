import { FaUserShield } from "react-icons/fa";
import Button from "@/components/shared/Button";

const RoleManagementHeading = ({ canCreateRole = false, isCreating = false, onAddRole }) => (
  <header className="mb-5 flex items-center justify-between">
    <h1 className="text-textPrimary text-xl font-semibold">Role Management</h1>
    {canCreateRole && (
      <Button
        icon={FaUserShield}
        label="Add Role"
        onClick={onAddRole}
        disabled={isCreating}
        data-testid="roles-create-btn"
      />
    )}
  </header>
);

export default RoleManagementHeading;
