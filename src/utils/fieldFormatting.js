import { FIELD_TYPES } from "@/constants";

const FOCUSABLE_FIELDS_SELECTOR = "input:not([disabled]), select:not([disabled]), textarea:not([disabled])";
const VISIBLE_DIGITS = 4;

export const GOOGLE_PLACE_FIELDS = ["address_components", "formatted_address", "geometry", "place_id"];

export const BLOCK_CLIPBOARD_PROPS = {
  onPaste: (e) => e.preventDefault(),
  onCopy: (e) => e.preventDefault(),
  onCut: (e) => e.preventDefault(),
};

// write one field entry inside a form section
export const setSectionFieldValue = (setForm, sectionKey, key, name, value) =>
  setForm((prev) => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [key]: { name, value } } }));

export const getFormatParts = (format) =>
  String(format || "")
    .split(",")
    .map((n) => parseInt(n.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

export const limitByFormat = (value, format) => {
  const maxDigits = getFormatParts(format).reduce((a, b) => a + b, 0);
  const digits = String(value || "").replace(/\D/g, "");
  if (!maxDigits) return digits;
  return digits.slice(0, maxDigits);
};

export const formatByParts = (raw, format) => {
  const parts = getFormatParts(format);
  if (!parts.length) return String(raw || "");
  const maxDigits = parts.reduce((a, b) => a + b, 0);
  const digits = String(raw || "")
    .replace(/\D/g, "")
    .slice(0, maxDigits);
  let out = "";
  let start = 0;
  for (let i = 0; i < parts.length; i++) {
    if (start >= digits.length) break;
    out += digits.slice(start, start + parts[i]);
    start += parts[i];
    if (i < parts.length - 1 && start < digits.length) out += "-";
  }
  return out;
};

export const formatDateValue = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split(/[-/]/);
  return `${year}-${month}-${day}`;
};

export const normalizeDateValue = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split(/[-\s/]/);
  return `${year}-${month}-${day}`;
};

export const maskValue = (value) => {
  const raw = value.toString();
  return raw.length > VISIBLE_DIGITS
    ? `${"*".repeat(raw.length - VISIBLE_DIGITS)}${raw.slice(-VISIBLE_DIGITS)}`
    : "*".repeat(raw.length);
};

export const formatFieldDisplayValue = (type, value, { formatting, isMasked = false, showMasked = false } = {}) => {
  if (!value) return "";
  if (showMasked && isMasked) return maskValue(value);
  if (type === FIELD_TYPES.DATE) return formatDateValue(value);
  if (getFormatParts(formatting).length > 0) return formatByParts(value, formatting);
  return value;
};

export const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

export const isEmptyFileValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return !(value.secureUrl || value.publicId || value.file);
  return false;
};

export const focusNextField = (el) => {
  if (!el) return;
  const focusable = Array.from(document.querySelectorAll(FOCUSABLE_FIELDS_SELECTOR)).filter(
    (f) => f.offsetParent !== null && f.tabIndex !== -1,
  );
  const idx = focusable.indexOf(el);
  if (idx >= 0 && idx + 1 < focusable.length) focusable[idx + 1].focus();
};

export const advanceToNextField = (currentEl) => {
  const focusable = Array.from(document.querySelectorAll(FOCUSABLE_FIELDS_SELECTOR));
  const idx = focusable.indexOf(currentEl);
  if (idx !== -1 && idx < focusable.length - 1) focusable[idx + 1].focus();
};

export const getSelectDisplayValue = (options, value) => {
  let displayValue = value ?? "";
  const isValueInOptions = options?.some((option) => option.value === displayValue);
  if (!isValueInOptions) {
    const matchedOptionByLabel = options?.find(
      (option) => String(option.label).toLowerCase() === String(displayValue).toLowerCase(),
    );
    if (matchedOptionByLabel) displayValue = matchedOptionByLabel.value;
  }
  const hiddenValue = !isValueInOptions && displayValue && value ? value : undefined;
  return { displayValue, hiddenValue };
};
