import { FaUserShield } from "react-icons/fa";
import Button from "@/components/shared/Button";

const RoleManagementHeading = ({ canCreateRole = false, isCreating = false, onAddRole }) => (
  <header className="mb-5 flex items-center justify-between gap-4">
    <div className="min-w-0">
      <h1 className="text-textPrimary text-xl font-semibold">Role Management</h1>
      <p className="text-sm text-gray-500">Each role decides what the people assigned to it can see and do.</p>
    </div>
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
