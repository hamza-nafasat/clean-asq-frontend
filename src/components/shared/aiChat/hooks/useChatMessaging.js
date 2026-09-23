import { useEffect } from "react";
import { AI_ASSISTANT_MODES } from "@/constants";
import { discoverFormFields } from "@/utils/discoverFormFields";
import {
  AI_ENDPOINTS,
  AI_RESPONSE_TYPES,
  CHAT_ROLES,
  getDefaultChatEndpoint,
} from "@/components/shared/aiChat/constants/aiChatConstants.js";
import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";
import { FORM_LANG_TO_BCP47 } from "@/components/shared/aiChat/constants/formLanguages.js";
import { createApplyToolCall } from "@/components/shared/aiChat/logic/applyToolCall.js";
import { buildSendHistory, requestChat } from "@/components/shared/aiChat/logic/chatRequest.js";
import { findFieldElement } from "@/components/shared/aiChat/logic/fieldValueUtils.js";
import { buildToolResultEntries, formatFormList } from "@/components/shared/aiChat/logic/formContextUtils.js";
import { getLanguageName } from "@/components/shared/aiChat/logic/widgetLanguage.js";
import { createSay } from "@/components/shared/aiChat/logic/translateMessage.js";
import { buildChatPayload } from "@/components/shared/aiChat/utils/buildChatPayload.js";

const DEFAULT_LANGUAGE_CODE = "en";
const NEXT_FIELD_DODGE_DELAY_MS = 150;

const buildFormLoadResult = (ctx, toolArgs) => {
  if (ctx?.currentState?.detailedForm) {
    const sectionCount = ctx.currentState.detailedForm.sections?.length ?? 0;
    return sectionCount > 0
      ? `Form details loaded. ${sectionCount} section(s) found — the complete section and field structure is now available in context.`
      : `Form loaded but no sections were found in context. This may be a temporary loading issue. Ask the user to try again, or call selectFormForEditing again with the same formId to retry.`;
  }
  const forms = ctx?.currentState?.forms || [];
  return `Error: Form with ID "${toolArgs.formId}" was not found — it may have been deleted or renamed. Available forms: ${formatFormList(forms) || "none"}. Please use a valid form ID from this list and retry.`;
};

