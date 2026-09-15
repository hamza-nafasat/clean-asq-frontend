import { FIELD_TYPES } from "@/constants";
import { AI_FIELD_TYPES } from "@/components/shared/AIChat/constants/aiChatConstants.js";

const PHONE_NAME_PATTERN = /phone|mobile|cell/i;
const US_COUNTRY_PATTERN = /^(us|usa|united states)$/;
const US_STATE_PATTERN =
  /^(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy|dc)$/;

// YYYY-MM-DD so a date input accepts the value
export const normalizeDateValue = (value) => {
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const isPhoneFieldMeta = (fieldId, fieldMeta) =>
  fieldMeta?.type === AI_FIELD_TYPES.TEL ||
  fieldMeta?.type === AI_FIELD_TYPES.PHONE ||
  PHONE_NAME_PATTERN.test(fieldId) ||
  PHONE_NAME_PATTERN.test(fieldMeta?.label || "");

// E.164 digits, inferring the country code from filled address fields
export const normalizePhoneValue = (value, fields) => {
  let digits = value.replace(/[^\d+]/g, "");
  if (!digits.startsWith("+") && !digits.startsWith("00")) {
    const countryField = fields.find((f) => /country/i.test(f.label) || /country/i.test(f.id));
    const stateField = fields.find((f) => /\bstate\b/i.test(f.label) || /\bstate\b/i.test(f.id));
    const countryVal = (countryField?.value || "").toLowerCase();
    const stateVal = (stateField?.value || "").toLowerCase();
    const isUS = US_COUNTRY_PATTERN.test(countryVal) || US_STATE_PATTERN.test(stateVal);
    digits = (isUS || (!countryVal && !stateVal) ? "+1" : "+") + digits;
  } else if (digits.startsWith("00")) {
    digits = "+" + digits.slice(2);
  }
  return digits;
};

// read a field's current value and filled state from the DOM
export const readDomField = (field) => {
  if (field.type === FIELD_TYPES.RADIO) {
    const checked = document.querySelector(`input[name="${CSS.escape(field.id)}"]:checked`);
    const value = checked?.value || "";
    return { ...field, value, filled: !!value };
  }
  const el = document.getElementById(field.id) || document.querySelector(`[name="${CSS.escape(field.id)}"]`);
  if (!el) return field;
  if (field.type === FIELD_TYPES.CHECKBOX) {
    return { ...field, value: el.checked ? "true" : "false", filled: el.checked };
  }
  const value = el.value || "";
  const isPhone =
    field.type === AI_FIELD_TYPES.TEL || PHONE_NAME_PATTERN.test(field.id || "") || PHONE_NAME_PATTERN.test(el.name || "");
  const filled = isPhone ? (value.match(/\d/g) || []).length >= 7 : !!value.trim();
  return { ...field, value, filled };
};

// field element by id, name, or AI id
export const findFieldElement = (fieldId) =>
  document.getElementById(fieldId) ||
  document.querySelector(`[name="${CSS.escape(fieldId)}"]`) ||
  document.querySelector(`[data-ai-id="${CSS.escape(fieldId)}"]`);
