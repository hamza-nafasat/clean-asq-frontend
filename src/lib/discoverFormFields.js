/**
 * Fill a form field by finding it in the DOM and triggering its existing
 * React onChange handler via a native event — no per-form wiring needed.
 *
 * Works for: text inputs, date inputs, selects, textareas, checkboxes,
 * radio groups. Skips signature markers (data-ai-type="sign").
 *
 * @param {Element|null} containerEl
 * @param {string} fieldId  — id or name of the field to fill
 * @param {string} value    — value to set
 * @returns {boolean} true if an element was found and filled
 */
export const domFillField = (containerEl, fieldId, value) => {
  console.log(`%c[FILL] domFillField called — fieldId="${fieldId}" value="${value}"`, "color:#e05; font-weight:bold");
  console.trace("[FILL] call stack");
  if (!containerEl || !fieldId) return false;

  // Signature markers are never fillable
  const aiMarker = containerEl.querySelector(`[data-ai-id="${fieldId}"]`);
  if (aiMarker?.getAttribute("data-ai-type") === "sign") return false;

  // Locate the input — prefer id match, fall back to name
  const el =
    containerEl.querySelector(`#${CSS.escape(fieldId)}`) ||
    containerEl.querySelector(`[name="${CSS.escape(fieldId)}"]`);

  if (!el) return false;
  if (el.getAttribute("data-ai-type") === "sign") return false;

  if (el.type === "radio") {
    // Radio group: check the option whose value matches.
    // Use the browser's native click() so the full click→change cycle fires
    // and React's event delegation picks it up correctly (programmatic
    // `change` events alone are not reliably processed in React 19).
    const target = containerEl.querySelector(`input[name="${CSS.escape(fieldId)}"][value="${CSS.escape(value)}"]`);
    if (!target) return false;
    // In maxHelp mode all form inputs are disabled. Temporarily enable the
    // target radio so the click event fires and React's onChange handler runs.
    const wasDisabled = target.disabled;
    if (wasDisabled) target.disabled = false;
    target.click();
    if (wasDisabled) target.disabled = true;
    return true;
  }

  if (el.type === "checkbox") {
    const checked = value === "true" || value === true;
    const nativeCheckedSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "checked")?.set;
    nativeCheckedSetter ? nativeCheckedSetter.call(el, checked) : (el.checked = checked);
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  // Text, date, email, tel, textarea, select
  const proto =
    el.tagName === "SELECT"
      ? window.HTMLSelectElement.prototype
      : el.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
  const nativeValueSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  nativeValueSetter ? nativeValueSetter.call(el, value) : (el.value = value);
  // React 17+ listens at the root; bubbling input + change covers all cases
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
};

/**
 * Discover form fields from the DOM in visual (DOM/tab) order.
 *
 * Handles:
 *   - Standard inputs, selects, textareas
 *   - Radio groups (grouped by name; value = checked option's value)
 *   - Checkboxes (value = "true" / "false")
 *   - Custom/non-input elements marked with data-ai-type (e.g. signatures)
 *
 * To include a non-input element (e.g. a signature canvas) in discovery, add
 * these attributes to a wrapper element:
 *   data-ai-type="sign"
 *   data-ai-id="my-field-id"
 *   data-ai-label="Signature"
 *   data-ai-required="true"      (optional)
 *   data-ai-value="<current-url-or-value>"
 *
 * filled is determined solely by the field's current DOM value (el.value /
 * el.checked / data-ai-value). Browser autocomplete is excluded by ensuring
 * all inputs are rendered with autoComplete="off" — this function trusts that
 * the DOM value reflects only React-controlled state or confirmed user input.
 *
 * @param {Element|null} containerEl  The root element to search within.
 * @returns {{ id, label, type, value, required, filled, isSignature }[]}
 */
// Sensitive field name/label pattern — used to auto-detect fields that should
// never have their value passed through AI servers (SSN, passwords, etc.)
const SENSITIVE_FIELD_PATTERN =
  /\b(ssn|social[\s_\-.]?security|account[\s_\-.]?num(?:ber)?|routing|bank[\s_\-.]?acct?|account[\s_\-.]?no\b|pin\b|password)\b/i;

