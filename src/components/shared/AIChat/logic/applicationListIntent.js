/** Intent detection for Applications list chat actions. */

export const FORWARD_FORM_DECLINE_MESSAGE =
  "I'm not able to open the Forward Form dialog from chat. " +
  "Use the three-dot menu on the application row and choose **Forward a form**, " +
  "or tell me if you need help with something else on this screen.";

export function isViewPdfIntent(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.toLowerCase();
  if (/\b(view|open|show|see)\b/.test(t) && /\b(pdf|detail|application|submission)\b/.test(t)) {
    if (isForwardFormIntent(text) || isUnderwritingIntent(text)) return false;
    return true;
  }
  return false;
}

export function isForwardFormIntent(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.toLowerCase();
  return /\bforward\b/.test(t) && /\b(form|application|submission)\b/.test(t);
}

export function isUnderwritingIntent(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.toLowerCase();
  return /\bunderwriting\b/.test(t) || /\bunderwrite\b/.test(t);
}

export function shouldBlockMistakenViewApplication(text) {
  if (!text) return false;
  if (isForwardFormIntent(text)) return true;
  if (isUnderwritingIntent(text)) return true;
  return false;
}

export function getMistakenViewApplicationMessage(text) {
  if (isForwardFormIntent(text)) return FORWARD_FORM_DECLINE_MESSAGE;
  if (isUnderwritingIntent(text)) {
    return null; // caller should route to openUnderwriting instead
  }
  return null;
}
