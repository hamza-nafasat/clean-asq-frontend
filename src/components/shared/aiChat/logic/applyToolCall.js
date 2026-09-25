import { getDefaultChatEndpoint } from "@/components/shared/aiChat/constants/aiChatConstants.js";
import createToolHelpers from "./toolHelpers.js";
import createAdminTools from "./tools/adminTools.js";
import createApplicantTools from "./tools/applicantTools.js";
import createBrandingTools from "./tools/brandingTools.js";
import createEmailTemplateTools from "./tools/emailTemplateTools.js";
import createFormEditorTools from "./tools/formEditorTools.js";
import createFormListTools from "./tools/formListTools.js";
import createGeneralTools from "./tools/generalTools.js";
import createLogoTools from "./tools/logoTools.js";
import createTestingDemoTools from "./tools/testingDemoTools.js";

const TOOL_GROUPS = [
  createGeneralTools,
  createBrandingTools,
  createLogoTools,
  createEmailTemplateTools,
  createAdminTools,
  createFormListTools,
  createFormEditorTools,
  createApplicantTools,
  createTestingDemoTools,
];

// tool-call handler bound to the chat widget's state and actions
export const createApplyToolCall = (bindings) => {
  let applyToolCall = null;
  const helpers = createToolHelpers(bindings);
  const deps = { bindings, helpers, getApplyToolCall: () => applyToolCall };
  const handlers = Object.assign({}, ...TOOL_GROUPS.map((createGroup) => createGroup(deps)));

  applyToolCall = async (tool, args, currentHistory) => {
    const ctx = bindings.getScreenContext();
    if (!ctx?.actions || !Object.hasOwn(handlers, tool)) return helpers.say(bindings.wt("cantDoOnPage"));
    const chatEndpoint = ctx.aiEndpoint || getDefaultChatEndpoint(bindings.assistantMode);
    await handlers[tool](args, { tool, ctx, chatEndpoint, currentHistory });
  };

  return applyToolCall;
};
