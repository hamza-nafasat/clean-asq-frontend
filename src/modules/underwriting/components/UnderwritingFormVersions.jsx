import { useMemo, useState } from "react";
import { useGetFormVersionsQuery } from "@/redux/apis/form.apis";
import { FiAlertCircle, FiEye, FiGitPullRequest } from "react-icons/fi";
import useRowActionMenu from "@/hooks/useRowActionMenu";
import AppDataTable from "@/components/shared/AppDataTable";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import Modal from "@/components/shared/Modal";
import UnderwritingFieldChanges from "./UnderwritingFieldChanges";
import UnderwritingVersionDetails from "./UnderwritingVersionDetails";
import { buildVersionColumns } from "../utils/underwriting.columns";

const UnderwritingFormVersions = ({ submissionId = "", submission = null, sectionNames = {} }) => {
  const [versionToView, setVersionToView] = useState(null);
  const [versionToCompare, setVersionToCompare] = useState(null);
  const { openRowId, setOpenRowId, toggleMenu, getRowRef } = useRowActionMenu({ closeOnOutsideClick: true });
  const { data, isLoading, isError, refetch } = useGetFormVersionsQuery(
    { submittedFormId: submissionId },
    // always show the newest versions
    { skip: !submissionId, refetchOnMountOrArgChange: true },
  );

  const columns = useMemo(() => {
    // close the menu, then open the view
    const fromMenu = (open) => (row) => {
      setOpenRowId(null);
      open(row);
    };
    const buttons = [
      { name: "Version Details", icon: <FiEye size={16} className="mr-2" />, onClick: fromMenu(setVersionToView) },
      {
        name: "Field Differences",
        icon: <FiGitPullRequest size={16} className="mr-2" />,
        onClick: fromMenu(setVersionToCompare),
      },
    ];
    return buildVersionColumns({ openRowId, getRowRef, onToggleMenu: toggleMenu, buttons });
  }, [openRowId, getRowRef, toggleMenu, setOpenRowId]);

  if (isLoading) return <LoadingState title="Loading versions" />;
  if (isError)
    return (
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load the versions">
        <Button type="button" label="Try again" onClick={refetch} />
      </EmptyState>
    );

  return (
    <>
      <section className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <AppDataTable
          data={data?.data ?? []}
          columns={columns}
          highlightOnHover
          fixedHeader
          persistTableHead
          responsive
          noDataComponent="No form versions yet"
          emptyDescription="Saved versions of this application form will appear here."
        />
      </section>

      {versionToCompare && (
        <Modal title="Field Changes" onClose={() => setVersionToCompare(null)}>
          <UnderwritingFieldChanges version={versionToCompare} sectionNames={sectionNames} />
        </Modal>
      )}
      {versionToView && (
        <Modal width="min-w-[75vw]" title="Version Details" onClose={() => setVersionToView(null)}>
          <UnderwritingVersionDetails key={versionToView._id} version={versionToView} submission={submission} />
        </Modal>
      )}
    </>
  );
};

export default UnderwritingFormVersions;
