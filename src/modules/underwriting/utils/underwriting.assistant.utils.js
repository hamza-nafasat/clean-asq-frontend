import confirmOrCancel from "@/utils/confirmOrCancel";
import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";

export const buildUnderwritingScreenState = ({ submission, ruleResults }) => ({
  applicationId: submission?._id,
  formName: submission?.form?.name,
  applicantName: [submission?.user?.firstName, submission?.user?.lastName].filter(Boolean).join(" "),
  applicantEmail: submission?.user?.email,
  status: submission?.status,
  statuses: submission?.statuses,
  version: submission?.version,
  submittedAt: submission?.createdAt,
  lastUpdatedAt: submission?.updatedAt,
  // null until the rules have run
  ruleResults: ruleResults?.map(({ name, category, message, error }) => ({ name, category, message, error })) ?? null,
});

export const buildUnderwritingAssistantActions = ({ submittedFormId, applyRulesOnForm, askConfirm }) => ({
  [AI_TOOLS.APPLY_RULES_TO_APPLICATION]: async () => {
    await confirmOrCancel(askConfirm, {
      title: "Apply Rules",
      message:
        "Re-run the form rules on this application? This can change its status and send rule-triggered emails.",
      confirmButtonText: "Apply Rules",
    });
    await applyRulesOnForm(submittedFormId).unwrap();
  },
});
