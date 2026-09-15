// fields whose values must never pass through AI servers
const SENSITIVE_FIELD_PATTERN =
  /\b(ssn|social[\s_\-.]?security|account[\s_\-.]?num(?:ber)?|routing|bank[\s_\-.]?acct?|account[\s_\-.]?no\b|pin\b|password)\b/i;
const PHONE_PATTERN = /phone|mobile|cell/i;

export const isRequiredElement = (el) => el.hasAttribute("required") || el.getAttribute("data-ai-required") === "true";

export const getFieldLabel = (el, containerEl, groupId) => {
  let label = el.getAttribute("data-ai-label") || "";
  if (!label && el.id) {
    const labelEl = containerEl.querySelector(`label[for="${el.id}"]`);
    if (labelEl) label = labelEl.textContent.replace(/\s*[*:]+\s*$/, "").trim();
  }
  return label || el.getAttribute("aria-label") || groupId;
};

// a radio group with its checked value and option labels
export const readRadioGroup = (el, containerEl, rawId, label) => {
  const allRadios = Array.from(containerEl.querySelectorAll(`input[name="${el.name}"]`));
  const value = allRadios.find((r) => r.checked)?.value || "";
  const options = allRadios.map((radio) => {
    let optLabel = "";
    if (radio.id) {
      const lbl = containerEl.querySelector(`label[for="${radio.id}"]`);
      if (lbl) optLabel = lbl.textContent.trim();
    }
    if (!optLabel) {
      const parentLbl = radio.closest("label");
      if (parentLbl) optLabel = parentLbl.textContent.trim();
    }
    return { value: radio.value, label: optLabel || radio.value };
  });
  return {
    id: rawId,
    label,
    type: "radio",
    value,
    required: isRequiredElement(el),
    filled: !!value,
    isSignature: false,
    options,
  };
};

// value, filled and default state of a non-radio field
export const readValueState = (el, isAiMarker) => {
  if (isAiMarker) {
    const value = el.getAttribute("data-ai-value") || "";
    return { value, filled: !!value, isDefault: false };
  }
  if (el.type === "checkbox") {
    // unchecked optional boxes are factory defaults the AI skips
    return {
      value: el.checked ? "true" : "false",
      filled: el.checked,
      isDefault: !el.checked && !isRequiredElement(el),
    };
  }
  if (el.tagName === "SELECT" && el.closest?.(".PhoneInput")) {
    // the phone country selector is always a library default
    return { value: el.value || "", filled: false, isDefault: true };
  }
  const value = el.value || "";
  // phone inputs keep a country code, so require 7 digits
  const isPhoneField = el.type === "tel" || PHONE_PATTERN.test(el.id || "") || PHONE_PATTERN.test(el.name || "");
  const filled = isPhoneField ? (value.match(/\d/g) || []).length >= 7 : value.trim() !== "";
  return { value, filled, isDefault: false };
};

// nearest data-ai-help-context above the field
export const getHelpContext = (el, containerEl) => {
  let ancestorEl = el.parentElement;
  while (ancestorEl && ancestorEl !== containerEl) {
    const ctx = ancestorEl.getAttribute("data-ai-help-context");
    if (ctx) return ctx;
    ancestorEl = ancestorEl.parentElement;
  }
  return undefined;
};

// "secure" for sensitive data, "direct" for native pickers
export const getFieldMode = (el, isAiMarker, rawId, label, directEntry) => {
  const explicitFieldMode = el.getAttribute?.("data-ai-field-mode");
  if (explicitFieldMode === "secure" || explicitFieldMode === "direct") return explicitFieldMode;
  if (
    !isAiMarker &&
    (el.type === "password" || SENSITIVE_FIELD_PATTERN.test(rawId || "") || SENSITIVE_FIELD_PATTERN.test(label || ""))
  ) {
    return "secure";
  }
  return directEntry ? "direct" : undefined;
};
