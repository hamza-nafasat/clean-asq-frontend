import { FaUserShield } from "react-icons/fa";
import Button from "@/components/shared/Button";
import PageHeading from "@/components/global/PageHeading";

const RoleManagementHeading = ({ canCreateRole = false, isCreating = false, onAddRole }) => (
  <PageHeading
    className="mb-5"
    title="Role Management"
    description="Each role decides what the people assigned to it can see and do."
    actions={
      canCreateRole && (
        <Button
          icon={FaUserShield}
          label="Add Role"
          onClick={onAddRole}
          disabled={isCreating}
          data-testid="roles-create-btn"
        />
      )
    }
  />
);

export default RoleManagementHeading;
