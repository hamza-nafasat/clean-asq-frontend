/**
 * demoStepExecutor.js
 *
 * Runs the same { action, selector, value, contains, message, critical, key }
 * step schema used by the backend Puppeteer test runner, but executes directly
 * in the live browser DOM — no headless browser needed.
 *
 * Used by DemoFloatingPanel to perform live UI actions during a demo presentation,
 * and by the Builder tab's "Preview" button to test a sequence before saving.
 */

const STEP_TIMEOUT = 10_000; // ms to wait for an element before failing

// ── Default demo persona ──────────────────────────────────────────────────────
// Used for fill-persona-fields and as {{persona.*}} template values.
export const DEMO_PERSONA = {
  firstName:   "Alex",
  lastName:    "Morgan",
  email:       "alex.morgan@acmefinancial.com",
  phone:       "555-867-5309",
  address:     "1200 Commerce Blvd",
  city:        "Nashville",
  zip:         "37201",
  company:     "Acme Financial",
  companyName: "Acme Financial",
};

// ── Interpolation ─────────────────────────────────────────────────────────────
// Replace {{key}} and {{key.nested}} patterns in step value/selector strings.
function interpolate(str, context) {
  if (!str) return str ?? "";
  return String(str).replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const keys = path.trim().split(".");
    let val = context;
    for (const k of keys) val = val?.[k];
    return val != null ? String(val) : "";
  });
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for an element matching `selector` to appear in the DOM.
 * Returns the element or rejects after STEP_TIMEOUT ms.
 */
