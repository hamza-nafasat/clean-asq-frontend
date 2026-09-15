import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  useDeleteSingleSubmitOrDraftFormMutation,
  useGetAllSubmitOrDraftFormsQuery,
} from "@/redux/apis/form.apis";
import { ApplicationPdfViewCommonProps } from "@/components/global/ApplicationPdfView";
import Modal from "@/components/shared/Modal";
import ApplicationsSpecialAccessModal from "../components/ApplicationsSpecialAccessModal";
import ApplicationsTable from "../components/ApplicationsTable";

const initialFilters = {
  dateRange: { start: "", end: "" },
  status: "",
  type: "",
};

const Applications = () => {
  const { data, isLoading: isLoadingForm, refetch } = useGetAllSubmitOrDraftFormsQuery();
  const [deleteSubmitForm, { isLoading: isLoadingDelete }] = useDeleteSingleSubmitOrDraftFormMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openSpecialAccess, setOpenSpecialAccess] = useState(false);
  const [selectedIdForSpecialAccessModal, setSelectedIdForSpecialAccessModal] = useState(null);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const applicants = data?.data || [];

  const handleViewApplicant = useCallback((row) => {
    setPdfData(row);
    setIsModalOpen(true);
  }, []);

  const handleDeleteApplication = useCallback(
    async ({ id, type }) => {
      setIsLoading(true);
      try {
        const res = await deleteSubmitForm({ _id: id, type }).unwrap();
        if (!res?.success) throw new Error(res?.message || "Failed to delete application");
        toast.success(res?.message || "Application deleted successfully");
        await refetch();
      } finally {
        setIsLoading(false);
      }
    },
    [deleteSubmitForm, refetch],
  );

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleClosePdf = () => {
    setIsModalOpen(false);
    setPdfData(null);
  };

  return (
    <>
      {openSpecialAccess && (
        <Modal onClose={() => setOpenSpecialAccess(false)}>
          <ApplicationsSpecialAccessModal
            formId={selectedFormId}
            submittedFormId={selectedIdForSpecialAccessModal}
            setModal={setOpenSpecialAccess}
          />
        </Modal>
      )}

      <div className="bg-backgroundColor rounded-t-md p-4" data-testid="applications-page">
        <div className="mb-4">
          <h2 className="text-textPrimary mb-4 text-xl font-semibold">Applicants</h2>

          <ApplicationsTable
            setSelectedIdForSpecialAccessModal={setSelectedIdForSpecialAccessModal}
            setSelectedFormId={setSelectedFormId}
            setOpenSpecialAccess={setOpenSpecialAccess}
            applicants={applicants}
            isLoading={isLoading || isLoadingForm}
            onView={handleViewApplicant}
            onDeleteApplication={handleDeleteApplication}
            isLoadingDelete={isLoadingDelete}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* View Applicant Modal */}
        {isModalOpen && (pdfData?.form?._id || pdfData?.form) && (
          <Modal width={"min-w-[80vw] max-w-2xl"} onClose={handleClosePdf} isLoading={isLoading}>
            <ApplicationPdfViewCommonProps
              userId={pdfData?.user?._id || pdfData?.user}
              pdfId={pdfData?.form?._id || pdfData?.form}
              className="rounded-lg!"
              isPdf={true}
              isDownloadAble={true}
            />
          </Modal>
        )}
      </div>
    </>
  );
};

export default Applications;
