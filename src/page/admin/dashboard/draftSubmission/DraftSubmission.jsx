import AllSubmissionDraft from "@/components/admin/AllSubmissionDraft";
import CustomLoading from "@/components/shared/small/CustomLoading";
import { useGetMyAllDraftsAndSubmittionsQuery } from "@/redux/apis/formApis";

function DraftSubmission() {
  const { data, isLoading } = useGetMyAllDraftsAndSubmittionsQuery();

  if (isLoading) return <CustomLoading />;
  return (
    <div>
      <AllSubmissionDraft forms={data?.data} invitations={data?.data?.pendingOwnerForms} />
    </div>
  );
}

export default DraftSubmission;
