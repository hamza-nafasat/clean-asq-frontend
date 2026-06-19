/** Intent detection for Apply Branding chat actions. */

export const APPLY_BRANDING_MODAL_DECLINE_MESSAGE =
  "I'm not able to open the Apply Branding dialog from chat. " +
  "If you'd like, I can apply a branding profile directly to your home/website or to a specific application form — " +
  "just tell me which branding and where (for example: \"apply Fintanium branding to the home page\").";

/** User wants the Apply Branding UI modal — not another modal or page. */
export function isOpenApplyBrandingModalIntent(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.toLowerCase();
  if (/\bapply\s+branding\b/.test(t) && /\b(modal|dialog|pop-?up)\b/.test(t)) return true;
  if (/\bopen\b.*\bapply\s+branding\b/.test(t)) return true;
  if (/\bapply\s+branding\s+(modal|dialog)\b/.test(t)) return true;
  if (/\b(modal|dialog)\b.*\bapply\s+branding\b/.test(t)) return true;
  return false;
}

/** User explicitly wants branding applied to a target (not opening UI). */
export function isExplicitBrandingApplyIntent(text) {
  if (!text || typeof text !== "string") return false;
  if (isOpenApplyBrandingModalIntent(text)) return false;
  const t = text.toLowerCase();
  if (/\b(apply|assign|set)\b/.test(t) && /\b(home\s*page|homepage|whole\s+website|website|dashboard)\b/.test(t)) {
    return true;
  }
  if (/\bapply\b/.test(t) && /\bbranding\b/.test(t) && !/\b(modal|dialog)\b/.test(t)) return true;
  if (/\b(apply|assign|set)\b/.test(t) && /\bbranding\b/.test(t)) return true;
  return false;
}

/** User asked to open a modal/page/dialog that is NOT apply-branding. */
export function isNonBrandingUiOpenRequest(text) {
  if (!text || typeof text !== "string") return false;
  if (isOpenApplyBrandingModalIntent(text) || isExplicitBrandingApplyIntent(text)) return false;
  const t = text.toLowerCase();
  if (/\bset\s*location\b|location\s+modal\b/.test(t)) return true;
  if (/\bupdate\s+form\b/.test(t) && /\b(modal|dialog|open)\b/.test(t)) return true;
  if (/\bmanage\s+rule\b|\brule\s+manag/.test(t)) return true;
  if (/\b(open|show|display|launch|navigate|go to)\b/.test(t) && /\b(modal|dialog|pop-?up|page|screen)\b/.test(t)) {
    return true;
  }
  if (/\b(open|show)\b/.test(t) && /\bpage\b/.test(t)) return true;
  return false;
}

/** True when setFormsBranding should be blocked for an apply-branding modal request. */
export function shouldBlockBrandingApplyForModalRequest(text) {
  return isOpenApplyBrandingModalIntent(text) && !isExplicitBrandingApplyIntent(text);
}

/** Contextual decline when the user asked for UI the assistant cannot open from chat. */
export function getUnsupportedUiActionMessage(text) {
  const t = (text || "").toLowerCase();
  if (/\bset\s*location\b|location\s+modal\b/.test(t)) {
    return (
      "I'm not able to open the Set Location dialog from chat. " +
      "Go to Application Forms to change location settings, or tell me on that screen which form should have location required, optional, or disabled."
    );
  }
  if (/\bupdate\s+form\b/.test(t)) {
    return (
      "I'm not able to open the Update Form dialog from chat. " +
      "On Application Forms, tell me what you want to change (name, header, redirect URL, etc.) and I can update it directly."
    );
  }
  if (/\bmanage\s+rule\b|\brule\s+manag/.test(t)) {
    return (
      "I'm not able to open the Manage Rules page from chat. " +
      "Use the admin navigation to get there, or tell me what you need and I'll help with what's available on this screen."
    );
  }
  if (isOpenApplyBrandingModalIntent(text)) {
    return APPLY_BRANDING_MODAL_DECLINE_MESSAGE;
  }
  if (/\b(modal|dialog|page|screen)\b/.test(t) && /\b(open|show|launch|navigate)\b/.test(t)) {
    return (
      "I'm not able to open that dialog or page from chat. " +
      "Tell me what you're trying to accomplish and I'll help using the actions available on this screen."
    );
  }
  return (
    "I don't have a way to do that from chat on this screen. " +
    "Tell me what you're trying to accomplish and I'll help with what's available here."
  );
}

/** Block mistaken setFormsBranding when the user did not ask to apply branding. */
export function shouldBlockMistakenBrandingApply(text) {
  if (!text || typeof text !== "string") return false;
  if (isExplicitBrandingApplyIntent(text)) return false;
  if (shouldBlockBrandingApplyForModalRequest(text)) return true;
  if (isNonBrandingUiOpenRequest(text)) return true;
  if (/\b(open|show|navigate|go to)\b/i.test(text) && !/\bbranding\b/i.test(text)) return true;
  return false;
}

export function getMistakenBrandingApplyDeclineMessage(text) {
  if (shouldBlockBrandingApplyForModalRequest(text)) return APPLY_BRANDING_MODAL_DECLINE_MESSAGE;
  return getUnsupportedUiActionMessage(text);
}
