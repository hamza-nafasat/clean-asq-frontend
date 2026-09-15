import { useGetMyAllDraftsAndSubmittionsQuery } from "@/redux/apis/form.apis";
import CustomLoading from "@/components/shared/CustomLoading";
import MyApplicationsTabs from "../components/MyApplicationsTabs";

const MyApplications = () => {
  const { data, isLoading } = useGetMyAllDraftsAndSubmittionsQuery();

  if (isLoading) return <CustomLoading />;
  return (
    <div>
      <MyApplicationsTabs forms={data?.data} invitations={data?.data?.pendingOwnerForms} />
    </div>
  );
};

export default MyApplications;
