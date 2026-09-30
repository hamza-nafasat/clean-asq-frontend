import confirmOrCancel from "@/utils/confirmOrCancel";
import downloadBlob from "@/utils/downloadBlob";
import { AI_TOOLS } from "@/components/shared/aiChat/utils/aiChat.toolNames.constants.js";
import { getBeneficialOwners } from "./myApplications.utils";

const findSubmission = (submissions, applicationId) => {
  const submission = submissions.find((item) => item.submissionId === applicationId);
  if (!submission) throw new Error("Submitted application not found");
  return submission;
};

export const buildMyApplicationsScreenState = ({ drafts, submissions, invitations }) => ({
  drafts: drafts.map((draft) => ({
    _id: draft.draftId,
    formName: draft.name,
    startedAt: draft.draftCreatedAt,
    updatedAt: draft.draftUpdatedAt,
  })),
  submissions: submissions.map((submission) => ({
    _id: submission.submissionId,
    formName: submission.name,
    submittedAt: submission.submittedAt,
    status: submission.status,
    beneficialOwners: getBeneficialOwners(submission).totalOwners.map(({ name, email, isCompleted }) => ({
      name,
      email,
      isCompleted,
    })),
  })),
  ownerInvitations: invitations.map((invitation) => ({ formName: invitation.name, invitedAt: invitation.invitedAt })),
});

export const buildMyApplicationsAssistantActions = ({
  drafts,
  submissions,
  userId,
  removeSavedForm,
  inviteBeneficialOwner,
  generatePdfForm,
  askConfirm,
}) => ({
  [AI_TOOLS.DELETE_DRAFTS]: async ({ draftIds }) => {
    const targets = drafts.filter((draft) => draftIds?.includes(draft.draftId));
    if (!targets.length) throw new Error("Draft not found");
    await confirmOrCancel(askConfirm, {
      title: "Delete Drafts",
      message: `Permanently delete ${targets.map((draft) => `"${draft.name}"`).join(", ")}? This cannot be undone.`,
      confirmButtonText: "Delete",
    });
    for (const draft of targets) {
      await removeSavedForm({ formId: draft._id, draftId: draft.draftId }).unwrap();
    }
  },
  [AI_TOOLS.INVITE_BENEFICIAL_OWNER]: async ({ applicationId, email }) => {
    const submission = findSubmission(submissions, applicationId);
    await confirmOrCancel(askConfirm, {
      title: "Invite Beneficial Owner",
      message: `Email ${email} an invitation to add their details to "${submission.name}"?`,
      confirmButtonText: "Send",
    });
    await inviteBeneficialOwner({ formId: submission._id, submissionId: submission.submissionId, email }).unwrap();
  },
  [AI_TOOLS.DOWNLOAD_APPLICATION_PDF]: async ({ applicationId }) => {
    const submission = findSubmission(submissions, applicationId);
    const blob = await generatePdfForm({ _id: submission._id, userId, submissionId: submission.submissionId }).unwrap();
    downloadBlob(blob, `form-${submission._id}.pdf`);
  },
});
