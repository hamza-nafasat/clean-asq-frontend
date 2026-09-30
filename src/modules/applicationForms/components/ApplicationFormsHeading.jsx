import Button from "@/components/shared/Button";
import usePermission from "@/hooks/usePermission";
import { PERMISSIONS } from "@/utils/permissions";
import PageHeading from "@/components/global/PageHeading";

const ApplicationFormsHeading = ({ onCreateForm }) => {
  const canCreateForm = usePermission(PERMISSIONS.CREATE_FORM);

  return (
    <PageHeading
      className="mb-6"
      title="Financial Services Application Platform"
      description="Dynamic application forms with AI-assisted completion and automated data lookup"
      actions={
        canCreateForm && <Button label="Create Form" onClick={() => onCreateForm?.()} data-testid="forms-create-btn" />
      }
    />
  );
};

export default ApplicationFormsHeading;
