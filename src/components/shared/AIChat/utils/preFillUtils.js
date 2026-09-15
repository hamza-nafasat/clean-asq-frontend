import { discoverFormFields } from "@/utils/discoverFormFields";

const LOADING_ATTRIBUTE = "data-ai-loading";

// live DOM fields when the screen has a form, else its registered list
export const getLiveFields = (ctx) =>
  ctx?.formRef?.current ? discoverFormFields(ctx.formRef.current, { silent: true }) : (ctx?.currentState?.fields ?? []);

// true while the field or any ancestor inside the container is loading
export const isFieldLoading = (containerEl, fieldId) => {
  if (!containerEl || !fieldId) return false;
  const el =
    containerEl.querySelector(`#${CSS.escape(fieldId)}`) ||
    containerEl.querySelector(`[name="${CSS.escape(fieldId)}"]`) ||
    containerEl.querySelector(`[data-ai-id="${CSS.escape(fieldId)}"]`);
  if (!el) return false;
  if (el.getAttribute(LOADING_ATTRIBUTE) === "true") return true;
  let p = el.parentElement;
  while (p && p !== containerEl) {
    if (p.getAttribute(LOADING_ATTRIBUTE) === "true") return true;
    p = p.parentElement;
  }
  return false;
};
