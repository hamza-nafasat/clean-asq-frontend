import { useGetMyAllDraftsAndSubmittionsQuery } from "@/redux/apis/form.apis";
import usePermission from "@/hooks/usePermission";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import EmptyState from "@/components/shared/EmptyState";
import MyApplicationsTabs from "./components/MyApplicationsTabs";
import { PERMISSIONS } from "@/utils/permissions";

const MyApplications = () => {
  const canSubmitForm = usePermission(PERMISSIONS.SUBMIT_FORM);
  const { data, isLoading, isError, refetch } = useGetMyAllDraftsAndSubmittionsQuery(undefined, {
    skip: !canSubmitForm,
  });

  if (!canSubmitForm) return <EmptyState className="mt-14" title="You don't have permission to submit applications" />;
  if (isLoading) return <CustomLoading />;
  if (isError) {
    return (
      <EmptyState className="mt-14 flex flex-col items-center gap-3" title="Could not load your applications">
        <Button type="button" label="Try again" onClick={refetch} />
      </EmptyState>
    );
  }
  return (
    <div>
      <MyApplicationsTabs forms={data?.data} invitations={data?.data?.pendingOwnerForms} />
    </div>
  );
};

export default MyApplications;
