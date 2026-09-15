import AllSubmissionDraft from "../components/MyApplicationsTabs";
import CustomLoading from "@/components/shared/CustomLoading";
import { useGetMyAllDraftsAndSubmittionsQuery } from "@/redux/apis/form.apis";

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
