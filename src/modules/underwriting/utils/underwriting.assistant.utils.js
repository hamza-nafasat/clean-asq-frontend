import confirmOrCancel from "@/utils/confirmOrCancel";
import { AI_TOOLS } from "@/components/shared/aiChat/utils/aiChat.toolNames.constants.js";

export const buildUnderwritingScreenState = ({ submission }) => ({
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
  ruleResults: submission?.rulesAppliedAt
    ? submission.ruleResults.map(({ name, category, message, error }) => ({ name, category, message, error }))
    : null,
});

// the same preview and choice as the button
export const buildUnderwritingAssistantActions = ({ requestApplyRules }) => ({
  [AI_TOOLS.APPLY_RULES_TO_APPLICATION]: () => confirmOrCancel(requestApplyRules),
});
