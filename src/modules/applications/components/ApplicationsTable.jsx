import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDeleteSingleSubmitOrDraftFormMutation, useGiveSpecialAccessToUserMutation } from "@/redux/apis/form.apis";
import { FiAlertCircle, FiInbox } from "react-icons/fi";
import { toast } from "react-toastify";
import usePermission from "@/hooks/usePermission";
import useResumeDraft from "@/hooks/useResumeDraft";
import useRowActionMenu from "@/hooks/useRowActionMenu";
import { ApplicationPdfViewCommonProps } from "@/components/global/ApplicationPdfView";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import AppDataTable from "@/components/shared/AppDataTable";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import Modal from "@/components/shared/Modal";
import ApplicationsForwardModal from "./ApplicationsForwardModal";
import { LAYOUT_ROUTES } from "@/constants";
import { PERMISSIONS } from "@/utils/permissions";
import { buildColumns, buildRowButtons } from "../utils/applications.columns";
import { INITIAL_FORWARD_FORM } from "../utils/applications.constants";
import {
  describeApplication,
  getForwardableSections,
  isSubmitted,
  validateForwardForm,
} from "../utils/applications.utils";

const ApplicationsTable = ({
  applications = [],
  hasApplications = false,
  forms = [],
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  const navigate = useNavigate();
  const currentUserId = useSelector((state) => state.auth.user?._id);
  const canDeleteApplication = usePermission(PERMISSIONS.DELETE_APPLICATION);
  const canShareApplication = usePermission(PERMISSIONS.SHARE_APPLICATION);
  const canUnderwrite = usePermission(PERMISSIONS.READ_UNDERWRITING);
  const canSubmitForm = usePermission(PERMISSIONS.SUBMIT_FORM);
  const resumeDraft = useResumeDraft();
  const [deleteApplication, { isLoading: isDeleting }] = useDeleteSingleSubmitOrDraftFormMutation();
  const [forwardSection, { isLoading: isForwarding }] = useGiveSpecialAccessToUserMutation();
  const { openRowId, setOpenRowId, toggleMenu, getRowRef } = useRowActionMenu({ closeOnOutsideClick: true });

  const [rowToView, setRowToView] = useState(null);
  const [rowToForward, setRowToForward] = useState(null);
  const [forwardForm, setForwardForm] = useState(INITIAL_FORWARD_FORM);
  const [forwardErrors, setForwardErrors] = useState({});
  const [rowToDelete, setRowToDelete] = useState(null);

  const getRowButtons = useMemo(() => {
    // close the menu, then act
    const fromMenu = (action) => (row) => {
      setOpenRowId(null);
      action(row);
    };
    return buildRowButtons({
      can: {
        delete: canDeleteApplication,
        share: canShareApplication,
        underwrite: canUnderwrite,
        continue: canSubmitForm,
      },
      currentUserId,
      onView: fromMenu(setRowToView),
      onForward: fromMenu(setRowToForward),
      onUnderwrite: fromMenu((row) => navigate(`${LAYOUT_ROUTES.UNDERWRITING}/${row._id}`)),
      onDelete: fromMenu(setRowToDelete),
      onContinue: fromMenu((row) =>
        resumeDraft({ formId: row.form?._id, draftId: row._id, brandingName: row.form?.branding?.name }),
      ),
    });
  }, [
    canDeleteApplication,
    canShareApplication,
    canUnderwrite,
    canSubmitForm,
    currentUserId,
    navigate,
    resumeDraft,
    setOpenRowId,
  ]);

  const columns = useMemo(
    () => buildColumns({ openRowId, getRowRef, getRowButtons, onToggleMenu: toggleMenu }),
    [openRowId, getRowRef, getRowButtons, toggleMenu],
  );

  const sectionOptions = getForwardableSections(forms.find((form) => form._id === rowToForward?.form?._id)).map(
    (section) => ({ value: section.key, label: section.name }),
  );

  const handleForwardChange = (e) => {
    const { name, value } = e.target;
    setForwardForm((prev) => ({ ...prev, [name]: value }));
    setForwardErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCloseForward = () => {
    setRowToForward(null);
    setForwardForm(INITIAL_FORWARD_FORM);
    setForwardErrors({});
  };

  const handleForward = async () => {
    const errors = validateForwardForm(forwardForm);
    if (Object.keys(errors).length) return setForwardErrors(errors);
    try {
      const res = await forwardSection({
        formId: rowToForward.form._id,
        submittedFormId: rowToForward._id,
        email: forwardForm.email.trim(),
        sectionKey: forwardForm.sectionKey,
      }).unwrap();
      toast.success(res.message);
      handleCloseForward();
    } catch (error) {
      console.error("Forward section error:", error);
      toast.error(error?.data?.message || "Failed to forward the section");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteApplication({ _id: rowToDelete._id, type: rowToDelete.type }).unwrap();
      toast.success(res.message);
      setRowToDelete(null);
    } catch (error) {
      console.error("Delete application error:", error);
      toast.error(error?.data?.message || "Failed to delete the application");
    }
  };

  if (isLoading) return <LoadingState title="Loading applications" />;
  if (isError)
    return (
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load applications">
        <Button type="button" label="Try again" onClick={onRetry} />
      </EmptyState>
    );
  if (!hasApplications)
    return (
      <EmptyState
        variant="panel"
        icon={<FiInbox size={28} />}
        title="No applications yet"
        description="Submitted applications and drafts will appear here."
      />
    );

  return (
    <>
      <section
        className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm"
        data-testid="applications-table"
      >
        <AppDataTable
          branded={false}
          columns={columns}
          data={applications}
          noDataComponent="No applications match these filters"
          highlightOnHover
          fixedHeader
          persistTableHead
          responsive
          pagination
        />
      </section>

      {rowToView && (
        <Modal width="min-w-[80vw]" onClose={() => setRowToView(null)}>
          <ApplicationPdfViewCommonProps
            userId={rowToView.user?._id ?? rowToView.user}
            pdfId={rowToView.form?._id}
            initialSubmitData={rowToView.submitData}
            submittedFormId={rowToView._id}
            className="rounded-lg"
            isPdf
            isDownloadAble
          />
        </Modal>
      )}

      <ApplicationsForwardModal
        isOpen={Boolean(rowToForward)}
        initialData={rowToForward}
        values={forwardForm}
        errors={forwardErrors}
        sectionOptions={sectionOptions}
        isLoading={isForwarding}
        onChange={handleForwardChange}
        onClose={handleCloseForward}
        onSubmit={handleForward}
      />

      <ConfirmationModal
        isOpen={Boolean(rowToDelete)}
        onClose={() => setRowToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={isSubmitted(rowToDelete) ? "Delete Application" : "Delete Draft"}
        message={`Are you sure you want to delete ${describeApplication(rowToDelete)}? This action cannot be undone.`}
        isLoading={isDeleting}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
        cancelButtonText="Cancel"
      />
    </>
  );
};

export default ApplicationsTable;
