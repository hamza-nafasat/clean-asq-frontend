import { AI_ASSISTANT_MODES } from "@/constants";
import { DEFAULT_FORM_LANGUAGE } from "@/components/shared/aiChat/constants/aiChatConstants.js";

// build the standard POST body for /api/ai/* chat endpoints
export const buildChatPayload = ({ messages, ctx, assistantMode, currentState, formLanguage, preferredLanguage }) => {
  const context = {
    screenId: ctx?.screenId,
    screenName: ctx?.screenName,
    description: ctx?.description,
    currentState: currentState !== undefined ? currentState : ctx?.currentState,
    logos: ctx?.logos,
    colorPalette: ctx?.colorPalette || undefined,
    forms: ctx?.forms || undefined,
    brandingId: ctx?.brandingId || undefined,
    maxHelpMode: assistantMode === AI_ASSISTANT_MODES.APPLICANT,
  };
  if (formLanguage && formLanguage !== DEFAULT_FORM_LANGUAGE) {
    context.formLanguage = formLanguage;
  }
  // english unless another was chosen
  if (preferredLanguage) context.preferredLanguage = preferredLanguage;
  return { messages, context };
};
