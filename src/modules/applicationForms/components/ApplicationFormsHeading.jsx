import Button from "@/components/shared/Button";
import usePermission from "@/hooks/usePermission";
import { PERMISSIONS } from "@/utils/permissions";

const ApplicationFormsHeading = ({ onCreateForm }) => {
  const canCreateForm = usePermission(PERMISSIONS.CREATE_FORM);

  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-textPrimary text-base font-medium md:text-2xl">Financial Services Application Platform</h1>
        <p className="text-textPrimary mt-5 text-base font-normal md:text-lg">
          Dynamic application forms with AI-assisted completion and automated data lookup
        </p>
      </div>
      <div className="mt-10 flex gap-6 md:mt-0">
        {canCreateForm && (
          <Button
            label={"Create Form"}
            onClick={() => onCreateForm?.()}
            className="truncate text-sm! md:text-base!"
            data-testid="forms-create-btn"
          />
        )}
      </div>
    </header>
  );
};

export default ApplicationFormsHeading;
