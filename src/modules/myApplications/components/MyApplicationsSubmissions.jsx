import { useState } from "react";
import { useSelector } from "react-redux";
import {
  useApplicantGiveSpecialAccessToBeneficialOwnerMutation,
  useGeneratePdfFormMutation,
} from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import usePermission from "@/hooks/usePermission";
import useRowActionMenu from "@/hooks/useRowActionMenu";
import EmptyState from "@/components/shared/EmptyState";
import MyApplicationsInviteOwnerModal from "./MyApplicationsInviteOwnerModal";
import MyApplicationsSubmissionCard from "./MyApplicationsSubmissionCard";
import downloadBlob from "@/utils/downloadBlob";
import { PERMISSIONS } from "@/utils/permissions";
import { INITIAL_INVITE_FORM } from "../utils/myApplications.constants";
import { getBeneficialOwners, validateInviteForm } from "../utils/myApplications.utils";

const MyApplicationsSubmissions = ({ forms = [] }) => {
  const userId = useSelector((state) => state.auth.user?._id);
  const canInviteOwner = usePermission(PERMISSIONS.INVITE_OWNER);
  const [generatePdfForm] = useGeneratePdfFormMutation();
  const [inviteOwner, { isLoading: isInviting }] = useApplicantGiveSpecialAccessToBeneficialOwnerMutation();
  const { openRowId, setOpenRowId, toggleMenu, getRowRef } = useRowActionMenu({ closeOnOutsideClick: true });
  const [downloadingId, setDownloadingId] = useState(null);
  const [submissionToInvite, setSubmissionToInvite] = useState(null);
  const [inviteForm, setInviteForm] = useState(INITIAL_INVITE_FORM);
  const [inviteErrors, setInviteErrors] = useState({});

  const handleDownload = async (submission) => {
    setDownloadingId(submission.submissionId);
    try {
      const blob = await generatePdfForm({
        _id: submission._id,
        userId,
        submissionId: submission.submissionId,
      }).unwrap();
      downloadBlob(blob, `form-${submission._id}.pdf`);
    } catch (error) {
      console.error("Download pdf error:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenInvite = (submission) => {
    setOpenRowId(null);
    setSubmissionToInvite(submission);
  };

  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteForm((prev) => ({ ...prev, [name]: value }));
    setInviteErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCloseInvite = () => {
    setSubmissionToInvite(null);
    setInviteForm(INITIAL_INVITE_FORM);
    setInviteErrors({});
  };

  const handleInvite = async () => {
    const errors = validateInviteForm(inviteForm);
    if (Object.keys(errors).length) return setInviteErrors(errors);
    try {
      const res = await inviteOwner({
        formId: submissionToInvite._id,
        submissionId: submissionToInvite.submissionId,
        email: inviteForm.email.trim(),
      }).unwrap();
      toast.success(res.message || "Special access sent successfully");
      handleCloseInvite();
    } catch (error) {
      console.error("Invite owner error:", error);
      toast.error(error?.data?.message || "Failed to invite the owner");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
        {forms.length > 0 ? (
          forms.map((submission) => (
            <MyApplicationsSubmissionCard
              key={submission.submissionId}
              submission={submission}
              canInviteOwner={canInviteOwner}
              isMenuOpen={openRowId === submission.submissionId}
              menuRef={getRowRef(submission.submissionId)}
              isDownloading={downloadingId === submission.submissionId}
              onToggleMenu={() => toggleMenu(submission.submissionId)}
              onInvite={() => handleOpenInvite(submission)}
              onDownload={() => handleDownload(submission)}
            />
          ))
        ) : (
          <EmptyState
            variant="panel"
            className="col-span-full"
            title="No submissions yet"
            description="Applications you submit will appear here."
          />
        )}
      </div>

      <MyApplicationsInviteOwnerModal
        isOpen={Boolean(submissionToInvite)}
        owners={submissionToInvite ? getBeneficialOwners(submissionToInvite).totalOwners : []}
        values={inviteForm}
        errors={inviteErrors}
        isLoading={isInviting}
        onChange={handleInviteChange}
        onClose={handleCloseInvite}
        onSubmit={handleInvite}
      />
    </>
  );
};

export default MyApplicationsSubmissions;
