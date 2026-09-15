import {
  DEMO_PERSONA,
  DEMO_STEP_ACTIONS,
  DEMO_STEP_RESULTS,
  DEMO_WAIT_FOR_GONE_TIMEOUT_MS,
} from "./demo.constants";
import {
  fillPersonaFields,
  interpolate,
  runVerifyStep,
  setReactValue,
  sleep,
  waitForElement,
  waitForElementGone,
} from "./demo.utils2";

// run one step against the live dom
const executeStep = async (step, context) => {
  const action = step.action;
  const selector = interpolate(step.selector, context);
  const value = interpolate(step.value, context);
  const contains = interpolate(step.contains, context);

  switch (action) {
    case DEMO_STEP_ACTIONS.NAVIGATE: {
      const dest = interpolate(step.value, context);
      if (dest.startsWith("http")) window.location.href = dest;
      else context.navigate?.(dest);
      await sleep(800);
      break;
    }
    case DEMO_STEP_ACTIONS.RELOAD:
      window.location.reload();
      await sleep(1500);
      break;
    case DEMO_STEP_ACTIONS.WAIT_FOR:
      await waitForElement(selector);
      break;
    case DEMO_STEP_ACTIONS.WAIT_FOR_GONE: {
      const goneTimeout = parseInt(value, 10) || DEMO_WAIT_FOR_GONE_TIMEOUT_MS;
      if (!selector || !selector.trim()) break;
      await waitForElementGone(selector, goneTimeout);
      break;
    }
    case DEMO_STEP_ACTIONS.WAIT_MS:
      await sleep(parseInt(value, 10) || 500);
      break;
    case DEMO_STEP_ACTIONS.FILL: {
      const el = await waitForElement(selector);
      el.focus();
      setReactValue(el, value);
      el.blur();
      break;
    }
    case DEMO_STEP_ACTIONS.FILL_PERSONA_FIELDS:
      fillPersonaFields(context.persona ?? DEMO_PERSONA);
      break;
    case DEMO_STEP_ACTIONS.CLICK: {
      const el = await waitForElement(selector);
      el.click();
      break;
    }
    case DEMO_STEP_ACTIONS.CLICK_IF_EXISTS:
      document.querySelector(selector)?.click();
      break;
    case DEMO_STEP_ACTIONS.CLICK_TEXT: {
      const candidates = document.querySelectorAll(selector || "*");
      const match = Array.from(candidates).find((el) =>
        el.textContent.trim().toLowerCase().includes(value.toLowerCase()),
      );
      if (!match) throw new Error(`No element matching "${selector}" with text "${value}"`);
      match.click();
      break;
    }
    case DEMO_STEP_ACTIONS.BLUR:
      document.querySelector(selector)?.blur();
      break;
    case DEMO_STEP_ACTIONS.SELECT: {
      const el = await waitForElement(selector);
      el.value = value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
      break;
    }
    case DEMO_STEP_ACTIONS.SCROLL_TO: {
      const el = await waitForElement(selector);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      await sleep(400);
      break;
    }
    case DEMO_STEP_ACTIONS.SCROLL_TO_BOTTOM:
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      await sleep(400);
      break;
    case DEMO_STEP_ACTIONS.CLEAR_SESSION_STORAGE:
      if (step.key) sessionStorage.removeItem(step.key);
      break;
    default:
      // unknown actions are skipped
      runVerifyStep(action, selector, contains);
  }
};

export const runDemoSteps = async (steps, opts = {}) => {
  const { navigate, persona, paramOverrides = {}, onStepStart, onStepComplete, onStepError } = opts;

  const context = {
    navigate,
    persona: persona ?? DEMO_PERSONA,
    ...paramOverrides,
    "persona.data": persona ?? DEMO_PERSONA,
    companyName: paramOverrides.companyName ?? DEMO_PERSONA.companyName,
  };

  const results = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    onStepStart?.(i, step);
    try {
      await executeStep(step, context);
      results.push({ index: i, status: DEMO_STEP_RESULTS.PASS, step });
      onStepComplete?.(i, step);
    } catch (err) {
      results.push({ index: i, status: DEMO_STEP_RESULTS.FAIL, error: err.message, step });
      onStepError?.(i, step, err);
      // stop on critical failure
      if (step.critical !== false) break;
    }
  }

  return results;
};
