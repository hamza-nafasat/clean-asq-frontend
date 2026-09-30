import { FIELD_TYPES } from "@/constants";
import { findAiFieldEl } from "@/utils/discoverFormFields.js";
import { AI_FIELD_TYPES, FIELD_MODES } from "@/components/shared/aiChat/utils/aiChat.constants.js";
import { AI_TOOLS } from "@/components/shared/aiChat/utils/aiChat.toolNames.constants.js";

const FIELD_FOCUS_DELAY_MS = 400;

const buildOptionsList = (fieldMeta) =>
  Array.isArray(fieldMeta.options) && fieldMeta.options.length
    ? fieldMeta.options.map((o, i) => `${String.fromCharCode(97 + i)}) ${o.label} [value: ${o.value}]`).join(", ")
    : "(no options available)";

// built from trusted field data only, translated via wt()
const buildScrollGuidanceMessage = (ctx, fieldId, wt) => {
  const fields = ctx.currentState?.fields || [];
  const targetField = fields.find((f) => f.id === fieldId);
  const fieldLabel = targetField?.label || "this field";
  const isChoice = targetField?.type === FIELD_TYPES.RADIO || targetField?.type === FIELD_TYPES.SELECT;
  const guidanceKey = targetField?.isSignature ? "fillGuidanceSign" : isChoice ? "fillGuidanceSelect" : "fillGuidanceEnter";
  const optionsList =
    isChoice && Array.isArray(targetField?.options) && targetField.options.length
      ? `\n\n${wt("optionsLabel")}: ${targetField.options.map((o) => o.label).join(", ")}.`
      : "";
  const stillMissing = fields.filter((f) => f.required && !f.filled).map((f) => f.label);
  const missingList = stillMissing.length > 1 ? `\n\n${wt("stillMissing", stillMissing.join(", "))}` : "";
  return `${wt(guidanceKey, fieldLabel)}${optionsList}${missingList}`;
};

const createApplicantTools = ({ bindings, helpers }) => {
  const { continueAfterToolCall, wt } = bindings;
  const { dodgeForField, adePanelCallbackRef, setAdePanel } = bindings;
  const { scrollToBottom, translationModeRef, setTranslationMode, tooltipCacheRef } = bindings;
  const { say } = helpers;

  return {
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
            `You MUST call scrollToField with an explanation listing the options and asking the applicant to choose one themselves. ` +
            `Field options: ${buildOptionsList(fieldMeta)}. Do NOT call openFieldPanel again for this field.`,
          currentHistory,
          chatEndpoint,
          ctx,
        );
        return;
      }

      // panel is sensitive-fields only
      if (fieldMode !== FIELD_MODES.SECURE) {
        await continueAfterToolCall(
          tool,
          args,
          `ERROR: openFieldPanel cannot be used for "${fieldLabel}" because it is not a sensitive field. ` +
            `You MUST call scrollToField with an explanation of what to enter instead, then wait for the applicant to say next. ` +
            `Do NOT call openFieldPanel again for this field.`,
          currentHistory,
          chatEndpoint,
          ctx,
        );
        return;
      }

      if (explanation) say(wt("securePanelHint", fieldLabel));

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
      // ignore the AI's own wording here
      if (explanation) say(buildScrollGuidanceMessage(ctx, fieldId, wt));
    },

    [AI_TOOLS.ENTER_TRANSLATION_MODE]: async (args) => {
      const { language, languageName, explanation } = args;
      const mode = { lang: language, langName: languageName };
      translationModeRef.current = mode;
      setTranslationMode(mode);
      // drop translations cached for the previous language
      tooltipCacheRef.current = {};
      say(explanation || "");
    },
  };
};

export default createApplicantTools;
