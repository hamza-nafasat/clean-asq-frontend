import { useGetFormHistoryQuery } from "@/redux/apis/form.apis";
import { FiAlertCircle } from "react-icons/fi";
import AppDataTable from "@/components/shared/AppDataTable";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { buildHistoryColumns } from "../utils/underwriting.columns";

const UnderwritingHistory = ({ submissionId = "", sectionNames = {} }) => {
  const { data, isLoading, isError, refetch } = useGetFormHistoryQuery(
    { formSubmittedId: submissionId },
    { skip: !submissionId },
  );

  if (isLoading) return <LoadingState title="Loading history" />;
  if (isError)
    return (
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load the history">
        <Button type="button" label="Try again" onClick={refetch} />
      </EmptyState>
    );

  return (
    <section className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <AppDataTable
        data={data?.data?.history ?? []}
        columns={buildHistoryColumns({ sectionNames })}
        pagination
        highlightOnHover
        noDataComponent="No history yet"
        emptyDescription="Changes to this application will appear here."
      />
    </section>
  );
};

export default UnderwritingHistory;
