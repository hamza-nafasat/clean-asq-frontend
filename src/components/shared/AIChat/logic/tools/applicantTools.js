import { AI_ASSISTANT_MODES, FIELD_TYPES } from "@/constants";
import { findAiFieldEl } from "@/utils/discoverFormFields.js";
import { AI_FIELD_TYPES, CHAT_ROLES, FIELD_MODES } from "@/components/shared/AIChat/constants/aiChatConstants.js";
import { AI_TOOLS } from "@/components/shared/AIChat/constants/aiToolNames.js";
import { buildConfirmedBlock, withFields } from "@/components/shared/AIChat/logic/formContextUtils.js";
import {
  isPhoneFieldMeta,
  normalizeDateValue,
  normalizePhoneValue,
} from "@/components/shared/AIChat/logic/fieldValueUtils.js";
import { getErrorDetail } from "@/components/shared/AIChat/logic/toolHelpers.js";

const STEP_SETTLE_MS = 150;
const SIGNATURE_SAVE_TIMEOUT_MS = 12000;
const FIELD_FOCUS_DELAY_MS = 400;
const SIGNED_VALUE = "signed";
const OTP_FIELD_ID = "otp-field";
const EMAIL_FIELD_ID = "email-field";
const OTP_EMAIL_KEY = "_otp_email";
const FILL_SIGNATURE_EVENT = "ai:fill-signature";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// resolve once the signature box marks itself saved, or after the cap
const waitForSignatureSaved = (sigEl) =>
  new Promise((resolve) => {
    const timeout = setTimeout(resolve, SIGNATURE_SAVE_TIMEOUT_MS);
    const observer = new MutationObserver(() => {
      if (sigEl.getAttribute("data-ai-value") === SIGNED_VALUE) {
        clearTimeout(timeout);
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(sigEl, { attributes: true, attributeFilter: ["data-ai-value"] });
  });

const buildOptionsList = (fieldMeta) =>
  Array.isArray(fieldMeta.options) && fieldMeta.options.length
    ? fieldMeta.options.map((o, i) => `${String.fromCharCode(97 + i)}) ${o.label} [value: ${o.value}]`).join(", ")
    : "(no options available)";

const createApplicantTools = ({ bindings, helpers }) => {
  const { addMessage, wt, assistantMode, getScreenContext, continueAfterToolCall } = bindings;
  const { dodgeForField, activatedFieldIdRef, confirmedValuesRef, adePanelCallbackRef, setAdePanel } = bindings;
  const { scrollToBottom, inputRef, suppressChatFocusRef, translationModeRef, setTranslationMode, tooltipCacheRef } =
    bindings;
  const { say, reportCouldnt } = helpers;
  const isApplicant = assistantMode === AI_ASSISTANT_MODES.APPLICANT;

  // move a step, then continue on the same screen
  const changeStep = (actionName, resultSummary) => async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
    if (ctx.actions[actionName]) await ctx.actions[actionName]();
    await wait(STEP_SETTLE_MS);
    const freshCtx = getScreenContext();
    // navigation away is handled by the screen-change effect
    if (!freshCtx || freshCtx.screenId !== ctx.screenId) return;
    await continueAfterToolCall(tool, args, resultSummary(), currentHistory, chatEndpoint, freshCtx);
  };

  // focus the field once the scroll settles, unless the user moved on
  const focusActivatedField = (fieldId, el) => {
    const target = findAiFieldEl(document, fieldId) || el;
    if (!target) {
      suppressChatFocusRef.current = false;
      return;
    }
    target.scrollIntoView({ behavior: "instant", block: "center" });

    const active = document.activeElement;
    const alreadyOnTarget = active === target;
    const userMovedElsewhere =
      !alreadyOnTarget &&
      active &&
      active !== inputRef.current &&
      ["INPUT", "SELECT", "TEXTAREA"].includes(active.tagName);
    if (!alreadyOnTarget && !userMovedElsewhere) {
      target.focus();
      try {
        target.select();
      } catch {
        // not every field supports select
      }
    }

    dodgeForField(target);
    setTimeout(() => {
      suppressChatFocusRef.current = false;
    }, FIELD_FOCUS_DELAY_MS);
  };

  return {
    [AI_TOOLS.FILL_FIELD]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      const { fieldId } = args;
      const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
      let value = args.value;

      if (fieldMeta?.type === FIELD_TYPES.DATE && value) value = normalizeDateValue(value);
      if (isPhoneFieldMeta(fieldId, fieldMeta) && value) value = normalizePhoneValue(value, ctx.currentState?.fields || []);

      try {
        if (!ctx.actions.fillField) return;
        // dodge so the user sees the field being filled
        activatedFieldIdRef.current = fieldId;
        dodgeForField(findAiFieldEl(document, fieldId));
        await ctx.actions.fillField({ fieldId, value });
        if (value) confirmedValuesRef.current[fieldId] = value;
        // the screen has not re-rendered yet, so patch the field as filled
        const patchedCtx = withFields(
          ctx,
          ctx.currentState?.fields?.map((f) => (f.id === fieldId ? { ...f, value, filled: true } : f)) ?? [],
        );
        const fillResultMsg = isApplicant
          ? `[FILL_CONFIRMED] Field "${fieldId}" filled with "${value}". ` +
            `Do NOT apply Rule 3 (pre-filled confirmation) to this field. ` +
            `Call openFieldPanel for the next empty field after "${fieldId}" in list order immediately — pure tool call only, zero chat text.`
          : `Field "${fieldId}" filled with "${value}" successfully.`;
        await continueAfterToolCall(tool, args, fillResultMsg, currentHistory, chatEndpoint, patchedCtx);
      } catch (err) {
        reportCouldnt(err?.message || "");
      }
    },

    [AI_TOOLS.FILL_SIGNATURE]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      const { fieldId, name, explanation } = args;
      const sigEl = fieldId
        ? document.querySelector(`[data-ai-id="${CSS.escape(fieldId)}"]`)
        : document.querySelector('[data-ai-type="sign"]');
      if (!sigEl) {
        addMessage({ role: CHAT_ROLES.ASSISTANT, content: wt("errorCouldnt") + ". " + wt("tryAgain") });
        return;
      }
      // the signature box renders and saves the typed name
      sigEl.dispatchEvent(new CustomEvent(FILL_SIGNATURE_EVENT, { detail: { name }, bubbles: false }));
      say(explanation);
      if (sigEl.getAttribute("data-ai-value") !== SIGNED_VALUE) await waitForSignatureSaved(sigEl);

      const sigResultMsg = isApplicant
        ? `[FILL_CONFIRMED] You just recorded signature "${name}" in this exchange — the applicant provided this name moments ago. ` +
          `Do NOT apply Rule 3 (pre-filled confirmation) to the signature field. ` +
          `Move immediately to the next field after the signature in the list order. Do not go back to any previous field.`
        : `Typed signature "${name}" recorded on the signature field.`;
      const patchedCtx = withFields(
        ctx,
        ctx.currentState?.fields?.map((f) =>
          f.isSignature || f.id === fieldId ? { ...f, value: SIGNED_VALUE, filled: true } : f,
        ) ?? [],
      );
      await continueAfterToolCall(tool, args, sigResultMsg, currentHistory, chatEndpoint, patchedCtx);
    },

    [AI_TOOLS.OPEN_FIELD_PANEL]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      const { fieldId, explanation } = args;
      const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
      const fieldLabel = fieldMeta?.label || fieldId;
      const fieldMode = fieldMeta?.fieldMode || FIELD_MODES.DIRECT;

      // choice fields are answered in chat, so send the AI an error
      if (fieldMeta?.type === FIELD_TYPES.RADIO || fieldMeta?.type === FIELD_TYPES.SELECT) {
        await continueAfterToolCall(
          tool,
          args,
          `ERROR: openFieldPanel cannot be used for "${fieldLabel}" because it is a ${fieldMeta.type} field. ` +
            `You MUST output a chat message listing options instead and wait for the applicant's choice, then call fillField. ` +
            `Field options: ${buildOptionsList(fieldMeta)}. Do NOT call openFieldPanel again for this field.`,
          currentHistory,
          chatEndpoint,
          ctx,
        );
        return;
      }

      if (explanation) say(explanation);

      adePanelCallbackRef.current = { args, history: currentHistory, ctx };
      setTimeout(() => scrollToBottom(), 100);

      const targetEl = findAiFieldEl(document, fieldId);
      if (targetEl) setTimeout(() => dodgeForField(targetEl), 200);

      setAdePanel({ fieldId, fieldLabel, fieldMode, required: fieldMeta?.required ?? true });
    },

    [AI_TOOLS.SCROLL_TO_FIELD]: async (args, { ctx }) => {
      const { fieldId, explanation } = args;
      if (ctx.actions?.scrollToField) {
        ctx.actions.scrollToField({ fieldId });
      } else {
        const el = findAiFieldEl(document, fieldId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // focus once the scroll settles
      setTimeout(() => {
        const el = findAiFieldEl(document, fieldId);
        if (!el || el.getAttribute("data-ai-type") === AI_FIELD_TYPES.SIGN || el.type === "hidden") return;
        if (el.type === FIELD_TYPES.RADIO) {
          const first = document.querySelector(
            `input[type="radio"][name="${CSS.escape(el.getAttribute("name") || "")}"]`,
          );
          if (first) first.focus();
        } else {
          el.focus();
        }
      }, FIELD_FOCUS_DELAY_MS);
      if (explanation) say(explanation);
    },

    [AI_TOOLS.ACTIVATE_FIELD]: async (args) => {
      const { fieldId, explanation } = args;
      const el = findAiFieldEl(document, fieldId);
      activatedFieldIdRef.current = fieldId;
      // keep the chat input from stealing focus
      suppressChatFocusRef.current = true;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => focusActivatedField(fieldId, el), FIELD_FOCUS_DELAY_MS);
      }
      say(explanation);
    },

    [AI_TOOLS.SUBMIT_OTP_CODE]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      const { otp, email } = args;
      if (ctx.actions.fillField) ctx.actions.fillField({ fieldId: OTP_FIELD_ID, value: otp });
      let resultSummary;
      try {
        if (ctx.actions.verifyOtpCode) await ctx.actions.verifyOtpCode({ otp, email });
        resultSummary = "OTP verification succeeded. The applicant's email is now verified.";
        // later pages match the verified email by value
        if (email) confirmedValuesRef.current[OTP_EMAIL_KEY] = email;
      } catch (error) {
        console.error("Verify OTP error:", error);
        const detail = getErrorDetail(error);
        resultSummary = `OTP verification failed${detail ? `: ${detail}` : ""}. Ask the applicant whether they entered the code correctly and invite them to try again.`;
      }
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
    },

    [AI_TOOLS.SUBMIT_EMAIL_FOR_OTP]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      const { email } = args;
      if (ctx.actions.fillField) ctx.actions.fillField({ fieldId: EMAIL_FIELD_ID, value: email });
      let resultSummary;
      try {
        if (ctx.actions.sendOtpForEmail) await ctx.actions.sendOtpForEmail({ email });
        resultSummary = `OTP email sent successfully to ${email}. Tell the applicant to check their inbox and spam folder, then come back and provide the code.`;
      } catch (error) {
        console.error("Send OTP error:", error);
        const detail = getErrorDetail(error);
        resultSummary = `Failed to send OTP email to ${email}${detail ? `: ${detail}` : ""}. Let the applicant know and ask them to check the email address or try again.`;
      }
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
    },

    [AI_TOOLS.GO_TO_NEXT_STEP]: changeStep(
      AI_TOOLS.GO_TO_NEXT_STEP,
      () => `Moved to the next step successfully.${buildConfirmedBlock(confirmedValuesRef.current)}`,
    ),

    [AI_TOOLS.GO_TO_PREV_STEP]: changeStep(AI_TOOLS.GO_TO_PREV_STEP, () => "Moved to the previous step successfully."),

    [AI_TOOLS.ENTER_TRANSLATION_MODE]: async (args) => {
      const { language, languageName, explanation } = args;
      const mode = { lang: language, langName: languageName };
      translationModeRef.current = mode;
      setTranslationMode(mode);
      // drop translations cached for the previous language
      tooltipCacheRef.current = {};
      addMessage({ role: CHAT_ROLES.ASSISTANT, content: explanation || "" });
    },
  };
};

export default createApplicantTools;
