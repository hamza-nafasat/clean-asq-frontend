import { AI_CHAT_MODE } from "../constants/aiChatConstants.js";

/**
 * Build the standard POST body for /api/ai/* chat endpoints.
 * Always includes customPrompt when provided (branding personality).
 */
export function buildChatPayload({ messages, ctx, assistantMode, customPrompt, formLanguage }) {
  return {
    messages,
    chatMode: AI_CHAT_MODE,
    context: {
      screenId: ctx?.screenId,
      screenName: ctx?.screenName,
      description: ctx?.description,
      currentState: ctx?.currentState,
      logos: ctx?.logos,
      colorPalette: ctx?.colorPalette || undefined,
      forms: ctx?.forms || ctx?.currentState?.forms || undefined,
      brandingId: ctx?.brandingId || undefined,
      homeBranding: ctx?.homeBranding || ctx?.currentState?.homeBranding || undefined,
      availableForms: ctx?.availableForms || ctx?.currentState?.availableForms || undefined,
      availableBrandings: ctx?.availableBrandings || ctx?.currentState?.availableBrandings || undefined,
      maxHelpMode: assistantMode === "applicant",
      formLanguage: formLanguage && formLanguage !== "English" ? formLanguage : undefined,
      customPrompt: customPrompt || undefined,
    },
  };
}
