import { getDefaultChatEndpoint } from "@/components/shared/aiChat/utils/aiChat.constants.js";
import createToolHelpers from "./aiChat.toolHelpers.utils.js";
import createAdminTools from "./tools/aiChat.admin.tools.js";
import createApplicantTools from "./tools/aiChat.applicant.tools.js";
import createBrandingTools from "./tools/aiChat.branding.tools.js";
import createEmailTemplateTools from "./tools/aiChat.emailTemplate.tools.js";
import createFormEditorTools from "./tools/aiChat.formEditor.tools.js";
import createFormListTools from "./tools/aiChat.formList.tools.js";
import createGeneralTools from "./tools/aiChat.general.tools.js";
import createLogoTools from "./tools/aiChat.logo.tools.js";

const NO_SCREEN_CONTEXT = Object.freeze({ actions: {} });

const TOOL_GROUPS = [
  createGeneralTools,
  createBrandingTools,
  createLogoTools,
  createEmailTemplateTools,
  createAdminTools,
  createFormListTools,
  createFormEditorTools,
  createApplicantTools,
];

// tool-call handler bound to the chat widget's state and actions
export const createApplyToolCall = (bindings) => {
  let applyToolCall = null;
  const helpers = createToolHelpers(bindings);
  const deps = { bindings, helpers, getApplyToolCall: () => applyToolCall };
  const handlers = Object.assign({}, ...TOOL_GROUPS.map((createGroup) => createGroup(deps)));

  applyToolCall = async (tool, args, currentHistory) => {
    // pages without a screen context still get navigation and translation
    const ctx = bindings.getScreenContext() ?? NO_SCREEN_CONTEXT;
    if (!Object.hasOwn(handlers, tool)) return helpers.say(bindings.wt("cantDoOnPage"));
    const chatEndpoint = ctx.aiEndpoint || getDefaultChatEndpoint(bindings.assistantMode);
    await handlers[tool](args, { tool, ctx, chatEndpoint, currentHistory });
  };

  return applyToolCall;
};
