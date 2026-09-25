import AppDataTable from "@/components/shared/AppDataTable";
import { useGetFormHistoryQuery } from "@/redux/apis/form.apis";
import { buildHistoryColumns } from "../utils/underwriting.utils";

const UnderwritingHistory = ({ submittedFormId = "" }) => {
  const { data: historyData, isLoading: isLoadingHistory } = useGetFormHistoryQuery(
    { formSubmittedId: submittedFormId },
    { skip: !submittedFormId },
  );

  return (
    <div>
      <AppDataTable
        data={historyData?.data?.history || []}
        columns={buildHistoryColumns()}
        pagination
        highlightOnHover
        progressPending={isLoadingHistory}
        noDataComponent="No history yet"
        emptyDescription="Changes to this application will appear here."
        className="rounded-t-xl!"
      />
    </div>
  );
};

export default UnderwritingHistory;
