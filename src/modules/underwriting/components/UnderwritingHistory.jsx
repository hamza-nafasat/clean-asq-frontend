import DataTable from "react-data-table-component";
import { useGetFormHistoryQuery } from "@/redux/apis/form.apis";
import useBranding from "@/hooks/useBranding";
import { getTableStyles } from "@/utils/tableStyles";
import { buildHistoryColumns } from "../utils/underwriting.utils";

const UnderwritingHistory = ({ submittedFormId = "" }) => {
  const { data: historyData, isLoading: isLoadingHistory } = useGetFormHistoryQuery(
    { formSubmittedId: submittedFormId },
    { skip: !submittedFormId },
  );
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  return (
    <div>
      <DataTable
        data={historyData?.data?.history || []}
        columns={buildHistoryColumns()}
        customStyles={tableStyles}
        pagination
        highlightOnHover
        progressPending={isLoadingHistory}
        noDataComponent="No History found"
        className="rounded-t-xl!"
      />
    </div>
  );
};

export default UnderwritingHistory;
