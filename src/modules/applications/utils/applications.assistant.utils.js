import confirmOrCancel from "@/utils/confirmOrCancel";
import downloadBlob from "@/utils/downloadBlob";
import { AI_TOOLS } from "@/components/shared/aiChat/utils/aiChat.toolNames.constants.js";
import {
  describeApplication,
  getDisplayStatus,
  getForwardableSections,
  getFullName,
  isSubmitted,
} from "./applications.utils";

const findSubmittedApplication = (applications, applicationId) => {
  const application = applications.find((item) => item._id === applicationId);
  if (!isSubmitted(application)) throw new Error("Submitted application not found");
  return application;
};

// forms whose sections can be forwarded
export const getSubmittedFormIds = (applications) => [
  ...new Set(
    applications
      .filter(isSubmitted)
      .map((application) => application.form?._id)
      .filter(Boolean),
  ),
];

export const buildApplicationsScreenState = ({ applications, forms }) => ({
  applications: applications.map((application) => ({
    _id: application._id,
    type: application.type,
    status: getDisplayStatus(application),
    applicantName: getFullName(application.user),
    applicantEmail: application.user?.email,
    applicantRole: application.user?.role?.name,
    formId: application.form?._id,
    formName: application.form?.name,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  })),
  forwardableForms: forms.map((form) => ({
    formId: form._id,
    formName: form.name,
    sections: getForwardableSections(form).map(({ key, name }) => ({ key, name })),
  })),
});

export const buildApplicationsAssistantActions = ({
  applications,
  forms,
  deleteApplication,
  giveSpecialAccessToUser,
  generateApplicationPdf,
  askConfirm,
}) => ({
  [AI_TOOLS.DELETE_APPLICATIONS]: async ({ applicationIds }) => {
    const targets = applications.filter((application) => applicationIds?.includes(application._id));
    if (!targets.length) throw new Error("Application not found");
    await confirmOrCancel(askConfirm, {
      title: "Delete Applications",
      message: `Permanently delete ${targets.map(describeApplication).join(", ")}? This cannot be undone.`,
      confirmButtonText: "Delete",
    });
    for (const application of targets) {
      await deleteApplication({ _id: application._id, type: application.type }).unwrap();
    }
  },
  [AI_TOOLS.FORWARD_APPLICATION_SECTION]: async ({ applicationId, sectionKey, email }) => {
    const application = findSubmittedApplication(applications, applicationId);
    const form = forms.find((item) => item._id === application.form?._id);
    const section = getForwardableSections(form).find((item) => item.key === sectionKey);
    if (!section) throw new Error("That section cannot be forwarded for this application");
    await confirmOrCancel(askConfirm, {
      title: "Forward a Section",
      message: `Email ${email} a link to fill in the "${section.name}" section of ${describeApplication(application)}?`,
      confirmButtonText: "Send",
    });
    await giveSpecialAccessToUser({ formId: form._id, submittedFormId: application._id, email, sectionKey }).unwrap();
  },
  [AI_TOOLS.DOWNLOAD_APPLICANT_PDF]: async ({ applicationId }) => {
    const application = findSubmittedApplication(applications, applicationId);
    const blob = await generateApplicationPdf({ submissionId: application._id }).unwrap();
    downloadBlob(blob, `form-${application.form?._id}.pdf`);
  },
});
