/**
 * Build the standard POST body for /api/ai/* chat endpoints.
 * Matches the wire payload sent by the stagging AIChatWidget exactly:
 *   { messages, context: { screenId, screenName, description, currentState,
 *     logos, colorPalette, forms, brandingId, maxHelpMode, formLanguage? } }
 * `formLanguage` is only included when it is a non-English language.
 */
export function buildChatPayload({ messages, ctx, assistantMode, currentState, formLanguage }) {
  const context = {
    screenId: ctx?.screenId,
    screenName: ctx?.screenName,
    description: ctx?.description,
    currentState: currentState !== undefined ? currentState : ctx?.currentState,
    logos: ctx?.logos,
    colorPalette: ctx?.colorPalette || undefined,
    forms: ctx?.forms || undefined,
    brandingId: ctx?.brandingId || undefined,
    maxHelpMode: assistantMode === "applicant",
  };
  if (formLanguage && formLanguage !== "English") {
    context.formLanguage = formLanguage;
  }
  return { messages, context };
}
