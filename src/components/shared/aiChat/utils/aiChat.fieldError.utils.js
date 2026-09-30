import { FIELD_TYPES } from "@/constants";
import { AI_FIELD_TYPES, FIELD_MODES } from "@/components/shared/aiChat/utils/aiChat.constants.js";

const WEBSITE_PATTERN = /(website|web\s*site|\burl\b|homepage|domain|company-url)/;
const NO_WEBSITE_SELECTOR =
  '#noWebsite, input[name="noWebsite"], [data-testid="company-no-website-checkbox"], label[for="noWebsite"]';
const EDITABLE_TAGS = ["INPUT", "SELECT", "TEXTAREA"];
const SKIPPED_INPUT_TYPES = [FIELD_TYPES.PASSWORD, FIELD_TYPES.CHECKBOX, FIELD_TYPES.RADIO];

export const FIELD_ERROR_MODAL_SELECTOR = "[data-field-error-modal]";
export const ACTION_ELEMENT_SELECTOR = "button, a, input[type='submit'], [role='button']";

export const isWebsiteText = (text) => WEBSITE_PATTERN.test(text);

export const isNoWebsiteControl = (node) => !!node?.closest?.(NO_WEBSITE_SELECTOR);

// the field's id, label, type and value when it should be checked, else null
export const getCheckableField = (el, ctx, chatInputEl) => {
  if (!el || el === chatInputEl) return null;
  if (!EDITABLE_TAGS.includes(el.tagName)) return null;
  if (SKIPPED_INPUT_TYPES.includes(el.type)) return null;
  if (el.closest?.("[data-ai-type='sign']")) return null;

  const rawValue = el.value?.trim();
  if (!rawValue) return null;

  const fieldId = el.id || el.getAttribute("name");
  if (!fieldId) return null;

  const fields = ctx?.currentState?.fields || [];
  const meta = fields.find((f) => f.id === fieldId);
  if (meta?.fieldMode === FIELD_MODES.SECURE || meta?.isSignature) return null;
  // auto-defaulted fields such as the phone country selector
  if (meta?.isDefault) return null;

  const fieldLabel = meta?.label || fieldId;
  const fieldType = meta?.type || el.type || FIELD_TYPES.TEXT;

  // "company has no website" skips website checks
  const noWebsiteEl = document.getElementById("noWebsite") || document.querySelector('input[name="noWebsite"]');
  if (noWebsiteEl?.checked && isWebsiteText(`${fieldId} ${fieldLabel}`.toLowerCase())) return null;

  return { fieldId, fieldLabel, fieldType, rawValue };
};

export const buildRetryNote = ({ fieldId, fieldLabel, fieldType }) => {
  const isEmail =
    fieldType === FIELD_TYPES.EMAIL ||
    fieldId.toLowerCase().includes(FIELD_TYPES.EMAIL) ||
    fieldLabel.toLowerCase().includes(FIELD_TYPES.EMAIL);
  return isEmail
    ? "If a step was already triggered using this address — such as sending a verification code — you may need to repeat it after saving the corrected value."
    : null;
};

export const isSignType = (type) => type === AI_FIELD_TYPES.SIGN;