function waitForElement(selector, timeout = STEP_TIMEOUT) {
  if (!selector || !selector.trim()) {
    return Promise.reject(new Error("Step is missing a required selector"));
  }
  return new Promise((resolve, reject) => {
    let existing;
    try { existing = document.querySelector(selector); }
    catch (e) { return reject(new Error(`Invalid selector: "${selector}" — ${e.message}`)); }
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
}

/**
 * Set an input/textarea value in a way that React's synthetic event system
 * recognises — bypassing React's own value tracking via native setter.
 */
function setReactValue(el, value) {
  const proto =
    el.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (nativeSetter) {
    nativeSetter.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event("input",  { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

// ── Single step executor ──────────────────────────────────────────────────────

async function executeStep(step, context) {
  const action   = step.action;
  const selector = interpolate(step.selector,  context);
  const value    = interpolate(step.value,     context);
  const contains = interpolate(step.contains,  context);

  switch (action) {
    // ── Navigation ──────────────────────────────────────────────────────────
    case "navigate": {
      const dest = interpolate(step.value, context);
      if (dest.startsWith("http")) {
        window.location.href = dest;
      } else {
        // Use react-router navigate passed in via context
        context.navigate?.(dest);
      }
      // Allow React to re-render after navigation
      await sleep(800);
      break;
    }

    case "reload":
      window.location.reload();
      await sleep(1500);
      break;

    // ── Waiting ──────────────────────────────────────────────────────────────
    case "wait-for":
      await waitForElement(selector);
      break;

    case "wait-for-gone": {
      // Wait for an element to disappear from the DOM (e.g. ai-thinking indicator).
      // Uses a longer default timeout since AI responses can take several seconds.
      const goneTimeout = parseInt(value, 10) || 30_000;
      if (!selector || !selector.trim()) break; // nothing to wait on
      await new Promise((resolve, reject) => {
        const existing = document.querySelector(selector);
        if (!existing) return resolve(); // already gone
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
          reject(new Error(`Timeout (${goneTimeout}ms) waiting for element to disappear: ${selector}`));
        }, goneTimeout);
      });
      break;
    }

    case "wait-ms":
      await sleep(parseInt(value, 10) || 500);
      break;

    // ── Input ────────────────────────────────────────────────────────────────
    case "fill": {
      const el = await waitForElement(selector);
      el.focus();
      setReactValue(el, value);
      el.blur();
      break;
    }

    case "fill-persona-fields": {
      // Map of field aliases → persona key
      const FIELD_MAP = {
        firstName:   ["firstname", "first-name", "first_name", "givenname", "fname"],
        lastName:    ["lastname",  "last-name",  "last_name",  "surname",   "lname"],
        email:       ["email"],
        phone:       ["phone", "mobile", "tel", "telephone"],
        address:     ["address", "street", "addr"],
        city:        ["city", "town"],
        zip:         ["zip", "postal", "postcode", "zipcode"],
        company:     ["company", "organization", "organisation", "employer"],
        companyName: ["companyname", "company-name", "company_name"],
      };
      const persona = context.persona ?? DEMO_PERSONA;
      document
        .querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='checkbox'])")
        .forEach((input) => {
          const hint = (input.id + " " + input.name + " " + input.placeholder).toLowerCase();
          for (const [key, aliases] of Object.entries(FIELD_MAP)) {
            if (aliases.some((a) => hint.includes(a))) {
              setReactValue(input, persona[key] ?? "");
              break;
            }
          }
        });
      break;
    }

    // ── Click ────────────────────────────────────────────────────────────────
    case "click": {
      const el = await waitForElement(selector);
      el.click();
      break;
    }

    case "click-if-exists": {
      const el = document.querySelector(selector);
      if (el) el.click();
      break;
    }

    case "click-text": {
      const candidates = document.querySelectorAll(selector || "*");
      const match = Array.from(candidates).find((el) =>
        el.textContent.trim().toLowerCase().includes(value.toLowerCase())
      );
      if (!match) throw new Error(`No element matching "${selector}" with text "${value}"`);
      match.click();
      break;
    }

    // ── Form controls ────────────────────────────────────────────────────────
    case "blur": {
      const el = document.querySelector(selector);
      el?.blur();
      break;
    }

    case "select": {
      const el = await waitForElement(selector);
      el.value = value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
      break;
    }

    // ── Scroll ───────────────────────────────────────────────────────────────
    case "scroll-to": {
      const el = await waitForElement(selector);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      await sleep(400);
      break;
    }

    case "scroll-to-bottom":
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      await sleep(400);
      break;

    // ── Storage ──────────────────────────────────────────────────────────────
    case "clear-session-storage":
      if (step.key) sessionStorage.removeItem(step.key);
      break;

    // ── Verification (soft in demo mode — throws so caller can mark step fail,
    //                  but outer runner respects critical:false) ───────────────
    case "verify-exists": {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Expected element not found: ${selector}`);
      break;
    }

    case "verify-not-exists": {
      const el = document.querySelector(selector);
      if (el) throw new Error(`Expected element to be absent: ${selector}`);
      break;
    }

    case "verify-text": {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Element not found: ${selector}`);
      if (!el.textContent.toLowerCase().includes(contains.toLowerCase())) {
        throw new Error(`Expected "${contains}" in text "${el.textContent.trim().slice(0, 80)}"`);
      }
      break;
    }

    case "verify-url": {
      if (!window.location.href.includes(contains)) {
        throw new Error(`URL "${window.location.href}" does not contain "${contains}"`);
      }
      break;
    }

    case "verify-not-url": {
      if (window.location.href.includes(contains)) {
        throw new Error(`URL should not contain "${contains}"`);
      }
      break;
    }

    case "verify-value": {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Element not found: ${selector}`);
      if (!(el.value ?? "").toLowerCase().includes(contains.toLowerCase())) {
        throw new Error(`Expected value "${contains}" in field`);
      }
      break;
    }

    case "verify-any-filled": {
      const inputs = document.querySelectorAll("input, textarea");
      const anyFilled = Array.from(inputs).some((i) => i.value?.trim());
      if (!anyFilled) throw new Error("Expected at least one filled field");
      break;
    }

    default:
      console.warn(`[DemoExecutor] Unknown action: "${action}" — skipping`);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run an array of demo action steps in the live browser.
 *
 * @param {Array}    steps          - Array of { action, selector, value, contains, message, critical, key }
 * @param {object}   opts
 * @param {Function} opts.navigate        - React Router navigate() function
 * @param {object}   opts.persona         - Override DEMO_PERSONA for fill-persona-fields
 * @param {object}   opts.paramOverrides  - { varName: value } substituted into {{varName}} tokens
 * @param {Function} opts.onStepStart     - (index, step) => void
 * @param {Function} opts.onStepComplete  - (index, step) => void
 * @param {Function} opts.onStepError     - (index, step, error) => void
 *
 * @returns {Promise<Array>} Array of { index, status: "pass"|"fail", step, error? }
 */
export async function runDemoSteps(steps, opts = {}) {
  const { navigate, persona, paramOverrides = {}, onStepStart, onStepComplete, onStepError } = opts;

  // Merge paramOverrides into the interpolation context so {{varName}} tokens work
  const context = {
    navigate,
    persona: persona ?? DEMO_PERSONA,
    ...paramOverrides,
    // Also nest under common paths tests use
    "persona.data": persona ?? DEMO_PERSONA,
    companyName: paramOverrides.companyName ?? DEMO_PERSONA.companyName,
  };

  const results = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    onStepStart?.(i, step);
    try {
      await executeStep(step, context);
      results.push({ index: i, status: "pass", step });
      onStepComplete?.(i, step);
    } catch (err) {
      results.push({ index: i, status: "fail", error: err.message, step });
      onStepError?.(i, step, err);
      // Stop on critical failure (default: true)
      if (step.critical !== false) break;
    }
  }

  return results;
}