export const discoverFormFields = (containerEl, { silent = false } = {}) => {
  if (!containerEl) return [];
  if (!silent) {
    console.log("%c[DISCOVER] discoverFormFields called", "color:#07a; font-weight:bold");
    console.trace("[DISCOVER] call stack");
  }

  const results = [];
  const seen = new Set();

  const candidates = Array.from(
    containerEl.querySelectorAll(
      "[data-ai-type], " +
        "input:not([type='hidden']):not([type='submit']):not([type='button'])" +
        ":not([type='reset']):not([type='image']):not([type='file']), " +
        "textarea, select",
    ),
  );

  for (const el of candidates) {
    const isAiMarker = el.hasAttribute("data-ai-type");
    const rawId = el.getAttribute("data-ai-id") || el.id || el.getAttribute("name");
    if (!rawId) continue;

    // Skip AI marker elements that are nested inside another AI marker element.
    // This prevents double-discovery when a component (e.g. SignatureBox) renders
    // its own data-ai-type marker inside a parent wrapper that also has one.
    if (isAiMarker && el.parentElement?.closest("[data-ai-type]")) continue;

    // Radio groups: one entry per name, keyed by name
    const groupId = !isAiMarker && el.type === "radio" ? el.name : rawId;
    if (seen.has(groupId)) continue;
    seen.add(groupId);

    // ── Label ──────────────────────────────────────────────────────────────
    let label = el.getAttribute("data-ai-label") || "";
    if (!label && el.id) {
      const labelEl = containerEl.querySelector(`label[for="${el.id}"]`);
      if (labelEl) {
        label = labelEl.textContent.replace(/\s*[*:]+\s*$/, "").trim();
      }
    }
    if (!label) {
      label = el.getAttribute("aria-label") || groupId;
    }

    // ── Type ───────────────────────────────────────────────────────────────
    const type =
      el.getAttribute("data-ai-type") || (el.type === "radio" ? "radio" : el.type || el.tagName.toLowerCase());

    // ── Value + Filled ─────────────────────────────────────────────────────
    let value = "";
    let filled = false;
    let isDefault = false;
    if (isAiMarker) {
      value = el.getAttribute("data-ai-value") || "";
      filled = !!value;
    } else if (el.type === "radio") {
      const allRadios = Array.from(containerEl.querySelectorAll(`input[name="${el.name}"]`));
      const checked = allRadios.find((r) => r.checked);
      value = checked?.value || "";
      filled = !!value;
      // Collect option labels so the AI can present them as a/b/c choices
      const radioOptions = allRadios.map((radio) => {
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
      const required = el.hasAttribute("required") || el.getAttribute("data-ai-required") === "true";
      results.push({
        id: groupId,
        label,
        type: "radio",
        value,
        required,
        filled,
        isSignature: false,
        options: radioOptions,
      });
      continue;
    } else if (el.type === "checkbox") {
      value = el.checked ? "true" : "false";
      // Unchecked = not filled (the default state). Only a checked checkbox counts as
      // pre-filled so the review dialog doesn't surface every optional checkbox.
      filled = el.checked;
      // Track factory-default unchecked optional checkboxes so the AI skips them
      // silently. Required unchecked checkboxes still need explicit user action
      // (they'll surface in the Step 1 table with value "false" for the user to update).
      const _cbRequired = el.hasAttribute("required") || el.getAttribute("data-ai-required") === "true";
      if (!el.checked && !_cbRequired) isDefault = true;
    } else if (el.tagName === "SELECT" && el.closest?.(".PhoneInput")) {
      // PhoneInput country selector — always a component default (auto-set by the
      // library based on locale, never explicitly entered by the applicant).
      // Mark as default so the AI skips it silently in both Step 1 and Step 2.
      value = el.value || "";
      filled = false;
      isDefault = true;
    } else {
      value = el.value || "";
      // Phone fields: the country-code selector leaves "+1" (or similar) in the
      // input even when no real number has been entered. Require at least 7 digits
      // (the international minimum — e.g. Niue +683 XXXX) before marking filled.
      const isPhoneField =
        el.type === "tel" || /phone|mobile|cell/i.test(el.id || "") || /phone|mobile|cell/i.test(el.name || "");
      if (isPhoneField) {
        const digits = (value.match(/\d/g) || []).length;
        filled = digits >= 7;
      } else {
        filled = value.trim() !== "";
      }
    }

    // ── Required ───────────────────────────────────────────────────────────
    const required = el.hasAttribute("required") || el.getAttribute("data-ai-required") === "true";

    // ── AI Help context ─────────────────────────────────────────────────────
    // Walk up the DOM from this element to find a field wrapper that carries
    // data-ai-help-context (set by DynamicField sub-components when aiPrompt is configured).
    let helpContext;
    let ancestorEl = el.parentElement;
    while (ancestorEl && ancestorEl !== containerEl) {
      const ctx = ancestorEl.getAttribute("data-ai-help-context");
      if (ctx) {
        helpContext = ctx;
        break;
      }
      ancestorEl = ancestorEl.parentElement;
    }

    // ── Direct entry ────────────────────────────────────────────────────────
    // Fields where the applicant should type directly rather than dictate
    // through chat: native date pickers and fields with suggestion dropdowns.
    const directEntry =
      el.type === "date" ||
      el.getAttribute("data-ai-has-suggestions") === "true" ||
      el.getAttribute("data-ai-type") === "places";

    // ── Field Mode ───────────────────────────────────────────────────────────────
    // "secure" = sensitive data (SSN, password, account numbers) — value must never
    //            pass through AI servers; rendered via openFieldPanel in max help mode.
    // "direct" = native UI component (Google Places, date picker, suggestion dropdown)
    //            — better entered via real UI; opened via openFieldPanel in max help mode.
    const explicitFieldMode = el.getAttribute?.("data-ai-field-mode");
    let fieldMode;
    if (explicitFieldMode === "secure" || explicitFieldMode === "direct") {
      fieldMode = explicitFieldMode;
    } else if (
      !isAiMarker &&
      (el.type === "password" || SENSITIVE_FIELD_PATTERN.test(rawId || "") || SENSITIVE_FIELD_PATTERN.test(label || ""))
    ) {
      fieldMode = "secure";
    } else if (directEntry) {
      fieldMode = "direct";
    }

    // For signature markers, include the stripped attestation text if provided.
    const signText = (type === "sign" && el.getAttribute("data-ai-text")) || undefined;

    results.push({
      id: groupId,
      label,
      type,
      value,
      required,
      filled,
      isSignature: type === "sign",
      ...(isDefault && { isDefault: true }),
      ...(directEntry && { directEntry: true }),
      ...(fieldMode && { fieldMode }),
      ...(signText && { signText }),
      ...(helpContext && { helpContext }),
    });
  }

  if (!silent) {
    console.log(
      "%c[DISCOVER] fields found:",
      "color:#07a",
      results.map((f) => ({ id: f.id, label: f.label, value: f.value, filled: f.filled })),
    );
  }
  return results;
};
