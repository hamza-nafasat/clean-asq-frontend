import {
  getFieldLabel,
  getFieldMode,
  getHelpContext,
  isRequiredElement,
  readRadioGroup,
  readValueState,
} from "@/utils/discoverFormFields2";

const CANDIDATE_SELECTOR =
  "[data-ai-type], " +
  "input:not([type='hidden']):not([type='submit']):not([type='button'])" +
  ":not([type='reset']):not([type='image']):not([type='file']), " +
  "textarea, select";

// form field by AI id, html id, or name
export const findAiFieldEl = (containerEl, fieldId) => {
  if (!fieldId) return null;
  const escaped = CSS.escape(fieldId);
  const root = containerEl || document;
  return (
    root.querySelector(`[data-ai-id="${escaped}"]`) ||
    root.querySelector(`#${escaped}`) ||
    root.querySelector(`[name="${escaped}"]`)
  );
};

// fill a field through its own onChange via native events; false when not fillable
export const domFillField = (containerEl, fieldId, value) => {
  if (!containerEl || !fieldId) return false;

  const el = findAiFieldEl(containerEl, fieldId);
  if (!el) return false;
  if (el.getAttribute("data-ai-type") === "sign") return false;

  if (el.type === "radio") {
    // native click so react sees the full click and change cycle
    const escapedValue = CSS.escape(String(value));
    const escapedId = CSS.escape(fieldId);
    const groupName = el.getAttribute("name");
    const target =
      containerEl.querySelector(`input[type="radio"][data-ai-id="${escapedId}"][value="${escapedValue}"]`) ||
      (groupName
        ? containerEl.querySelector(`input[type="radio"][name="${CSS.escape(groupName)}"][value="${escapedValue}"]`)
        : null) ||
      containerEl.querySelector(`input[type="radio"][name="${escapedId}"][value="${escapedValue}"]`);
    if (!target) return false;
    // disabled inputs ignore clicks, so enable briefly
    const wasDisabled = target.disabled;
    if (wasDisabled) target.disabled = false;
    target.click();
    if (wasDisabled) target.disabled = true;
    return true;
  }

  if (el.type === "checkbox") {
    const checked = value === "true" || value === true;
    const nativeCheckedSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "checked")?.set;
    if (nativeCheckedSetter) nativeCheckedSetter.call(el, checked);
    else el.checked = checked;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  const proto =
    el.tagName === "SELECT"
      ? window.HTMLSelectElement.prototype
      : el.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
  const nativeValueSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (nativeValueSetter) nativeValueSetter.call(el, value);
  else el.value = value;
  // react listens at the root for bubbling input and change
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
};

// form fields in DOM order: { id, label, type, value, required, filled, isSignature, … }
export const discoverFormFields = (containerEl) => {
  if (!containerEl) return [];

  const results = [];
  const seen = new Set();

  for (const el of Array.from(containerEl.querySelectorAll(CANDIDATE_SELECTOR))) {
    const isAiMarker = el.hasAttribute("data-ai-type");
    const rawId = el.getAttribute("data-ai-id") || el.id || el.getAttribute("name");
    if (!rawId) continue;

    // skip markers nested inside another marker
    if (isAiMarker && el.parentElement?.closest("[data-ai-type]")) continue;

    // one entry per radio group
    const groupId = !isAiMarker && el.type === "radio" ? el.name : rawId;
    if (seen.has(groupId)) continue;
    seen.add(groupId);

    const label = getFieldLabel(el, containerEl, groupId);
    const type =
      el.getAttribute("data-ai-type") || (el.type === "radio" ? "radio" : el.type || el.tagName.toLowerCase());

    if (!isAiMarker && el.type === "radio") {
      results.push(readRadioGroup(el, containerEl, rawId, label));
      continue;
    }

    const { value, filled, isDefault } = readValueState(el, isAiMarker);
    const helpContext = getHelpContext(el, containerEl);
    const directEntry =
      el.type === "date" ||
      el.getAttribute("data-ai-has-suggestions") === "true" ||
      el.getAttribute("data-ai-type") === "places";
    const fieldMode = getFieldMode(el, isAiMarker, rawId, label, directEntry);
    const signText = (type === "sign" && el.getAttribute("data-ai-text")) || undefined;

    results.push({
      id: groupId,
      label,
      type,
      value,
      required: isRequiredElement(el),
      filled,
      isSignature: type === "sign",
      ...(isDefault && { isDefault: true }),
      ...(directEntry && { directEntry: true }),
      ...(fieldMode && { fieldMode }),
      ...(signText && { signText }),
      ...(helpContext && { helpContext }),
    });
  }

  return results;
};
