import {
  DEMO_PERSONA,
  DEMO_PERSONA_FIELD_ALIASES,
  DEMO_STEP_ACTIONS,
  DEMO_STEP_TIMEOUT_MS,
} from "./demo.constants";

// replace {{key}} and {{key.nested}} tokens
export const interpolate = (str, context) => {
  if (!str) return str ?? "";
  return String(str).replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const keys = path.trim().split(".");
    let val = context;
    for (const k of keys) val = val?.[k];
    return val != null ? String(val) : "";
  });
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const waitForElement = (selector, timeout = DEMO_STEP_TIMEOUT_MS) => {
  if (!selector || !selector.trim()) {
    return Promise.reject(new Error("Step is missing a required selector"));
  }
  return new Promise((resolve, reject) => {
    let existing;
    try {
      existing = document.querySelector(selector);
    } catch (e) {
      return reject(new Error(`Invalid selector: "${selector}" — ${e.message}`));
    }
    if (existing) return resolve(existing);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout (${timeout}ms) waiting for: ${selector}`));
    }, timeout);
  });
};

export const waitForElementGone = (selector, timeout) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(selector);
    if (!existing) return resolve();
    const observer = new MutationObserver(() => {
      if (!document.querySelector(selector)) {
        observer.disconnect();
        clearTimeout(timer);
        resolve();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout (${timeout}ms) waiting for element to disappear: ${selector}`));
    }, timeout);
  });

// set a value through the native setter so react sees the change
export const setReactValue = (el, value) => {
  const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (nativeSetter) {
    nativeSetter.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
};

export const fillPersonaFields = (persona = DEMO_PERSONA) => {
  document
    .querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='checkbox'])")
    .forEach((input) => {
      const hint = (input.id + " " + input.name + " " + input.placeholder).toLowerCase();
      for (const [key, aliases] of Object.entries(DEMO_PERSONA_FIELD_ALIASES)) {
        if (aliases.some((a) => hint.includes(a))) {
          setReactValue(input, persona[key] ?? "");
          break;
        }
      }
    });
};

// returns false when the action is not a verify action
export const runVerifyStep = (action, selector, contains) => {
  switch (action) {
    case DEMO_STEP_ACTIONS.VERIFY_EXISTS: {
      if (!document.querySelector(selector)) throw new Error(`Expected element not found: ${selector}`);
      return true;
    }
    case DEMO_STEP_ACTIONS.VERIFY_NOT_EXISTS: {
      if (document.querySelector(selector)) throw new Error(`Expected element to be absent: ${selector}`);
      return true;
    }
    case DEMO_STEP_ACTIONS.VERIFY_TEXT: {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Element not found: ${selector}`);
      if (!el.textContent.toLowerCase().includes(contains.toLowerCase())) {
        throw new Error(`Expected "${contains}" in text "${el.textContent.trim().slice(0, 80)}"`);
      }
      return true;
    }
    case DEMO_STEP_ACTIONS.VERIFY_URL: {
      if (!window.location.href.includes(contains)) {
        throw new Error(`URL "${window.location.href}" does not contain "${contains}"`);
      }
      return true;
    }
    case DEMO_STEP_ACTIONS.VERIFY_NOT_URL: {
      if (window.location.href.includes(contains)) throw new Error(`URL should not contain "${contains}"`);
      return true;
    }
    case DEMO_STEP_ACTIONS.VERIFY_VALUE: {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Element not found: ${selector}`);
      if (!(el.value ?? "").toLowerCase().includes(contains.toLowerCase())) {
        throw new Error(`Expected value "${contains}" in field`);
      }
      return true;
    }
    case DEMO_STEP_ACTIONS.VERIFY_ANY_FILLED: {
      const inputs = document.querySelectorAll("input, textarea");
      if (!Array.from(inputs).some((i) => i.value?.trim())) throw new Error("Expected at least one filled field");
      return true;
    }
    default:
      return false;
  }
};