// sending messages, continuing after tool calls, and running tool calls
const useChatMessaging = ({
  assistantMode,
  messages,
  input,
  setInput,
  isLoading,
  setIsLoading,
  addMessage,
  getScreenContext,
  formDataSignal,
  aiCustomPrompt,
  wt,
  speak,
  isVoiceModeRef,
  dodgeForField,
  syncConversationWithScreen,
  setTranslationMode,
  refs,
  toolBindings,
}) => {
  const { formLanguageRef, lastDetectedLanguageRef, translationModeRef, tooltipCacheRef, preferredLanguageRef } = refs;
  const { pendingFormContinuationRef } = refs;
  const isApplicant = assistantMode === AI_ASSISTANT_MODES.APPLICANT;

  const say = createSay({ addMessage, isVoiceModeRef, speak, preferredLanguageRef });

  // follow the language the AI detected in the user's message
  const applyDetectedLanguage = (detectedLanguage) => {
    if (!detectedLanguage) return;
    lastDetectedLanguageRef.current = detectedLanguage;
    const formLangCode = FORM_LANG_TO_BCP47[formLanguageRef.current] || DEFAULT_LANGUAGE_CODE;

    if (detectedLanguage === formLangCode) {
      if (translationModeRef.current) {
        translationModeRef.current = null;
        setTranslationMode(null);
      }
    } else if (translationModeRef.current && translationModeRef.current.lang !== detectedLanguage) {
      const newMode = { lang: detectedLanguage, langName: getLanguageName(detectedLanguage) };
      translationModeRef.current = newMode;
      setTranslationMode(newMode);
      tooltipCacheRef.current = {};
    }
  };

  // send a tool result back so the AI can chain its next step
  const continueAfterToolCall = async (
    toolName,
    toolArgs,
    resultSummary,
    currentHistory,
    chatEndpoint,
    ctx,
    suppressPlainTextResponse = false,
  ) => {
    const toolResultHistory = [...currentHistory, ...buildToolResultEntries(toolName, toolArgs, resultSummary)];
    try {
      const data = await requestChat(
        chatEndpoint,
        buildChatPayload({
          messages: toolResultHistory,
          ctx,
          assistantMode,
          preferredLanguage: preferredLanguageRef.current,
        }),
      );
      applyDetectedLanguage(data.detectedLanguage);
      if (data.type === AI_RESPONSE_TYPES.TOOL_CALL) {
        // drop tool calls meant for a screen that is gone
        if (getScreenContext()?.screenId !== ctx?.screenId) return;
        await applyToolCall(data.tool, data.args, toolResultHistory);
      } else if (!suppressPlainTextResponse) {
        await say(data.content || toolArgs.explanation);
        // dodge toward the next field the AI will address
        if (isApplicant && ctx?.currentState?.fields) {
          const nextField = ctx.currentState.fields.find((f) => !f.filled && !f.isSignature);
          const nextEl = nextField && findFieldElement(nextField.id);
          if (nextEl) setTimeout(() => dodgeForField(nextEl), NEXT_FIELD_DODGE_DELAY_MS);
        }
      }
    } catch {
      if (!suppressPlainTextResponse) await say(toolArgs.explanation);
    }
  };

  const applyToolCall = createApplyToolCall({ ...toolBindings, continueAfterToolCall });

  // continue the conversation once a selected form loads or fails
  useEffect(() => {
    if (!pendingFormContinuationRef.current) return;
    const { toolArgs, history } = pendingFormContinuationRef.current;
    pendingFormContinuationRef.current = null;

    const ctx = getScreenContext();
    const chatEndpoint = ctx?.aiEndpoint || AI_ENDPOINTS.BRANDING_CHAT;
    const continuationHistory = [
      ...history,
      ...buildToolResultEntries(AI_TOOLS.SELECT_FORM_FOR_EDITING, toolArgs, buildFormLoadResult(ctx, toolArgs)),
    ];

    const runContinuation = async () => {
      setIsLoading(true);
      try {
        const data = await requestChat(chatEndpoint, {
          messages: continuationHistory,
          context: {
            screenId: ctx.screenId,
            screenName: ctx.screenName,
            description: ctx.description,
            currentState: ctx.currentState,
            logos: ctx.logos,
            colorPalette: ctx?.colorPalette || undefined,
            customPrompt: aiCustomPrompt || undefined,
          },
        });
        if (data.type === AI_RESPONSE_TYPES.TOOL_CALL) {
          await applyToolCall(data.tool, data.args, continuationHistory);
        } else {
          await say(data.content);
        }
      } catch (err) {
        const detail = err?.message || "";
        await say(`${wt("formNotLoaded")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`);
      } finally {
        setIsLoading(false);
      }
    };

    runContinuation();
  }, [formDataSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (text, { silent = false } = {}) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;
    if (!silent) setInput("");

    // include a screen change the transcript has not acknowledged yet
    const syncMsg = await syncConversationWithScreen();

    const userMsg = { role: CHAT_ROLES.USER, content };
    if (!silent) addMessage(userMsg);
    setIsLoading(true);

    const ctx = getScreenContext();
    const chatEndpoint = ctx?.aiEndpoint || getDefaultChatEndpoint(assistantMode);
    const history = buildSendHistory([...messages, ...(syncMsg ? [syncMsg] : []), userMsg]);

    // applicant mode reads live field state from the DOM
    const liveFields = isApplicant && ctx?.formRef?.current ? discoverFormFields(ctx.formRef.current, { silent: true }) : null;
    const enrichedCurrentState = liveFields ? { ...ctx?.currentState, fields: liveFields } : ctx?.currentState;

    try {
      const data = await requestChat(
        chatEndpoint,
        buildChatPayload({
          messages: history,
          ctx,
          assistantMode,
          currentState: enrichedCurrentState,
          formLanguage: formLanguageRef.current,
          preferredLanguage: preferredLanguageRef.current,
        }),
      );
      applyDetectedLanguage(data.detectedLanguage);

      if (data.type === AI_RESPONSE_TYPES.TOOL_CALL) {
        await applyToolCall(data.tool, data.args, history);
      } else {
        await say(data.content);
      }
    } catch (error) {
      console.error("Send message error:", error);
      await say(`${wt("error")}${error.message ? `: ${error.message}` : ""}. ${wt("tryAgain")}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { continueAfterToolCall, sendMessage };
};

export default useChatMessaging;
