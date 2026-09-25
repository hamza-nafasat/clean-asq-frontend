import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  useDeleteSingleSubmitOrDraftFormMutation,
  useGeneratePdfFormMutation,
  useGetAllSubmitOrDraftFormsQuery,
  useGiveSpecialAccessToUserMutation,
} from "@/redux/apis/form.apis";
import useConfirm from "@/hooks/useConfirm";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import useApplicationsForms from "./hooks/useApplicationsForms";
import { ApplicationPdfViewCommonProps } from "@/components/global/ApplicationPdfView";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Modal from "@/components/shared/Modal";
import ApplicationsSpecialAccessModal from "./components/ApplicationsSpecialAccessModal";
import ApplicationsTable from "./components/ApplicationsTable";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import { APPLICATIONS_AI_CHAT_PATH, APPLICATIONS_SCREEN_CONTEXT } from "./utils/applications.constants";
import {
  buildApplicationsAssistantActions,
  buildApplicationsScreenState,
  getSubmittedFormIds,
} from "./utils/applications.assistant.utils";

const SERVER_URL = getEnv("SERVER_URL");

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

  const aiConfirm = useConfirm();
  const canShareApplication = usePermission(PERMISSIONS.SHARE_APPLICATION);
  const [giveSpecialAccessToUser] = useGiveSpecialAccessToUserMutation();
  const [generatePdfForm] = useGeneratePdfFormMutation();
  const forms = useApplicationsForms(canShareApplication ? getSubmittedFormIds(applicants) : []);

  useScreenContext({
    ...APPLICATIONS_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}${APPLICATIONS_AI_CHAT_PATH}`,
    currentState: buildApplicationsScreenState({ applications: applicants, forms }),
    actions: buildApplicationsAssistantActions({
      applications: applicants,
      forms,
      deleteApplication: deleteSubmitForm,
      giveSpecialAccessToUser,
      generatePdfForm,
      askConfirm: aiConfirm.ask,
    }),
    deps: { applicationCount: applicants.length, formCount: forms.length },
  });

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

      <ConfirmationModal
        isOpen={aiConfirm.isOpen}
        title={aiConfirm.pending?.title}
        message={aiConfirm.pending?.message}
        confirmButtonText={aiConfirm.pending?.confirmButtonText}
        onConfirm={aiConfirm.resolveAsked}
        onClose={aiConfirm.close}
      />
    </>
  );
};

export default Applications;
