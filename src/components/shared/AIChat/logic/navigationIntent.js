/** Detect cross-page navigation intent from user text (client-side recovery). */

import {
  isExplicitBrandingApplyIntent,
  isOpenApplyBrandingModalIntent,
} from "./brandingApplyIntent.js";

/** True when the user asked to open a modal/dialog we cannot handle via navigation. */
export function isModalOnlyRequest(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.toLowerCase();
  if (/\b(modal|dialog|pop-?up)\b/.test(t)) return true;
  if (/\bset\s*location\b|location\s+modal\b/.test(t)) return true;
  if (/\bupdate\s+form\b/.test(t)) return true;
  if (/\bmanage\s+rule\b|\brule\s+manag/.test(t)) return true;
  if (isOpenApplyBrandingModalIntent(text)) return true;
  return false;
}

/**
 * Map user navigation phrasing to a navigateToPage page id, or null if unknown.
 * Used when the AI mistakenly calls setFormsBranding for a navigation request.
 */
export function resolveNavigationPageFromText(text) {
  if (!text || typeof text !== "string") return null;
  if (isModalOnlyRequest(text)) return null;

  const t = text.toLowerCase();
  const hasNavVerb =
    /\b(go to|goto|navigate|take me|open|show|switch to|visit)\b/.test(t) ||
    /\bgo\s+home\b/.test(t);
  if (!hasNavVerb) return null;

  if (/\b(home\s*page|homepage|dashboard|main\s+page|take me home)\b/.test(t) || /\bgo\s+home\b/.test(t)) {
    return "home";
  }
  if (/\b(create|new)\b/.test(t) && /\bbranding\b/.test(t)) {
    return "branding-create";
  }
  if (/\b(application\s+forms?|applications?\s+forms?|forms?\s+page|form\s+management)\b/.test(t)) {
    return "application-forms";
  }
  if (/\b(submitted\s+)?applications?\b/.test(t) && !/\bapplication\s+forms?\b/.test(t)) {
    return "applications";
  }
  if (/\bbranding\b/.test(t)) {
    return "branding";
  }
  if (/\bstrateg/.test(t)) {
    return "strategies";
  }
  if (/\blookup\b/.test(t)) {
    return "lookup-management";
  }
  if (/\broles?\b/.test(t)) {
    return "role-management";
  }
  if (/\busers?\b/.test(t)) {
    return "user-management";
  }
  if (/\bemail\b|\btemplates?\b/.test(t)) {
    return "email";
  }
  if (/\btesting\b|\btests?\b/.test(t)) {
    return "testing";
  }

  return null;
}

/**
 * Pure navigation requests can be handled client-side without waiting for the AI.
 * Returns a page id, or null when the AI should handle handoff (branding apply, modals, compound tasks).
 */
export function shouldClientNavigateFromMessage(text) {
  const page = resolveNavigationPageFromText(text);
  if (!page) return null;
  if (isExplicitBrandingApplyIntent(text) || isModalOnlyRequest(text)) return null;
  if (/\band\b/i.test(text) && /\b(create|edit|delete|apply|assign|find|search|update)\b/i.test(text)) {
    return null;
  }
  return page;
}
