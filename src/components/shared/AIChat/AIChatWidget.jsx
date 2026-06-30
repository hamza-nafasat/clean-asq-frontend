import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useBranding } from "../../../hooks/BrandingContext";
import { checkFieldForErrors } from "../../../lib/checkFieldForErrors";
import { discoverFormFields } from "../../../lib/discoverFormFields";
import { UseAIChat } from "@/context/AiChatContext";
import { buildChatPayload } from "./utils/buildChatPayload.js";
import { mapVisibleToApiMessage } from "./utils/mapVisibleToApiMessage.js";
import { resolveNavigationHandoff } from "./utils/resolveNavigationHandoff.js";
import {
  AI_CHAT_MODE,
  contrastingIconColor,
  PAGE_LABELS,
  PAGE_ROUTES,
  PANEL_HEIGHT,
  PANEL_MIN_HEIGHT,
  PANEL_MIN_WIDTH,
  PANEL_WIDTH,
  SERVER_URL,
} from "./constants/aiChatConstants.js";
import { useAiVoice } from "./hooks/useAiVoice.js";
import { WIDGET_STRINGS } from "./constants/widgetStrings.js";
import { LANGUAGES } from "./constants/languages.js";
import { createApplyToolCall } from "./logic/applyToolCall.js";
import { shouldClientNavigateFromMessage } from "./logic/navigationIntent.js";
import ChatFab from "./components/ChatFab.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import ChatOverlays from "./components/ChatOverlays.jsx";

// Maps page IDs (from the backend navigateToPage tool) to frontend routes.

// Maps page IDs (from the backend navigateToPage tool) to frontend routes.
// Add new entries here when a new navigable page is added to navigationTool.js.
// PAGE_ROUTES and PAGE_LABELS live in constants/aiChatConstants.js

// Returns "#000000" or "#ffffff" — whichever contrasts more against the given hex background.
// contrastingIconColor is imported from constants/aiChatConstants.js

export default function AIChatWidget() {
  const {
    isOpen,
    setIsOpen: _setIsOpen,
    messages,
    addMessage,
    isLoading,
    setIsLoading,
    getScreenContext,
    currentScreenId,
    formDataSignal,
    widgetResetSignal,
    fieldChangeSignal,
    pushRevertable,
    popRevertable,
    signalContinuationPending,
    triggerAutoMessage: _triggerAutoMessage,
    autoMessageSignal,
    pendingAutoMessageRef,
    assistantMode,
    getApiHistory,
    appendApiHistory,
    setApiHistory,
    setPendingHandoffHistory,
    setOverlayContext,
  } = UseAIChat();
  // Logging wrapper — every setIsOpen call is traced so we can see who's opening the widget.
  const setIsOpen = useCallback(
    (val) => {
      console.log(
        `%c[WIDGET-OPEN] setIsOpen(${val}) — assistantMode=${assistantMode} messages=${messages.length} sessionClosed=${sessionStorage.getItem("ai-widget-user-closed")}`,
        val ? "color:#16a34a; font-weight:bold" : "color:#dc2626; font-weight:bold",
      );
      console.trace("[WIDGET-OPEN] caller stack");
      _setIsOpen(val);
    },
    [_setIsOpen, assistantMode, messages.length],
  );
  const { user } = useSelector((s) => s.auth);
  const {
    accentColor,
    secondaryColor,
    buttonTextSecondary,
    textColor,
    fontFamily,
    aiVoice,
    aiCustomPrompt,
    aiLaunchButtonColor,
    aiHeaderColor,
    aiBannerColor,
    aiBannerTextColor,
    primaryColor,
    buttonTextPrimary,
    aiUseCustomIcon,
  } = useBranding();

  const effectiveLaunchColor = aiLaunchButtonColor || accentColor;
  const effectiveHeaderColor = aiHeaderColor || accentColor;
  const effectiveBannerColor = aiBannerColor || secondaryColor;
  const effectiveBannerText = aiBannerTextColor || buttonTextSecondary;

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const fabIconColor = contrastingIconColor(effectiveLaunchColor);
  const headerIconColor = contrastingIconColor(effectiveHeaderColor);
  const [input, setInput] = useState("");
  const voice = aiVoice || "nova";
  const sendMessageRef = useRef(null);
  const {
    isListening,
    isSpeaking,
    isVoiceMode,
    isVoiceModeRef,
    isSpeakingRef,
    pendingListenRef,
    lastAIPlainTextRef,
    justFinishedSpeakingRef,
    onSpeakEndRef,
    startPushToTalk,
    stopListening,
    stopSpeaking,
    speak,
    toggleVoiceMode,
    setIsVoiceMode,
  } = useAiVoice({ assistantMode, voice, sendMessageRef });
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  // Set to true by activateField so the post-response auto-focus doesn't steal focus
  // back from the form field. Cleared when the user next interacts with the chat input.
  const suppressChatFocusRef = useRef(false);
  // Set to true when the user explicitly focuses the chat textarea. Cleared when the user
  // moves focus to a real element outside the chat panel (intentional departure).
  // Ensures focus returns to the textarea after loading completes even when
  // suppressChatFocusRef is set (e.g. stale flag from a prior activateField call).
  const userFocusedChatRef = useRef(false);
  // null when inactive; { lang: "es", langName: "Spanish" } when the applicant has activated translation mode.
  const [translationMode, setTranslationMode] = useState(null);
  const translationModeRef = useRef(null);
  // Hover-translation tooltip: { text, x, y } or null
  const [translationTooltip, setTranslationTooltip] = useState(null);
  const tooltipCacheRef = useRef({}); // label text → translated string
  const tooltipTimerRef = useRef(null); // debounce timer
  const tooltipTargetRef = useRef(null); // currently hovered label element
  // Detected language of the form (BCP-47 name, e.g. "Spanish"). Set on first open.
  const formLanguageRef = useRef("English");
  // Set to true when the screen-change handler sends [FIELD_FOCUS] for the initial field directly
  // (bypassing the 1000ms pause timer). The pause timer checks this and skips to avoid duplicates.
  const suppressNextFocusGuidanceRef = useRef(false);
  // Help-level slider: 0 = off, 1–100 = scales delay from 10 s (less help) to 2 s (more help).
  // Default 50 = 5-second pause before guidance fires.
  // Tracks elements we disabled in applicant mode so we can re-enable them on page change.
  const maxHelpDisabledElsRef = useRef([]);
  const maxHelpDisabledSignsRef = useRef([]); // [data-ai-type="sign"] wrappers blocked via pointer-events
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerFading, setBannerFading] = useState(false);
  // Stores the most recent field-focus timer callback so onInputChange can reset the timer
  // when the user types (ensuring the pause window resets on each keystroke).
  const fieldTimerCallbackRef = useRef(null);
  const panelRef = useRef(null);
  // Panel dodge: saved position before moving out of the way of a field.
  // null means the panel is at its normal (user-chosen) position.
  const homePositionRef = useRef(null);
  // The fieldId of the field most recently activated/filled, so we know when to restore.
  const activatedFieldIdRef = useRef(null);
  // Set to true on each screen change so the FIRST dodgeForField call extends the avoid-zone
  // to also cover the form's display text (from form container top down to the focused field).
  const isInitialScreenDodgeRef = useRef(false);

  // Measure the real header height so button and panel sit flush below it.
  // Re-runs on every route change (pathname) so the button stays centered on
  // the header/body dividing line even when the header shifts between pages.
  const [headerBottom, setHeaderBottom] = useState(() => {
    const header = document.querySelector(".bg-header");
    return header ? header.getBoundingClientRect().bottom : 80;
  });
  useLayoutEffect(() => {
    const update = () => {
      const header = document.querySelector(".bg-header");
      if (header) setHeaderBottom(header.getBoundingClientRect().bottom);
    };
    update();
    const header = document.querySelector(".bg-header");
    if (!header) return;
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, [pathname]);

  // Draggable position — updated when the panel opens to sit below the measured header
  const [position, setPosition] = useState({
    top: 80,
    left: Math.max(0, window.innerWidth - PANEL_WIDTH - 24),
  });
  const [panelWidth, setPanelWidth] = useState(PANEL_WIDTH);
  const [panelHeight, setPanelHeight] = useState(PANEL_HEIGHT);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 });
  const resizeRef = useRef({
    isResizing: false,
    edge: "",
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
    startLeft: 0,
    startTop: 0,
  });
  // Tracks the TARGET panel position/size — updated synchronously whenever we move the panel.
  // Used in dodgeForField instead of getBoundingClientRect() so we always check against the
  // intended final position, not the mid-animation visual position.
  const panelTargetRef = useRef({
    top: 80,
    left: Math.max(0, window.innerWidth - PANEL_WIDTH - 24),
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
  });

  // Refs kept current every render — safe to read inside callbacks/effects
  const isLoadingRef = useRef(false);
  const autoGuideRef = useRef(null);
  // Tracks the most recent [FIELD_FOCUS] that arrived while the AI was busy.
  // Processed immediately after the current request finishes, ensuring the bot
  // always catches up to wherever the user currently is.
  const pendingFieldFocusRef = useRef(null);
  // Incremented whenever a new [FIELD_FOCUS] request starts (or is queued as pending).
  // Lets an in-flight request detect it has been superseded and skip displaying its response.
  const fieldFocusGenerationRef = useRef(0);
  // AbortController for the currently in-flight autoGuide fetch.
  // Aborted immediately when the user moves to a new field.
  const autoGuideAbortRef = useRef(null);
  const pendingAnalysisRef = useRef(null);
  const pendingFormContinuationRef = useRef(null); // stores { toolArgs, history } while waiting for form data to load
  const pendingFollowUpRef = useRef(null); // task auto-sent after AI-triggered navigation
  const pendingHandoffModeRef = useRef(null); // greeting | task — controls post-navigation behavior
  const pendingHandoffUserMessageRef = useRef(null); // preserved before endpoint change clears API history
  const navTimeoutRef = useRef(null); // clears stale follow-up if page never loads
  const prevScreenIdRef = useRef(null);
  const initialGreetingShownRef = useRef(false); // prevents double-greeting when endpoint change clears messages mid-session
  // Stores the plain-text of what the AI last said so we can reject echoes (from useAiVoice)
  // Called once when the current TTS utterance ends — used for the accessibility offer handoff
  // onSpeakEndRef comes from useAiVoice
  // True while the one-shot accessibility offer is being spoken — blocks auto-listen restart
  const accessibilityOfferRef = useRef(false);
  // Tracks the most recently detected language (from AI [LANG:xx] tags) for widget string translation
  const lastDetectedLanguageRef = useRef(null);
  const fabRef = useRef(null); // ref to the floating action button
  const [fabNudged, setFabNudged] = useState(false); // true when FAB is dodging an overlapping element
  const autoGuideTimerRef = useRef(null);
  // Tracks the last screenId+timestamp for which a PAGE_SUMMARY autoGuide fired.
  // Prevents double-firing when multiple triggers race (e.g. goToNextStep on same screen).
  const lastAutoGuidedRef = useRef({ screenId: null, at: 0 });
  // Tracks field IDs that have already received a [JUST_COMPLETED] error check this session.
  // Prevents the same error from being reported multiple times for the same field.
  const justCompletedSentRef = useRef(new Set());
  // Set to true immediately before focusNextAfterButton runs so notify() knows the field
  // transition was triggered by a button press (not user tabbing) and skips [JUST_COMPLETED].
  const buttonTriggeredFocusRef = useRef(false);
  const [introButtonsDismissed, setIntroButtonsDismissed] = useState(false);
  // Assisted Direct Entry panel — set when AI calls openFieldPanel
  const [adePanel, setAdePanel] = useState(null);
  const adePanelCallbackRef = useRef(null); // stores { args, history, ctx } to avoid stale closures
  const confirmedValuesRef = useRef({}); // accumulates every fieldId→value filled this session; emitted on goToNextStep
  // Pre-fill confirmation dialog (basic mode only)
  const [preFillModal, setPreFillModal] = useState(null); // null | { preFilled, remaining }
  const preFillShownRef = useRef(new Set()); // screenIds already shown — never show twice
  const preFillWatchRef = useRef(null); // interval watching slow-loading fields inside the modal

  // Silent field-error monitor (basic mode only)
  const [fieldErrorModal, setFieldErrorModal] = useState(null); // null | { fieldId, fieldLabel, fieldType, description, suggestion, currentValue }
  const confirmedErrorsRef = useRef({}); // { [fieldId]: Set<string> } — values the applicant confirmed intentionally
  // Synchronous flag set during focusout so the click interceptor can block immediately
  // (React setState is async — this ref bridges the gap before the modal renders).
  const pendingFieldErrorRef = useRef(null);
  // The button/link element whose click was intercepted while a field error was pending.
  // Re-clicked automatically after the applicant confirms or corrects the value.
  const blockedClickTargetRef = useRef(null);
  isLoadingRef.current = isLoading;
  isSpeakingRef.current = isSpeaking;

  // Reset voice/conversation mode when a new applicant session starts (clearOnMount fires)
  useEffect(() => {
    if (!widgetResetSignal) return;
    stopSpeaking();
    stopListening();
    isVoiceModeRef.current = false;
    setIsVoiceMode(false);
    pendingListenRef.current = false;
    lastDetectedLanguageRef.current = null;
  }, [widgetResetSignal, stopSpeaking, stopListening, setIsVoiceMode, isVoiceModeRef, pendingListenRef]);

  // Auto-send a queued message (e.g. from clicking "Build live action" on the demo page)
  useEffect(() => {
    if (!autoMessageSignal || !pendingAutoMessageRef?.current) return;
    const text = pendingAutoMessageRef.current;
    pendingAutoMessageRef.current = null;
    // Small delay to let the widget finish opening/rendering before sending
    setTimeout(() => {
      if (sendMessageRef.current) sendMessageRef.current(text);
    }, 400);
  }, [autoMessageSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // When the applicant focuses a form field (via Tab or click):
  //   • The panel dodges IMMEDIATELY — no delay, always tracks the current field.
  //   • AI guidance fires only after the user pauses (no typing) for a fixed 3 s delay (non-applicant mode only).
  //   • Leaving a field cancels the pause timer AND aborts any in-flight request,
  //     so the bot never gets stuck responding to a field the user already left.
  useEffect(() => {
    if (!isOpen) return;

    let pauseTimer = null;
    let lastNotifiedFieldId = null;
    // Fill-state of the field when the user first focused it — used to detect empty→filled
    // transitions for [JUST_COMPLETED] validation.
    // Fill-state of the field when the user first focused it — used to detect empty→filled
    // transitions for [JUST_COMPLETED] validation.
    let lastNotifiedFieldWasFilled = false;
    // Timestamp of the most recent input event on the current field.
    // Used in pause mode to reset the guidance timer whenever the user types.
    let lastInputTime = 0;

    // Cancel the pending pause timer AND abort the current in-flight AI request.
    // Called immediately whenever the user moves to a new field.
    const cancelPendingWork = () => {
      clearTimeout(pauseTimer);
      pauseTimer = null;
      fieldTimerCallbackRef.current = null;
      if (autoGuideAbortRef.current) {
        fieldFocusGenerationRef.current++; // invalidate any response still in flight
        pendingFieldFocusRef.current = null; // no stale pending should fire after this
        autoGuideAbortRef.current.abort();
        autoGuideAbortRef.current = null;
      }
    };

    const onFocusIn = (e) => {
      const target = e.target;

      // Phone-field country selector: auto-advance to the number input on Tab-forward.
      if (target.classList?.contains("PhoneInputCountrySelect")) {
        const numberInput = target.closest(".PhoneInput")?.querySelector(".PhoneInputInput");
        if (numberInput && e.relatedTarget !== numberInput) numberInput.focus();
        return;
      }

      // Signature field: focus can land on the wrapper div (tab) or anywhere inside it (canvas click).
      const signMarker = target.closest?.("[data-ai-type='sign']");
      if (signMarker) {
        const sigFieldId = signMarker.getAttribute("data-ai-id");
        if (sigFieldId && sigFieldId !== lastNotifiedFieldId) {
          // Immediately: cancel stale work, move panel
          cancelPendingWork();
          lastNotifiedFieldId = sigFieldId;
          const sigValue = signMarker.getAttribute("data-ai-value") || "";
          lastNotifiedFieldWasFilled = !!sigValue;
          const outerMarker = signMarker.parentElement?.closest("[data-ai-type='sign']") || signMarker;
          console.log(`[FOCUS] field: id="${sigFieldId}" label="signature" type=sign filled=${!!sigValue}`);
          dodgeForField(outerMarker);

          // Signature fields always get immediate guidance — the applicant needs to understand
          // what they're signing before they can proceed, regardless of guidance mode.
          if (!sigValue && assistantMode === "applicant" && AI_CHAT_MODE !== "basic") {
            const sigTimerCallback = () => {
              const signText =
                (outerMarker.getAttribute("data-ai-text") || "").trim() ||
                (signMarker.getAttribute("data-ai-text") || "").trim();
              const ctx = getScreenContext();
              const sigField = ctx?.currentState?.fields?.find((f) => f.isSignature);
              if (sigField) sendSignatureGuidance(sigField, signText);
            };
            fieldTimerCallbackRef.current = sigTimerCallback;
            pauseTimer = setTimeout(sigTimerCallback, 300);
          }
        }
        return;
      }

      if (!["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
      if (target === inputRef.current) return;
      const fieldId = target.type === "radio" ? target.getAttribute("name") : target.id || target.getAttribute("name");
      if (!fieldId) return;
      if (fieldId === lastNotifiedFieldId) return;

      // Capture the previous field before updating tracking — used for [JUST_COMPLETED] below.
      const prevFieldId = lastNotifiedFieldId;
      const prevFieldWasFilled = lastNotifiedFieldWasFilled;

      // Immediately: cancel all pending/in-flight work for the previous field, move the panel.
      cancelPendingWork();
      lastNotifiedFieldId = fieldId;
      lastNotifiedFieldWasFilled = false; // updated when pause timer fires
      activatedFieldIdRef.current = fieldId;
      console.log(`[FOCUS] field: id="${fieldId}" type=${target.type || "text"}`);
      dodgeForField(target);

      lastInputTime = 0; // reset per-field typing tracker

      if (assistantMode !== "applicant" || AI_CHAT_MODE === "basic") return;

      // Immediate: auto-fill batch skip for Google Places and similar.
      // When the current field AND the next field are both filled already (address lookup filled
      // several fields at once), jump directly to the first genuinely empty required field so the
      // applicant doesn't have to tab through a run of pre-filled fields manually.
      // Uses a short delay to let the DOM settle after the auto-fill cascade finishes.
      if (prevFieldId) {
        setTimeout(() => {
          const batchCtx = getScreenContext();
          if (!batchCtx?.currentState?.fields?.length) return;
          const allFields = batchCtx.currentState.fields;
          const curIdx = allFields.findIndex((f) => f.id === fieldId);
          if (curIdx === -1) return;
          const curField = allFields[curIdx];
          const nextCtxF = allFields[curIdx + 1];
          const isBatchFilled = curField?.filled && nextCtxF?.filled;
          if (isBatchFilled) {
            const firstEmpty = allFields.slice(curIdx).find((f) => f.required && !f.filled && !f.isSignature);
            if (firstEmpty && firstEmpty.id !== fieldId) {
              const skipped = allFields.slice(
                curIdx,
                allFields.findIndex((f) => f.id === firstEmpty.id),
              );
              const jumpEl =
                document.getElementById(firstEmpty.id) ||
                document.querySelector(`[name="${CSS.escape(firstEmpty.id)}"]`);
              if (jumpEl) {
                jumpEl._autoFilledFields = skipped.map((f) => f.label).join(", ");
                jumpEl.focus();
              }
            }
          }
        }, 150);
      }

      // Deferred: guidance fires after the user pauses without typing for 3 s (non-applicant mode only).
      // prevFieldId / prevFieldWasFilled are captured in the closure for [JUST_COMPLETED].
      const timerCallback = () => {
        // Screen-change handler sent [FIELD_FOCUS] directly for this first field — skip to avoid duplicate.
        if (suppressNextFocusGuidanceRef.current) {
          suppressNextFocusGuidanceRef.current = false;
          return;
        }
        if (isLoadingRef.current) return; // busy with a manual chat message — skip

        const ctx = getScreenContext();
        if (!ctx?.currentState?.fields?.length) return;
        const field = ctx.currentState.fields.find((f) => f.id === fieldId);
        if (!field) return;

        if (!field.filled) justCompletedSentRef.current.delete(fieldId);

        // [JUST_COMPLETED] field validation — temporarily disabled, re-enable when ready.
        // const buttonTriggered = buttonTriggeredFocusRef.current;
        buttonTriggeredFocusRef.current = false;
        let justCompletedSection = "";
        /*
        if (!buttonTriggered && prevFieldId && prevFieldId !== fieldId) {
          const prevCtxField = ctx.currentState.fields.find((f) => f.id === prevFieldId);
          // Skip suggestion/autocomplete fields — they're filled programmatically (e.g. Google Places),
          // so ctx.currentState.fields may hold a stale intermediate keystroke value rather than the
          // final selection. Validating that partial value produces false positives.
          const isAutocomplete = prevCtxField?.directEntry === true;
          // Read the live DOM value instead of the stale ctx snapshot — avoids false errors when
          // discoverFormFields ran mid-type before the autocomplete or onChange handler committed.
          const prevEl = prevFieldId
            ? (document.getElementById(prevFieldId) || document.querySelector(`[name="${CSS.escape(prevFieldId)}"]`))
            : null;
          const liveValue = prevEl ? prevEl.value.trim() : prevCtxField?.value ?? "";
          const prevIsFilled = liveValue !== "";
          if (!isAutocomplete && prevCtxField && prevIsFilled && !prevFieldWasFilled &&
              !justCompletedSentRef.current.has(prevFieldId)) {
            justCompletedSentRef.current.add(prevFieldId);
            justCompletedSection =
              `\n\n[JUST_COMPLETED] The applicant just finished field "${prevCtxField.label}"` +
              ` (id: ${prevFieldId}, type: ${prevCtxField.type || "text"}, required: ${prevCtxField.required ? "yes" : "no"})` +
              ` with value "${liveValue}".` +
              ` Check ONLY this field for errors using the validation rules.` +
              ` If an error is found, start your response with ⚠️ and describe it in 1–2 sentences. Do NOT call activateField or goToNextStep. Do NOT give guidance for the newly focused field in the same response.` +
              ` If valid: write NOTHING about the checked field. No acknowledgement whatsoever. Immediately give guidance for the newly focused field as if [JUST_COMPLETED] was not in this message.`;
          }
        }
        */ // end JUST_COMPLETED block

        const stepInfo =
          ctx.currentState.currentStep != null
            ? ` Step ${ctx.currentState.currentStep + 1} of ${ctx.currentState.totalSteps}.`
            : "";

        const optionsHint =
          field.type === "radio" && Array.isArray(field.options) && field.options.length
            ? ` Options: ${field.options.map((o, i) => `${String.fromCharCode(97 + i)}) ${o.label}`).join(", ")}.`
            : "";

        const autoFillNote = target._autoFilledFields
          ? ` Note: the following fields were just auto-filled (likely by an address lookup or similar): ${target._autoFilledFields}. Briefly acknowledge this ("Looks like some fields were filled automatically") before giving guidance for the current field.`
          : "";
        if (target._autoFilledFields) delete target._autoFilledFields;

        const helpContextNote = field.helpContext
          ? ` FIELD HELP CONTEXT (configured by the form owner specifically for this field — use it to give more informed guidance; invite the applicant to ask more if they want deeper detail): "${field.helpContext}".`
          : "";

        autoGuideRef.current?.(
          `[FIELD_FOCUS] The applicant is now focused on field "${field.label}" (id: ${fieldId}).` +
            ` Filled: ${field.filled ? `yes, current value: "${field.value || ""}"` : "no"}. Required: ${field.required ? "yes" : "no"}. Type: ${field.type || "text"}.` +
            `${optionsHint}${stepInfo}${autoFillNote}${helpContextNote}` +
            " Provide brief guidance for this field (1–3 sentences), then end with 'Tab to move on when you're done.'" +
            justCompletedSection,
        );
      };
      // In applicant mode the AI drives the conversation — suppress passive field guidance.
      if (assistantMode !== "applicant") {
        fieldTimerCallbackRef.current = timerCallback;
        pauseTimer = setTimeout(timerCallback, 3000);
      }
    };

    // Fires on every keystroke in any form field.
    // Any typing resets the guidance timer — guidance fires only after a true pause
    // (no keystrokes for the full delay period).
    const onInputChange = (e) => {
      const t = e.target;
      if (!["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName)) return;
      if (t === inputRef.current) return;
      const fId = t.id || t.getAttribute("name");
      if (!fId || fId !== lastNotifiedFieldId) return;
      if (fieldTimerCallbackRef.current) {
        lastInputTime = Date.now();
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(fieldTimerCallbackRef.current, 3000);
      }
    };

    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("input", onInputChange, true);
    return () => {
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("input", onInputChange, true);
      clearTimeout(pauseTimer);
    };
  }, [assistantMode, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Silent field-error monitor — basic mode only.
  // Listens for focusout on every form field. When the applicant leaves a field,
  // runs client-side pattern checks (no AI call). If an obvious error is found and
  // the applicant hasn't already confirmed this value, shows a dialog with options to
  // keep / accept suggestion / type new value.
  //
  // Click interception: because React setState is async, focusout fires before the modal
  // renders. A capture-phase click listener blocks any button/link click that races with
  // the pending error check, stores the target, and re-fires it automatically after the
  // applicant confirms or corrects the value.
  //
  // Secure fields (SSN, passwords, bank accounts, OTP codes, etc.) are never monitored.
  useEffect(() => {
    console.log(
      "%c[FIELD-ERR] effect mount — assistantMode=%s AI_CHAT_MODE=%s",
      "color:#7c3aed;font-weight:bold",
      assistantMode,
      AI_CHAT_MODE,
    );
    if (assistantMode !== "applicant") {
      console.log("%c[FIELD-ERR] skipped: not applicant mode", "color:#7c3aed");
      return;
    }
    if (AI_CHAT_MODE !== "basic") {
      console.log("%c[FIELD-ERR] skipped: not basic mode (mode=%s)", "color:#7c3aed", AI_CHAT_MODE);
      return;
    }
    console.log("%c[FIELD-ERR] listeners registered", "color:#7c3aed;font-weight:bold");

    // Shared helper — checks an input element for errors and, if found, sets the
    // pending flag + opens the modal. Returns true if an error was detected.
    const checkAndFlag = (el) => {
      if (!el || el === inputRef.current) return false;
      if (!["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) return false;
      if (el.type === "password") return false;
      if (el.closest?.("[data-ai-type='sign']")) return false;

      const rawValue = el.value?.trim();
      if (!rawValue) return false;

      const fieldId = el.id || el.getAttribute("name");
      if (!fieldId) return false;

      const ctx = getScreenContext();
      const fields = ctx?.currentState?.fields || [];
      const meta = fields.find((f) => f.id === fieldId);
      console.log(
        "%c[FIELD-ERR] checkAndFlag fieldId=%s meta=%o fieldMode=%s",
        "color:#7c3aed",
        fieldId,
        meta,
        meta?.fieldMode,
      );

      if (meta?.fieldMode === "secure" || meta?.isSignature) return false;
      // Skip auto-defaulted fields — e.g. PhoneInput's country-code selector
      if (meta?.isDefault) return false;

      const fieldLabel = meta?.label || fieldId;
      const fieldType = meta?.type || el.type || "text";

      const confirmed = confirmedErrorsRef.current[fieldId];
      if (confirmed instanceof Set && confirmed.has(rawValue)) return false;

      // Already pending — don't re-open the modal for the same error
      if (pendingFieldErrorRef.current) return true;

      console.log(
        "%c[FIELD-ERR] checking — fieldId=%s label=%s type=%s value=%s",
        "color:#7c3aed;font-weight:bold",
        fieldId,
        fieldLabel,
        fieldType,
        rawValue,
      );
      const error = checkFieldForErrors(fieldId, fieldLabel, fieldType, rawValue);
      console.log("%c[FIELD-ERR] result:", "color:#7c3aed;font-weight:bold", error);
      if (!error) return false;

      pendingFieldErrorRef.current = true;
      console.log("%c[FIELD-ERR] ▶ flagging error for fieldId=%s", "color:#7c3aed;font-weight:bold", fieldId);

      // For email fields: warn that any already-triggered action (e.g. OTP send)
      // may need to be repeated with the corrected address.
      const isEmail =
        fieldType === "email" || fieldId.toLowerCase().includes("email") || fieldLabel.toLowerCase().includes("email");
      const retryNote = isEmail
        ? "If a step was already triggered using this address — such as sending a verification code — you may need to repeat it after saving the corrected value."
        : null;

      setFieldErrorModal({
        fieldId,
        fieldLabel,
        fieldType,
        description: error.description,
        suggestion: error.suggestion,
        currentValue: rawValue,
        retryNote,
      });
      return true;
    };

    // Primary intercept point: mousedown on action elements fires BEFORE click and
    // before focus moves, so we can check the currently-focused field right now and
    // set the blocking flag before the click event fires.
    const onCaptureMouseDown = (e) => {
      if (e.target.closest("[data-field-error-modal]")) return;
      const actionEl = e.target.closest("button, a, input[type='submit'], [role='button']");
      if (!actionEl) return;
      const focused = document.activeElement;
      console.log(
        "%c[FIELD-ERR] mousedown on action=%s focused=%s#%s",
        "color:#a16207",
        actionEl.tagName,
        focused?.tagName,
        focused?.id,
      );
      const hasError = checkAndFlag(focused);
      if (hasError) {
        // Store the blocked element here — before click fires — so replay works correctly
        blockedClickTargetRef.current = actionEl;
        console.log(
          "%c[FIELD-ERR] ▶ mousedown: stored blocked target, click will be stopped",
          "color:#a16207;font-weight:bold",
        );
      }
    };

    // Fallback focusout handler — covers keyboard Tab navigation (no mousedown on a button).
    const onFocusOut = (e) => {
      console.log(
        "%c[FIELD-ERR] focusout tag=%s id=%s value=%s",
        "color:#7c3aed",
        e.target.tagName,
        e.target.id,
        e.target.value,
      );
      checkAndFlag(e.target);
    };

    // Capture-phase click interceptor: runs before any React event handlers.
    // Blocks the click if a field error is pending confirmation.
    const onCaptureClick = (e) => {
      console.log(
        "%c[FIELD-ERR] click capture — pending=%s target=%s",
        "color:#a16207",
        !!pendingFieldErrorRef.current,
        e.target?.tagName,
      );
      if (!pendingFieldErrorRef.current) return;
      if (e.target.closest("[data-field-error-modal]")) {
        console.log("%c[FIELD-ERR] click: modal button, letting through", "color:#a16207");
        return;
      }
      const actionEl = e.target.closest("button, a, input[type='submit'], [role='button']");
      if (!actionEl) return;
      console.log(
        "%c[FIELD-ERR] ▶ blocking click on %s text=%s",
        "color:#a16207;font-weight:bold",
        actionEl.tagName,
        actionEl.textContent?.trim(),
      );
      e.stopPropagation();
      pendingFieldErrorRef.current = null;
      if (!blockedClickTargetRef.current) blockedClickTargetRef.current = actionEl;
    };

    document.addEventListener("mousedown", onCaptureMouseDown, true);
    document.addEventListener("mousedown", onCaptureMouseDown, true);
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("click", onCaptureClick, true);
    return () => {
      console.log("%c[FIELD-ERR] listeners removed", "color:#7c3aed");
      document.removeEventListener("mousedown", onCaptureMouseDown, true);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("click", onCaptureClick, true);
    };
    // NOTE: intentionally excludes currentScreenId — adding it caused the listeners to be
    // torn down and re-added on every registerScreenContext call, making the pre-click
    // focusout invisible to the error monitor. All inner state is accessed via refs.
  }, [assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-fill confirmation: polls until field values settle (or the hard cap fires),
  // then shows the review dialog if any non-secure fields are already filled.
  // Reuses the same data-ai-loading guard that the guided mode's settle-detection uses,
  // so AI-delayed fields (with spinners) hold the window automatically.
  useEffect(() => {
    if (assistantMode !== "applicant") return;
    if (AI_CHAT_MODE !== "basic") return;
    if (!currentScreenId) return;
    if (preFillShownRef.current.has(currentScreenId)) return;

    const screenId = currentScreenId;

    const FLOOR_MS = 150; // never fire before this many ms
    const QUIET_MS = 100; // values must be stable for this long
    const CAP_MS = 15000; // hard cap — covers AI-filled fields that take up to ~10 s
    const POLL_MS = 50; // poll interval

    const start = Date.now();
    let quietSince = start;
    let lastKey = null;
    let cancelled = false;
    let pollCount = 0;

    console.log(
      `%c[PREFILL] effect started — screenId="${screenId}" CAP=${CAP_MS}ms`,
      "color:#8b5cf6; font-weight:bold",
    );

    // Get the freshest field list available — re-discover from live DOM when formRef
    // is present, because registerScreenContext is only called when deps change (e.g.
    // currentStep), not when AI fills individual fields between registrations.
    const getLiveFields = (ctx) => {
      if (ctx?.formRef?.current) {
        return discoverFormFields(ctx.formRef.current, { silent: true });
      }
      return ctx?.currentState?.fields ?? [];
    };

    const getKey = () => {
      const ctx = getScreenContext();
      if (!ctx || ctx.screenId !== screenId) return null;
      return getLiveFields(ctx)
        .filter((f) => !f.isSignature)
        .map((f) => `${f.id}:${f.filled ? "1" : "0"}:${f.value ?? ""}`)
        .join("|");
    };

    // Returns true if a field's DOM element (or a wrapper up to containerEl) has an active spinner.
    const isFieldLoading = (containerEl, fieldId) => {
      if (!containerEl || !fieldId) return false;
      const el =
        containerEl.querySelector(`#${CSS.escape(fieldId)}`) ||
        containerEl.querySelector(`[name="${CSS.escape(fieldId)}"]`) ||
        containerEl.querySelector(`[data-ai-id="${CSS.escape(fieldId)}"]`);
      if (!el) return false;
      if (el.getAttribute("data-ai-loading") === "true") return true;
      let p = el.parentElement;
      while (p && p !== containerEl) {
        if (p.getAttribute("data-ai-loading") === "true") return true;
        p = p.parentElement;
      }
      return false;
    };

    const tryFire = (reason) => {
      if (cancelled) return;
      cancelled = true;

      const ctx = getScreenContext();
      if (!ctx || ctx.screenId !== screenId) {
        console.log(`%c[PREFILL] tryFire(${reason}) — screen changed, aborting`, "color:#8b5cf6");
        return;
      }

      const container = ctx.formRef?.current ?? null;
      const fields = getLiveFields(ctx);
      console.log(
        `%c[PREFILL] tryFire(${reason}) — elapsed=${Date.now() - start}ms totalFields=${fields.length}`,
        "color:#8b5cf6; font-weight:bold",
      );

      // Fields already filled
      const preFilled = fields
        .filter((f) => f.filled && !f.isSignature && f.fieldMode !== "secure")
        .map((f) => ({ ...f, isLoading: false }));

      // Fields not yet filled but have an active field-level spinner — include as loading placeholders
      const loadingPlaceholders = fields
        .filter((f) => !f.filled && !f.isSignature && f.fieldMode !== "secure" && isFieldLoading(container, f.id))
        .map((f) => ({ ...f, isLoading: true }));

      const allPreFilled = [...preFilled, ...loadingPlaceholders];

      if (allPreFilled.length < 3) {
        console.log("%c[PREFILL] fewer than 3 pre-filled fields — dialog suppressed", "color:#8b5cf6");
        return;
      }

      preFillShownRef.current.add(screenId);

      const remaining = fields.filter(
        (f) => !f.filled && !f.isSignature && f.required && !isFieldLoading(container, f.id),
      );
      setPreFillModal({ preFilled: allPreFilled, remaining });
    };

    const poll = () => {
      if (cancelled) return;

      // Abort if the screen changed before we fired
      if (getScreenContext()?.screenId !== screenId) {
        console.log("%c[PREFILL] poll — screen changed, cancelling", "color:#8b5cf6");
        cancelled = true;
        return;
      }

      const now = Date.now();
      const elapsed = now - start;
      const aiLoading = !!document.querySelector('[data-ai-loading="page"]');
      pollCount++;

      // Log every ~2 seconds (every 10 polls at 200ms) or when key changes
      const key = getKey();
      if (key === null) {
        console.log("%c[PREFILL] poll — getKey() returned null (screen changed?), cancelling", "color:#8b5cf6");
        cancelled = true;
        return;
      }

      const keyChanged = key !== lastKey;
      if (keyChanged) {
        console.log(
          `%c[PREFILL] poll #${pollCount} elapsed=${elapsed}ms — KEY CHANGED, resetting quiet window`,
          "color:#8b5cf6",
          { aiLoading, quietAge: now - quietSince, newKey: key.slice(0, 200) },
        );
        lastKey = key;
        quietSince = now;
      } else if (pollCount % 10 === 1) {
        // Periodic heartbeat every ~2 seconds
        console.log(`%c[PREFILL] poll #${pollCount} elapsed=${elapsed}ms — stable`, "color:#8b5cf6", {
          aiLoading,
          quietAge: now - quietSince,
          filledCount: key.split("|").filter((s) => s.includes(":1:")).length,
        });
      }

      // Hard cap — fire regardless of stability
      if (elapsed >= CAP_MS) {
        console.log(`%c[PREFILL] CAP reached at ${elapsed}ms — firing`, "color:#f59e0b; font-weight:bold");
        tryFire("cap");
        return;
      }

      // Hold while any field's AI process is still running (spinner visible)
      if (aiLoading) {
        quietSince = now;
        setTimeout(poll, POLL_MS);
        return;
      }

      // Floor + quiet window both satisfied — fire
      if (elapsed >= FLOOR_MS && now - quietSince >= QUIET_MS) {
        console.log(
          `%c[PREFILL] settled — elapsed=${elapsed}ms quietAge=${now - quietSince}ms — firing`,
          "color:#22c55e; font-weight:bold",
        );
        tryFire("settled");
        return;
      }

      setTimeout(poll, POLL_MS);
    };

    setTimeout(poll, POLL_MS);
    return () => {
      cancelled = true;
      // Remove on navigation so returning to the same page shows the dialog again.
      // The guard above (has check) still prevents double-fires during re-renders
      // within a single visit because cancelled=true stops the poller immediately.
      preFillShownRef.current.delete(screenId);
    };
  }, [assistantMode, currentScreenId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Watcher: once the pre-fill modal is open with still-loading fields, poll them
  // and update their values in-place as each one resolves.
  useEffect(() => {
    const hasLoading = preFillModal?.preFilled?.some((f) => f.isLoading);

    if (preFillWatchRef.current) {
      clearInterval(preFillWatchRef.current);
      preFillWatchRef.current = null;
    }

    if (!preFillModal || !hasLoading) return;

    preFillWatchRef.current = setInterval(() => {
      const ctx = getScreenContext();
      if (!ctx) return;
      const container = ctx.formRef?.current ?? null;
      const liveFields = ctx.formRef?.current
        ? discoverFormFields(ctx.formRef.current, { silent: true })
        : (ctx.currentState?.fields ?? []);

      setPreFillModal((prev) => {
        if (!prev) return null;
        let anyStillLoading = false;
        const newRemaining = [...prev.remaining];
        const updated = prev.preFilled
          .map((f) => {
            if (!f.isLoading) return f;
            // Check if the field's spinner has cleared
            const stillLoading = (() => {
              if (!container || !f.id) return false;
              const el =
                container.querySelector(`#${CSS.escape(f.id)}`) ||
                container.querySelector(`[name="${CSS.escape(f.id)}"]`) ||
                container.querySelector(`[data-ai-id="${CSS.escape(f.id)}"]`);
              if (!el) return false;
              if (el.getAttribute("data-ai-loading") === "true") return true;
              let p = el.parentElement;
              while (p && p !== container) {
                if (p.getAttribute("data-ai-loading") === "true") return true;
                p = p.parentElement;
              }
              return false;
            })();
            if (stillLoading) {
              anyStillLoading = true;
              return f;
            }
            const live = liveFields.find((lf) => lf.id === f.id);
            if (live?.filled) return { ...f, value: live.value, isLoading: false };
            // Resolved empty — move to remaining if required and not already there
            if (f.required && !newRemaining.some((r) => r.id === f.id)) {
              newRemaining.push({ id: f.id, label: f.label, required: true });
            }
            return null; // remove from preFilled
          })
          .filter(Boolean);

        if (!anyStillLoading && preFillWatchRef.current) {
          clearInterval(preFillWatchRef.current);
          preFillWatchRef.current = null;
        }
        return { ...prev, preFilled: updated, remaining: newRemaining };
      });
    }, 150);

    return () => {
      if (preFillWatchRef.current) {
        clearInterval(preFillWatchRef.current);
        preFillWatchRef.current = null;
      }
    };
  }, [!!preFillModal, preFillModal?.preFilled?.some((f) => f.isLoading)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Immediately focus and dodge to the first unfilled required field on the current screen.
  // The bot is NOT involved — field activation happens programmatically so the user is never
  // stranded while waiting for an AI round-trip. Returns true if a field was focused.
  // requireRequired: true (default) = only focus required fields (used mid-form after button presses)
  //                  false = focus first unfilled field regardless of required (used on screen change)
  const focusFirstEmptyField = (fields, { requireRequired = true } = {}) => {
    const target = requireRequired
      ? fields?.find((f) => f.required && !f.filled && !f.isSignature)
      : fields?.find((f) => !f.filled && !f.isSignature);
    if (!target) return false;
    const el = document.getElementById(target.id) || document.querySelector(`[name="${CSS.escape(target.id)}"]`);
    if (!el) return false;
    suppressChatFocusRef.current = true;
    el.focus();
    // Only select-all if we actually moved focus (don't disrupt mid-typing on already-focused field).
    if (document.activeElement === el) {
      try {
        el.select();
      } catch (_) {}
    }
    dodgeForField(el);
    return true;
  };

  // If there is an unfilled signature field and no regular fields to focus, notify the bot
  // so it can guide the applicant through signing. Returns true if a notification was sent.
  const notifySignatureIfPending = (fields) => {
    const sigField = fields?.find((f) => f.isSignature && !f.filled);
    if (!sigField) return false;
    // Read text from the live DOM. Prefer the outermost [data-ai-type="sign"] ancestor
    // (set by the section component) over an inner wrapper (set by SignatureBox itself).
    const markerEl = document.querySelector(`[data-ai-type="sign"][data-ai-id="${sigField.id}"]`);
    const outerMarkerEl = markerEl?.parentElement?.closest("[data-ai-type='sign']");
    const signText =
      (outerMarkerEl?.getAttribute("data-ai-text") || "").trim() ||
      (markerEl?.getAttribute("data-ai-text") || "").trim() ||
      sigField.signText ||
      "";
    sendSignatureGuidance(sigField, signText);
    return true;
  };

  const sendSignatureGuidance = (sigField, signText) => {
    const signTextNote = signText ? ` The attestation/agreement text they are signing reads: "${signText}"` : "";
    autoGuideRef.current?.(
      `[FIELD_FOCUS] The applicant has reached the signature field "${sigField.label}" (id: ${sigField.id}). ` +
        `Required: ${sigField.required ? "yes" : "no"}.${signTextNote} ` +
        `First quote the attestation text verbatim, then in 1–3 plain-language sentences explain what it means in the context of a financial services application. Then in one sentence tell them how to sign.`,
    );
  };

  // Returns the nearest enabled button adjacent to inputEl in the DOM.
  // Used by the Enter-key listener and by dodgeForField (to avoid covering buttons too).
  const findAdjacentButton = (inputEl) => {
    let el = inputEl;
    for (let depth = 0; depth < 4; depth++) {
      let sibling = el.nextElementSibling;
      while (sibling) {
        if (sibling.tagName === "BUTTON" && !sibling.disabled) return sibling;
        const btn = sibling.querySelector("button:not([disabled])");
        if (btn) return btn;
        sibling = sibling.nextElementSibling;
      }
      el = el.parentElement;
      if (!el || el === document.body) break;
    }
    return null;
  };

  // After a non-navigation button press, focus the next empty field.
  // Retries with backoff because some fields (e.g. OTP input) appear only after an API response.
  // Stops automatically if the screen navigates away.
  const focusNextAfterButton = (screenId, attempt = 0) => {
    const ctx = getScreenContext();
    if (!ctx || ctx.screenId !== screenId) return; // navigated — screen-change effect handles it
    const focused = focusFirstEmptyField(ctx.currentState?.fields);
    if (!focused && attempt < 8) {
      setTimeout(() => focusNextAfterButton(screenId, attempt + 1), 350);
    }
  };

  // When the user presses Enter inside a form input, click the nearest adjacent button
  // (e.g. "Send Code" next to an email field, "Verify" next to an OTP field).
  // Also handles mouse clicks on any non-chat button (covers the same post-button focus logic).
  // Runs in bubble phase so React component handlers (suggestion dropdowns, etc.) fire first;
  // we bail out if they already called e.preventDefault().
  useEffect(() => {
    if (assistantMode !== "applicant" || AI_CHAT_MODE === "basic") return;

    // Flag set just before btn.click() so the click listener can skip that synthetic click.
    let enterTriggeredBtn = null;

    const onEnterKeydown = (e) => {
      // Google Places pac-container: if Tab is pressed and exactly one suggestion is visible, auto-select it.
      if (e.key === "Tab" && !e.defaultPrevented) {
        const t = e.target;
        if (t && ["INPUT", "TEXTAREA"].includes(t.tagName) && t !== inputRef.current) {
          const pacContainer = document.querySelector(".pac-container");
          if (pacContainer && getComputedStyle(pacContainer).display !== "none") {
            const pacItems = pacContainer.querySelectorAll(".pac-item");
            if (pacItems.length === 1) {
              e.preventDefault();
              t.dispatchEvent(
                new KeyboardEvent("keydown", { key: "ArrowDown", keyCode: 40, bubbles: true, cancelable: true }),
              );
              setTimeout(
                () =>
                  t.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true, cancelable: true }),
                  ),
                50,
              );
              return;
            }
          }
        }
      }

      if (e.key !== "Enter") return;
      if (e.defaultPrevented) return; // component already handled (e.g. suggestion selection)
      const target = e.target;
      if (!["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (target === inputRef.current) return; // don't intercept the chat input
      const btn = findAdjacentButton(target);
      if (!btn) return;
      if (panelRef.current?.contains(btn)) return; // don't click buttons inside the chat panel
      e.preventDefault();

      const screenId = getScreenContext()?.screenId;
      // Mark this click as Enter-triggered so onButtonClick doesn't double-fire.
      enterTriggeredBtn = btn;
      btn.click();
      enterTriggeredBtn = null;

      // Retry-with-backoff: field may not be in the DOM yet (e.g. OTP input appears after API call).
      buttonTriggeredFocusRef.current = true;
      setTimeout(() => focusNextAfterButton(screenId, 0), 350);
    };

    // Mouse-click handler: covers buttons the user clicks directly (not via Enter).
    // Uses the same retry-with-backoff logic; bails if the screen navigates.
    const onButtonClick = (e) => {
      const btn = e.target.closest("button");
      if (!btn || btn.disabled) return;
      if (panelRef.current?.contains(btn)) return; // ignore chat panel buttons
      if (btn === enterTriggeredBtn) return; // already handled by Enter key path above
      const screenId = getScreenContext()?.screenId;
      buttonTriggeredFocusRef.current = true;
      setTimeout(() => focusNextAfterButton(screenId, 0), 350);
    };

    // Bubble phase: runs after child React handlers so defaultPrevented is reliable.
    document.addEventListener("keydown", onEnterKeydown);
    document.addEventListener("click", onButtonClick);
    return () => {
      document.removeEventListener("keydown", onEnterKeydown);
      document.removeEventListener("click", onButtonClick);
    };
  }, [assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- drag-to-move ----------

  const onResizeMouseDown = (e, edge) => {
    e.preventDefault();
    e.stopPropagation();
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    resizeRef.current = {
      isResizing: true,
      edge,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
      startLeft: rect.left,
      startTop: rect.top,
    };
  };

  const onHeaderMouseDown = (e) => {
    // Don't start drag when clicking buttons inside the header
    if (e.target.closest("button")) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: rect.left,
      startTop: rect.top,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (dragRef.current.isDragging) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const newTop = Math.max(0, dragRef.current.startTop + dy);
        const cur = panelTargetRef.current;
        const newLeft = Math.max(
          0,
          Math.min(window.innerWidth - (cur.width ?? PANEL_WIDTH), dragRef.current.startLeft + dx),
        );
        panelTargetRef.current = { ...cur, top: newTop, left: newLeft };
        setPosition({ top: newTop, left: newLeft });
      }
      if (resizeRef.current.isResizing) {
        const { edge, startX, startY, startW, startH, startLeft, startTop } = resizeRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newW = startW,
          newH = startH,
          newLeft = startLeft,
          newTop = startTop;
        if (edge.includes("e")) newW = startW + dx;
        if (edge.includes("w")) {
          newW = startW - dx;
          newLeft = startLeft + (startW - Math.max(PANEL_MIN_WIDTH, newW));
        }
        if (edge.includes("s")) newH = startH + dy;
        if (edge.includes("n")) {
          newH = startH - dy;
          newTop = startTop + (startH - Math.max(PANEL_MIN_HEIGHT, newH));
        }
        newW = Math.max(PANEL_MIN_WIDTH, Math.min(newW, window.innerWidth - newLeft));
        newH = Math.max(PANEL_MIN_HEIGHT, Math.min(newH, window.innerHeight - newTop));
        panelTargetRef.current = { top: newTop, left: newLeft, width: newW, height: newH };
        setPanelWidth(newW);
        setPanelHeight(newH);
        setPosition({ top: newTop, left: newLeft });
      }
    };
    const onMouseUp = () => {
      if (dragRef.current.isDragging) homePositionRef.current = null; // drag sets a new home
      dragRef.current.isDragging = false;
      resizeRef.current.isResizing = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Max help mode: disable all form inputs while active so the applicant types in chat instead.
  // Removes focusable descendants of a sign wrapper from the keyboard tab order.
  // Saves the original tabindex so it can be restored by restoreSignTabOrder.
  const blockSignTabOrder = (wrapper) => {
    const els = [wrapper, ...Array.from(wrapper.querySelectorAll("[tabindex], button"))];
    for (const el of els) {
      if (el.hasAttribute("data-ai-sig-tab")) continue; // already saved
      el.setAttribute("data-ai-sig-tab", el.getAttribute("tabindex") ?? "");
      el.setAttribute("tabindex", "-1");
    }
  };

  const restoreSignTabOrder = (wrapper) => {
    const els = [wrapper, ...Array.from(wrapper.querySelectorAll("[data-ai-sig-tab]"))];
    for (const el of els) {
      if (!el.hasAttribute("data-ai-sig-tab")) continue;
      const saved = el.getAttribute("data-ai-sig-tab");
      if (saved === "") el.removeAttribute("tabindex");
      else el.setAttribute("tabindex", saved);
      el.removeAttribute("data-ai-sig-tab");
    }
  };

  // In applicant mode, disable direct form editing so users go through the chat.
  // Re-enables tracked elements on each page/step change before re-scanning the new DOM.
  // Signature boxes ([data-ai-type="sign"]) use pointer-events:none since they can't use `disabled`.
  // Runs on page/step navigation (currentScreenId + formDataSignal).
  // Skipped in basic mode — the applicant fills the form themselves.
  // Also skipped when screen context sets allowManualEdit (admin/owner testing the form).
  useEffect(() => {
    if (assistantMode !== "applicant" || AI_CHAT_MODE === "basic") return;
    // Small delay so the new page's DOM is fully rendered before we query
    const apply = () => {
      const ctx = getScreenContext();
      const allowManualEdit = ctx?.allowManualEdit === true;

      // Re-enable any previously tracked elements first (they're from the old page)
      for (const el of maxHelpDisabledElsRef.current) {
        el.disabled = false;
      }
      maxHelpDisabledElsRef.current = [];
      for (const wrapper of maxHelpDisabledSignsRef.current) {
        wrapper.style.pointerEvents = "";
        wrapper.style.opacity = "";
        wrapper.style.userSelect = "";
        restoreSignTabOrder(wrapper);
      }
      maxHelpDisabledSignsRef.current = [];

      if (allowManualEdit) return;

      const chatPanel = panelRef.current || document.querySelector(".ai-chat-panel");
      const formRoot = ctx?.formRef?.current;

      // Disable standard form inputs.
      // Exception: Google Places autocomplete inputs (data-ai-type="places" or nested
      // inside such a wrapper) must stay enabled — the Places API requires live DOM
      // interaction and won't work on a disabled input.
      const candidates = (formRoot || document).querySelectorAll(
        'input:not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]),' + "select, textarea",
      );
      for (const el of candidates) {
        if (
          !el.disabled &&
          !chatPanel?.contains(el) &&
          el.getAttribute("data-ai-type") !== "places" &&
          !el.closest("[data-ai-type='places']")
        ) {
          el.disabled = true;
          maxHelpDisabledElsRef.current.push(el);
        }
      }

      // Block signature boxes — canvas + buttons can't use disabled, use pointer-events instead.
      // Also remove them from the tab order so Tab doesn't jump here while all other inputs are disabled.
      const signWrappers = (formRoot || document).querySelectorAll('[data-ai-type="sign"]');
      for (const wrapper of signWrappers) {
        if (!chatPanel?.contains(wrapper)) {
          wrapper.style.pointerEvents = "none";
          wrapper.style.opacity = "0.55";
          wrapper.style.userSelect = "none";
          blockSignTabOrder(wrapper);
          maxHelpDisabledSignsRef.current.push(wrapper);
        }
      }
    };
    const t = setTimeout(apply, 150);
    return () => clearTimeout(t);
  }, [assistantMode, currentScreenId, formDataSignal, getScreenContext]);

  // Close stale ADE panel when the applicant navigates to a new step/page so cleanup
  // does not re-disable fields on the new screen.
  useEffect(() => {
    if (assistantMode !== "applicant" || AI_CHAT_MODE === "basic") return;
    setAdePanel(null);
    adePanelCallbackRef.current = null;
  }, [assistantMode, currentScreenId]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
    // In guided applicant mode the applicant types all answers in the chat box, so focus it
    // after every assistant message. In basic mode the user clicks into the chat box manually
    // — never steal focus from form fields.
    if (assistantMode === "applicant" && AI_CHAT_MODE !== "basic") {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant") {
        setTimeout(() => inputRef.current?.focus(), 120);
      }
    }
  }, [messages]);

  // Focus chat input when opened (not in applicant mode — user types into form fields there).
  // Dep is isOpen only — assistantMode briefly flips to "service-provider" during screen
  // transitions and must not trigger a focus steal while the new applicant screen is mounting.
  useEffect(() => {
    if (isOpen && assistantMode !== "applicant") setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, assistantMode]);

  useEffect(() => {
    if (!isLoading && isOpen && (!suppressChatFocusRef.current || userFocusedChatRef.current)) {
      inputRef.current?.focus();
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Maps form language names (from detectFormLanguage) to BCP-47 codes for comparison
  // against detectedLanguage returned by the backend.
  const FORM_LANG_TO_BCP47 = {
    English: "en",
    Spanish: "es",
    French: "fr",
    Portuguese: "pt",
    Chinese: "zh",
    Arabic: "ar",
    German: "de",
    Italian: "it",
    Korean: "ko",
    Japanese: "ja",
    Vietnamese: "vi",
    Hindi: "hi",
    Russian: "ru",
    Tagalog: "tl",
    Filipino: "tl",
    Polish: "pl",
  };

  // Update the last detected language ref whenever the AI signals a language via [LANG:xx].
  // Also manages translation mode: auto-deactivate when the user returns to the base language,
  // and update the active language when they switch between non-base languages.
  const applyDetectedLanguage = (detectedLanguage) => {
    if (!detectedLanguage) return;
    lastDetectedLanguageRef.current = detectedLanguage;

    // In applicant mode the base language is the form language; in all other modes it's English.
    const formLangCode = FORM_LANG_TO_BCP47[formLanguageRef.current] || "en";

    if (detectedLanguage === formLangCode) {
      // Applicant switched back to form language — deactivate translation mode
      if (translationModeRef.current) {
        translationModeRef.current = null;
        setTranslationMode(null);
      }
    } else if (translationModeRef.current && translationModeRef.current.lang !== detectedLanguage) {
      // Translation mode active but language switched — update to the new language
      const langName = (() => {
        try {
          return new Intl.DisplayNames(["en"], { type: "language" }).of(detectedLanguage) || detectedLanguage;
        } catch {
          return detectedLanguage;
        }
      })();
      const newMode = { lang: detectedLanguage, langName };
      translationModeRef.current = newMode;
      setTranslationMode(newMode);
      tooltipCacheRef.current = {}; // invalidate cached translations for old language
    }
  };

  // Translate a widget-generated string into the most recently detected language
  const wt = (key, ...args) => {
    const lang = lastDetectedLanguageRef.current || "en";
    const val = (WIDGET_STRINGS[lang] || WIDGET_STRINGS.en)[key] ?? WIDGET_STRINGS.en[key] ?? key;
    return typeof val === "function" ? val(...args) : val;
  };

  // When the panel opens in applicant mode, reposition to the bottom-right so the
  // centered form content at the top of the page isn't covered.
  // Clamp height so the panel always fits within the visible viewport.
  useEffect(() => {
    if (!isOpen || assistantMode !== "applicant") return;
    const M = 8;
    const availH = window.innerHeight - headerBottom - M;
    const initH = Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_HEIGHT, availH));
    const availW = window.innerWidth - M * 2;
    const initW = Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_WIDTH, availW));
    const initTop = window.innerHeight - initH - M;
    const initLeft = Math.max(M, window.innerWidth - initW - M);
    panelTargetRef.current = { top: initTop, left: initLeft, width: initW, height: initH };
    setPanelWidth(initW);
    setPanelHeight(initH);
    setPosition({ top: initTop, left: initLeft });
  }, [isOpen, assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close the widget when genuinely navigating back to admin pages.
  //
  // Page navigation causes assistantMode to cycle applicant→service-provider→applicant
  // within a single render cycle. A 150 ms debounce distinguishes this from a genuine
  // exit to admin pages (where the mode stays service-provider permanently).
  const WIDGET_CLOSED_KEY = "ai-widget-user-closed";
  const openedByApplicantRef = useRef(false);
  const modeExitTimerRef = useRef(null);
  useEffect(() => {
    if (assistantMode === "applicant") {
      // Cancel any pending "genuine exit" timer — this was just page navigation.
      clearTimeout(modeExitTimerRef.current);
      modeExitTimerRef.current = null;
      openedByApplicantRef.current = true;
    } else if (openedByApplicantRef.current) {
      // Debounce: give React one render cycle to flip back to "applicant" (page nav).
      // If it does, clearTimeout above cancels this and nothing happens.
      // If it doesn't (genuine admin navigation), close the panel and reset state.
      modeExitTimerRef.current = setTimeout(() => {
        openedByApplicantRef.current = false;
        setIsOpen(false);
        preFillShownRef.current.clear();
        sessionStorage.removeItem(WIDGET_CLOSED_KEY);
      }, 150);
    }
  }, [assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Nudge the FAB down when its home position overlaps a clickable element.
  // Always checks against the home rect (computed from constants) so nudging
  // the button doesn't create a feedback loop.
  useEffect(() => {
    if (isOpen) {
      setFabNudged(false);
      return;
    }

    const FAB_W = 70,
      FAB_H = 70,
      FAB_RIGHT_PX = 64,
      FAB_BOTTOM_PX = 72;

    // Find the real scrolling container — the layout scrolls inside <main>, not the document.
    const findScroller = () => {
      const main = document.querySelector("main");
      if (main && main.scrollHeight > main.clientHeight + 4) return main;
      const de = document.scrollingElement || document.documentElement;
      if (de.scrollHeight > de.clientHeight + 4) return de;
      return null; // page has no scrollable content
    };

    const checkOverlap = () => {
      const scroller = findScroller();

      // Only nudge when actually at the bottom — if there's room to scroll,
      // the user can simply scroll to clear the FAB.
      if (scroller) {
        const distFromBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
        if (distFromBottom > 10) {
          setFabNudged(false);
          return;
        }
      }

      // Sample several points within the FAB's home area.
      // Temporarily disable pointer-events on the FAB so elementFromPoint sees
      // through it — this gives us exactly what would receive a click if the FAB
      // weren't there, respecting z-index and any overlapping layers.
      const homeRight = window.innerWidth - FAB_RIGHT_PX;
      const homeLeft = homeRight - FAB_W;
      const homeBottom = window.innerHeight - FAB_BOTTOM_PX;
      const homeTop = homeBottom - FAB_H;
      const cx = (homeLeft + homeRight) / 2;
      const cy = (homeTop + homeBottom) / 2;
      const samplePoints = [
        [cx, cy],
        [cx - 18, cy - 18],
        [cx + 18, cy - 18],
        [cx - 18, cy + 18],
        [cx + 18, cy + 18],
      ];

      const fab = fabRef.current;
      if (fab) fab.style.pointerEvents = "none";

      const INTERACTIVE = 'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"]';
      let overlaps = false;
      outer: for (const [px, py] of samplePoints) {
        let el = document.elementFromPoint(px, py);
        while (el && el !== document.body) {
          if (el.matches(INTERACTIVE)) {
            overlaps = true;
            break outer;
          }
          el = el.parentElement;
        }
      }

      if (fab) fab.style.pointerEvents = "";
      setFabNudged(overlaps);
    };

    // Use capture:true so scroll events from any container (e.g. <main>) are caught.
    document.addEventListener("scroll", checkOverlap, { passive: true, capture: true });
    window.addEventListener("resize", checkOverlap, { passive: true });
    checkOverlap();
    return () => {
      document.removeEventListener("scroll", checkOverlap, { capture: true });
      window.removeEventListener("resize", checkOverlap);
      setFabNudged(false);
    };
  }, [isOpen, currentScreenId]); // reset on screen navigation too

  // Cycle the language banner text every 3.5 s with a fade-out/fade-in transition.
  useEffect(() => {
    const id = setInterval(() => {
      setBannerFading(true);
      setTimeout(() => {
        setBannerIdx((i) => (i + 1) % LANGUAGES.length);
        setBannerFading(false);
      }, 320);
    }, 3500);
    return () => clearInterval(id);
  }, [assistantMode]);

  // Detect the natural language of the form from its field labels and descriptions.
  // Returns a language name (e.g. "Spanish") for use in the system prompt.
  const detectFormLanguage = (ctx) => {
    const fields = ctx?.currentState?.fields || [];
    const text = [
      ctx?.screenName || "",
      ctx?.description || "",
      ...fields.map((f) => `${f.label || ""} ${f.description || ""} ${f.placeholder || ""}`),
    ].join(" ");
    const len = text.replace(/\s/g, "").length || 1;

    // Non-Latin script detection by Unicode range
    if ((text.match(/[\u0600-\u06FF]/g) || []).length / len > 0.12) return "Arabic";
    if ((text.match(/[\u4E00-\u9FFF]/g) || []).length / len > 0.12) return "Chinese";
    if ((text.match(/[\u3040-\u30FF]/g) || []).length / len > 0.12) return "Japanese";
    if ((text.match(/[\uAC00-\uD7AF]/g) || []).length / len > 0.12) return "Korean";
    if ((text.match(/[\u0400-\u04FF]/g) || []).length / len > 0.12) return "Russian";
    if ((text.match(/[\u0590-\u05FF]/g) || []).length / len > 0.12) return "Hebrew";
    if ((text.match(/[\u0E00-\u0E7F]/g) || []).length / len > 0.12) return "Thai";
    if ((text.match(/[\u0900-\u097F]/g) || []).length / len > 0.12) return "Hindi";

    // Latin-script language detection via common field-label words
    const tl = text.toLowerCase();
    if (/\b(nombre|empresa|dirección|ciudad|país|fecha|teléfono|correo|apellido)\b/.test(tl)) return "Spanish";
    if (/\b(nom|prénom|adresse|entreprise|ville|pays|téléphone|courriel|date)\b/.test(tl)) return "French";
    if (/\b(nome|empresa|endereço|cidade|estado|país|telefone|cpf|cnpj)\b/.test(tl)) return "Portuguese";
    if (/\b(vorname|nachname|unternehmen|anschrift|straße|stadt|land|telefon|datum)\b/.test(tl)) return "German";
    if (/\b(nome|azienda|indirizzo|città|paese|telefono|codice fiscale|data)\b/.test(tl)) return "Italian";

    return "English";
  };

  // Show greeting only on very first open (empty transcript).
  // Guard: after the initial greeting has been shown once, subsequent messages.length===0
  // events are caused by endpoint-change navigation — the screen-change effect handles those.
  useEffect(() => {
    if (!isOpen || messages.length !== 0) return;
    if (initialGreetingShownRef.current) return;
    const ctx = getScreenContext();
    const screenName = ctx?.screenName || "this screen";

    if (assistantMode === "applicant") {
      // Detect form language on first open and store it for all subsequent AI calls
      const detectedLang = detectFormLanguage(ctx);
      formLanguageRef.current = detectedLang;
      if (detectedLang !== "English") lastDetectedLanguageRef.current = detectedLang.toLowerCase().slice(0, 2);

      if (AI_CHAT_MODE === "basic") {
        // Basic mode: passive Q&A only — just greet and offer to answer questions.
        const greetings = {
          Spanish:
            "¡Hola! Soy tu **asistente de solicitud**. Tengo contexto completo sobre esta solicitud y puedo responder cualquier pregunta.\n\nPregúntame lo que necesites sobre el formulario, los requisitos o el proceso.",
          French:
            "Bonjour\u00a0! Je suis votre **assistant de candidature**. J'ai le contexte complet de cette candidature et je peux répondre à toutes vos questions.\n\nN'hésitez pas à me poser des questions sur le formulaire, les exigences ou le processus.",
          Portuguese:
            "Olá! Sou o seu **assistente de candidatura**. Tenho contexto completo sobre esta candidatura e posso responder a qualquer pergunta.\n\nFique à vontade para me perguntar qualquer coisa sobre o formulário, os requisitos ou o processo.",
          German:
            "Hallo! Ich bin Ihr **Bewerbungsassistent**. Ich habe vollständigen Kontext zu dieser Bewerbung und beantworte gerne alle Ihre Fragen.\n\nFragen Sie mich gerne alles zum Formular, den Anforderungen oder dem Ablauf.",
          Italian:
            "Ciao! Sono il tuo **assistente per la domanda**. Ho il contesto completo di questa domanda e posso rispondere a qualsiasi tua domanda.\n\nChiedimi pure qualsiasi cosa sul modulo, i requisiti o il processo.",
          Arabic:
            "مرحباً! أنا **مساعد الطلب** الخاص بك. لدي سياق كامل حول هذا الطلب ويمكنني الإجابة على أي أسئلة لديك.\n\nلا تتردد في سؤالي عن أي شيء يتعلق بالنموذج أو المتطلبات أو العملية.",
          Chinese:
            "你好！我是您的**申请助手**。我对本申请有完整的上下文，可以回答您的任何问题。\n\n欢迎随时询问有关表格、要求或流程的任何问题。",
          Japanese:
            "こんにちは！私はあなたの**申請アシスタント**です。この申請の全情報を把握しており、どんな質問にもお答えします。\n\nフォーム、要件、または手続きについて何でもお気軽にご質問ください。",
          Korean:
            "안녕하세요! 저는 귀하의 **신청 도우미**입니다. 이 신청에 대한 전체 맥락을 파악하고 있으며 모든 질문에 답변드릴 수 있습니다.\n\n양식, 요건 또는 절차에 대해 무엇이든 자유롭게 질문해 주세요.",
          Russian:
            "Привет! Я ваш **помощник по заявке**. У меня есть полный контекст этой заявки, и я могу ответить на любые ваши вопросы.\n\nНе стесняйтесь спрашивать меня о форме, требованиях или процессе.",
        };
        const content =
          ctx?.greeting ||
          greetings[detectedLang] ||
          `Hi! I'm your **application assistant** — I'm here to help you complete your application quickly and accurately.\n\nHere's what I can do:\n- **Answer questions** about any field or requirement\n- **Explain what's needed** for each section\n- **Translate any field or instruction** into your preferred language\n- **Communicate with you in any language** — just start typing in yours\n\nFeel free to ask me anything!`;
        setIntroButtonsDismissed(true);
        addMessage({ role: "assistant", content });
      } else {
        const content =
          ctx?.greeting ||
          `Hi! I'm your **application assistant** — I'm here to guide you through every step of your application.\n\nHere's what I can do:\n- **Walk you through each field** one by one\n- **Fill in your answers** automatically as you describe them\n- **Answer any questions** about requirements or the process\n- **Translate any field or instruction** into your preferred language\n- **Communicate with you in any language** — just start typing in yours\n\nJust type your responses here and I'll take care of the rest!`;
        setIntroButtonsDismissed(true);
        addMessage({ role: "assistant", content });

        // Trigger PAGE_LOAD guidance for the very first screen. Subsequent screen changes
        // are handled by the currentScreenId effect (isScreenChange branch). This covers
        // the case where the widget opens on the initial page before any navigation occurs.
        // Retry with backoff in case the page context hasn't registered yet.
        clearTimeout(autoGuideTimerRef.current);
        let firstPageAttempt = 0;
        const tryFirstPageLoad = () => {
          const firstCtx = getScreenContext();
          const fields = firstCtx?.currentState?.fields;
          const loading = isLoadingRef.current;
          if (!fields?.length || loading) {
            // Fields not ready yet, or AI is still processing the greeting — retry.
            if (firstPageAttempt < 10) {
              firstPageAttempt++;
              autoGuideTimerRef.current = setTimeout(tryFirstPageLoad, 600);
            }
            return;
          }
          // Focus the first empty field, then send [PAGE_SUMMARY] to kick off AI guidance.
          // (The focusin timer is suppressed in max-help mode so we can't rely on [FIELD_FOCUS].)
          isInitialScreenDodgeRef.current = true;
          const focused = focusFirstEmptyField(firstCtx.currentState.fields, { requireRequired: false });
          if (!focused) notifySignatureIfPending(firstCtx.currentState.fields);

          // Mirror the screen-change handler's sendFirstFieldGuidance so the AI activates on
          // the very first screen, regardless of help-level mode.
          setTimeout(() => {
            const latestCtx = getScreenContext();
            const nonSig = latestCtx?.currentState?.fields?.filter((ff) => !ff.isSignature) ?? [];
            const latestFilled = nonSig.filter((ff) => ff.filled).length;
            const latestTotal = nonSig.length;
            if (!latestTotal) return;
            const remaining = latestTotal - latestFilled;
            const stepInfo =
              latestCtx.currentState?.currentStep != null
                ? ` Step ${latestCtx.currentState.currentStep + 1} of ${latestCtx.currentState.totalSteps}.`
                : "";
            const pageHelpContexts = (latestCtx?.currentState?.fields || [])
              .filter((ff) => ff.helpContext)
              .map((ff) => `"${ff.label}": ${ff.helpContext}`)
              .join(" | ");
            const pageHelpNote = pageHelpContexts
              ? ` PAGE FIELD HELP CONTEXTS (use proactively only for the specific focused field, but available for any user question about any field on this page): ${pageHelpContexts}.`
              : "";
            autoGuideRef.current?.(
              `[PAGE_SUMMARY] The applicant has arrived on a new step.${stepInfo}` +
                ` ${latestFilled} of ${latestTotal} field(s) are already filled in.` +
                ` ${remaining > 0 ? `${remaining} field(s) still need input.` : "All fields are filled."}` +
                pageHelpNote,
            );
          }, 50);
        };
        autoGuideTimerRef.current = setTimeout(tryFirstPageLoad, 800);
      }
    } else {
      const content =
        ctx?.greeting ||
        `Hi! I'm your assistant. I can see you're working on **${screenName}**.\n\nWhat would you like to do?`;
      addMessage({ role: "assistant", content });
    }
    initialGreetingShownRef.current = true;
  }, [isOpen, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const executeNavigationHandoff = useCallback(() => {
    const ctx = getScreenContext();
    const task = pendingFollowUpRef.current;
    const handoffMode = pendingHandoffModeRef.current || "task";
    const lastUserMessage =
      pendingHandoffUserMessageRef.current ||
      [...getApiHistory()].reverse().find((m) => m.role === "user")?.content ||
      "";
    pendingFollowUpRef.current = null;
    pendingHandoffModeRef.current = null;
    pendingHandoffUserMessageRef.current = null;
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = null;
    }

    const resolved = resolveNavigationHandoff({
      handoffMode,
      followUpTask: task,
      lastUserMessage: typeof lastUserMessage === "string" ? lastUserMessage : "",
      greeting: ctx?.greeting,
    });

    if (resolved.type === "greeting") {
      addMessage({ role: "assistant", content: resolved.content });
    } else if (resolved.type === "task" && sendMessageRef.current) {
      sendMessageRef.current(resolved.task);
    }
  }, [addMessage, getApiHistory, getScreenContext]);

  // When the active screen changes:
  //   1. Append a new greeting so the user sees the current screen's capabilities.
  //   2. Run any pending cross-page analysis (e.g. branding fetch → create page).
  useEffect(() => {
    if (!currentScreenId) return;

    const isScreenChange = prevScreenIdRef.current !== null && prevScreenIdRef.current !== currentScreenId;
    prevScreenIdRef.current = currentScreenId;

    // Pending analysis takes priority — it adds its own contextual AI message for the new screen.
    if (pendingAnalysisRef.current) {
      const pending = pendingAnalysisRef.current;
      pendingAnalysisRef.current = null;

      const runAnalysis = async () => {
        const ctx = getScreenContext();
        const chatEndpoint = ctx?.aiEndpoint || `${SERVER_URL}/api/ai/branding-chat`;
        const { brandingData, screenshotUrl, url } = pending;
        const visionContent = [
          ...(screenshotUrl ? [{ type: "image_url", image_url: { url: screenshotUrl } }] : []),
          {
            type: "text",
            text: `Here is the full-page screenshot and extracted branding data for ${url}:\n\n${JSON.stringify(brandingData, null, 2)}\n\nThe branding has been automatically applied to the create form. Please analyze the site's visual design — describe the color scheme, typography choices, and overall style — then share specific recommendations to help the user complete and refine the branding configuration.`,
          },
        ];
        setIsLoading(true);
        try {
          const res = await fetch(chatEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              messages: [{ role: "user", content: visionContent }],
              chatMode: AI_CHAT_MODE,
              context: {
                screenId: ctx?.screenId,
                screenName: ctx?.screenName,
                description: ctx?.description,
                currentState: ctx?.currentState,
                logos: ctx?.logos,
                colorPalette: ctx?.colorPalette || undefined,
                customPrompt: aiCustomPrompt || undefined,
              },
            }),
          });
          const data = await res.json();
          console.log("data", data);
          if (!data.success) throw new Error(data.message || "AI request failed");
          if (data.type === "tool_call") {
            await applyToolCall(data.tool, data.args, [{ role: "user", content: visionContent }]);
          } else {
            addMessage({ role: "assistant", content: data.content });
            if (isVoiceModeRef.current) speak(data.content);
          }
        } catch {
          addMessage({ role: "assistant", content: wt("brandingApplied", url) });
        } finally {
          setIsLoading(false);
        }
      };
      runAnalysis();
      return; // analysis message serves as the screen-change update
    }

    // On screen change (not first mount), append the new screen's greeting to the transcript.
    if (isScreenChange) {
      const ctx = getScreenContext();
      const screenName = ctx?.screenName || currentScreenId;

      if (assistantMode === "applicant" && AI_CHAT_MODE !== "basic") {
        // Applicant mode: debounce both the "Now on:" marker and autoGuide so that rapid
        // screen transitions (e.g. email-verified → idmission-qr → ApplicationForm) only
        // produce a single announcement for the final destination.
        const task = pendingFollowUpRef.current;
        const handoffMode = pendingHandoffModeRef.current || "task";
        const handoffUserMessage = pendingHandoffUserMessageRef.current || "";
        pendingFollowUpRef.current = null;
        pendingHandoffModeRef.current = null;
        pendingHandoffUserMessageRef.current = null;
        if (navTimeoutRef.current) {
          clearTimeout(navTimeoutRef.current);
          navTimeoutRef.current = null;
        }
        clearTimeout(autoGuideTimerRef.current);

        // IMMEDIATE: Reset panel position to the right of the form container so it doesn't
        // overlap the display text or first field while the 1000ms debounce settles.
        homePositionRef.current = null;
        {
          const _M = 8;
          const _h = Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_HEIGHT, window.innerHeight - headerBottom - _M));
          const _w = Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_WIDTH, window.innerWidth - _M * 2));
          const _t = window.innerHeight - _h - _M;
          let _l = Math.max(_M, window.innerWidth - _w - _M);
          const nowCtx = getScreenContext();
          if (nowCtx?.formRef?.current) {
            const cr = nowCtx.formRef.current.getBoundingClientRect();
            const rightL = cr.right + _M;
            if (rightL + PANEL_MIN_WIDTH <= window.innerWidth) _l = rightL;
          }
          panelTargetRef.current = { top: _t, left: _l, width: _w, height: _h };
          setPanelWidth(_w);
          setPanelHeight(_h);
          setPosition({ top: _t, left: _l });
        }

        autoGuideTimerRef.current = setTimeout(() => {
          // Re-read context at fire time — this is the real current screen after navigation settles.
          const finalCtx = getScreenContext();
          // If no context is registered yet, the destination page hasn't mounted/registered yet.
          // Do nothing — the screen-change effect will fire again when it does.
          if (!finalCtx) return;
          // If fields haven't been discovered yet (form still loading, branding check pending,
          // or stepsComps not yet built), retry in 800ms. Use !fields?.length so we catch
          // both undefined (discoverFormFields returned empty) and [] — same logic as tryFirstPageLoad.
          // This is purely value-based: field.filled = el.value.trim() !== "" in discoverFormFields,
          // so autofill possibility never factors in — only what's actually in the DOM right now.
          // Sends [FIELD_FOCUS] for the first empty field immediately after "Now on:" —
          // bypasses the 1000ms focusin pause timer which the user may tab through before it fires.
          // Sends an instant page overview after "Now on:" regardless of help-delay settings.
          // The overview fires for every page — pre-filled or not — so the applicant always
          // gets a quick summary of what this step contains before they start filling fields.
          const sendFirstFieldGuidance = (fields, _ctx) => {
            const nonSigFields = fields?.filter((ff) => !ff.isSignature) ?? [];
            if (!nonSigFields.length) return;
            // Settle-detection poller: instead of a fixed delay, wait until field
            // values stop changing for SETTLE_QUIET_MS. Any change resets the quiet
            // timer, so async pre-fills (DB loads, IDMission API, AI analysis) are
            // captured no matter how long they take. Hard floor + cap bound the wait.
            const SETTLE_FLOOR_MS = 300; // never snapshot before this
            const SETTLE_QUIET_MS = 400; // snapshot after this long with no changes
            const SETTLE_CAP_MS = 2500; // always snapshot by this time
            const SETTLE_POLL_MS = 150; // poll interval

            const settleScreenId = getScreenContext()?.screenId;
            const getValuesKey = () =>
              (getScreenContext()?.currentState?.fields ?? [])
                .filter((ff) => !ff.isSignature)
                .map((ff) => `${ff.id}:${ff.filled ? "1" : "0"}`)
                .join(",");

            let settleSettled = false;
            const settleStart = Date.now();
            let lastValuesKey = getValuesKey();
            let quietSince = settleStart;

            const fireSnapshot = () => {
              if (settleSettled) return;
              settleSettled = true;
              const latestCtx = getScreenContext();
              const latestNonSig = latestCtx?.currentState?.fields?.filter((ff) => !ff.isSignature) ?? [];
              const latestFilled = latestNonSig.filter((ff) => ff.filled).length;
              const latestTotal = latestNonSig.length;
              if (!latestTotal) return;
              const stepInfo =
                latestCtx.currentState?.currentStep != null
                  ? ` Step ${latestCtx.currentState.currentStep + 1} of ${latestCtx.currentState.totalSteps}.`
                  : "";
              const remaining = latestTotal - latestFilled;

              // Collect all AI help contexts on this page so the assistant can
              // answer follow-up questions about any field, not just the focused one.
              const pageHelpContexts = (latestCtx?.currentState?.fields || [])
                .filter((ff) => ff.helpContext)
                .map((ff) => `"${ff.label}": ${ff.helpContext}`)
                .join(" | ");
              const pageHelpNote = pageHelpContexts
                ? ` PAGE FIELD HELP CONTEXTS (use proactively only for the specific focused field, but available for any user question about any field on this page): ${pageHelpContexts}.`
                : "";

              // Build CONFIRMED THIS SESSION block.
              // Synthetic keys (starting with "_", e.g. "_otp_email") are resolved to
              // actual field IDs by matching their values against the current page's fields.
              // This ensures the AI can do simple key-based lookups instead of needing to
              // parse and compare values itself — which it does unreliably in practice.
              const enrichedConfirmed = { ...confirmedValuesRef.current };
              const syntheticEntries = Object.entries(confirmedValuesRef.current).filter(([k]) => k.startsWith("_"));
              if (syntheticEntries.length > 0) {
                for (const field of latestNonSig) {
                  if (!field.value || field.isSignature || enrichedConfirmed[field.id] !== undefined) continue;
                  const match = syntheticEntries.find(
                    ([, v]) =>
                      v && typeof v === "string" && v.trim().toLowerCase() === String(field.value).trim().toLowerCase(),
                  );
                  if (match) enrichedConfirmed[field.id] = match[1];
                }
              }
              const cvEntries = Object.entries(enrichedConfirmed);
              const cvBlock =
                cvEntries.length > 0
                  ? ` [CONFIRMED THIS SESSION: ${cvEntries.map(([k, v]) => `${k}="${v}"`).join(", ")}]`
                  : "";
              // Snapshot which fields are empty at settle time. Fields filled after
              // this point (e.g. IDMission mid-session fills) land in EMPTY_AT_SCAN
              // and are collected in Step 2; fields filled before settle time are
              // excluded and appear in the Step 1 pre-filled confirmation table.
              const emptyAtScan = latestNonSig.filter((ff) => !ff.filled && !ff.isSignature).map((ff) => ff.id);
              const emptyAtScanBlock = emptyAtScan.length > 0 ? ` [EMPTY_AT_SCAN: ${emptyAtScan.join(",")}]` : "";
              autoGuideRef.current?.(
                `[PAGE_SUMMARY] The applicant has arrived on a new step.${stepInfo}` +
                  ` ${latestFilled} of ${latestTotal} field(s) are already filled in.` +
                  ` ${remaining > 0 ? `${remaining} field(s) still need input.` : "All fields are filled."}` +
                  emptyAtScanBlock +
                  cvBlock +
                  pageHelpNote,
              );
            };

            const pollSettle = () => {
              if (settleSettled) return;
              const now = Date.now();
              // Stop if the user navigated away before we settled
              if (getScreenContext()?.screenId !== settleScreenId) {
                settleSettled = true;
                return;
              }
              // Hard cap
              if (now - settleStart >= SETTLE_CAP_MS) {
                fireSnapshot();
                return;
              }
              // Detect changes and reset quiet window
              const currentKey = getValuesKey();
              if (currentKey !== lastValuesKey) {
                lastValuesKey = currentKey;
                quietSince = now;
              }
              // Hold snapshot while any field is still being populated by an async AI process
              if (document.querySelector('[data-ai-loading="true"]')) {
                quietSince = now;
              }
              // Fire once floor has passed and quiet window has held
              if (now - settleStart >= SETTLE_FLOOR_MS && now - quietSince >= SETTLE_QUIET_MS) {
                fireSnapshot();
                return;
              }
              setTimeout(pollSettle, SETTLE_POLL_MS);
            };

            setTimeout(pollSettle, SETTLE_POLL_MS);
          };

          if (!finalCtx.currentState?.fields?.length) {
            // Distinguish: fields=[] (page has no fields by design, e.g. QR scan) vs
            // fields=undefined (form still loading). If explicitly empty, add a short guard
            // delay before announcing — some screens (e.g. idmission-qr) redirect away within
            // a second or two, and we don't want to fire guidance for a transient page.
            if (Array.isArray(finalCtx.currentState?.fields)) {
              const guardedScreenId = finalCtx.screenId;
              autoGuideTimerRef.current = setTimeout(() => {
                const reCheckCtx = getScreenContext();
                // If the screen changed since we first saw it, skip — the new screen will handle it.
                if (!reCheckCtx || reCheckCtx.screenId !== guardedScreenId) return;
                const finalName = reCheckCtx.screenName || reCheckCtx.screenId || "Application Form";
                announceScreen(finalName);
                lastAutoGuidedRef.current = { screenId: guardedScreenId, at: Date.now() };
                autoGuideRef.current?.(
                  `[PAGE_SUMMARY] The applicant has arrived on: ${finalName}. This page has no form fields — guide them through whatever action this step requires.`,
                );
              }, 600);
              return;
            }
            // fields=undefined — form still loading. Retry in 800ms.
            autoGuideTimerRef.current = setTimeout(() => {
              const retryCtx = getScreenContext();
              const retryName = retryCtx?.screenName || retryCtx?.screenId || "Application Form";
              if (!retryCtx) return;
              if (!retryCtx.currentState?.fields?.length) {
                // Still no fields after retry — treat as a no-field page.
                announceScreen(retryName);
                lastAutoGuidedRef.current = { screenId: retryCtx.screenId, at: Date.now() };
                autoGuideRef.current?.(
                  `[PAGE_SUMMARY] The applicant has arrived on: ${retryName}. This page has no form fields — guide them through whatever action this step requires.`,
                );
                return;
              }
              isInitialScreenDodgeRef.current = true;
              const retryFocused = focusFirstEmptyField(retryCtx.currentState.fields, { requireRequired: false });
              if (!retryFocused) notifySignatureIfPending(retryCtx.currentState.fields);
              announceScreen(retryName);
              lastAutoGuidedRef.current = { screenId: retryCtx.screenId, at: Date.now() };
              sendFirstFieldGuidance(retryCtx.currentState.fields, retryCtx);
            }, 800);
            return;
          }
          const finalName = finalCtx.screenName || finalCtx.screenId || "Application Form";
          // Guard: if we already fired autoGuide for this screen within the last 3 seconds,
          // skip to prevent double-guidance when goToNextStep or other tools re-trigger the handler.
          // 3 seconds is long enough to block a race but short enough to allow the user to
          // navigate away and return to the same screen normally.
          const { screenId: lastSid, at: lastAt } = lastAutoGuidedRef.current;
          if (lastSid === finalCtx.screenId && Date.now() - lastAt < 3000) return;
          isInitialScreenDodgeRef.current = true;
          const finalFocused = focusFirstEmptyField(finalCtx.currentState.fields, { requireRequired: false });
          if (!finalFocused) notifySignatureIfPending(finalCtx.currentState.fields);
          announceScreen(finalName);
          lastAutoGuidedRef.current = { screenId: finalCtx.screenId, at: Date.now() };
          sendFirstFieldGuidance(finalCtx.currentState.fields, finalCtx);
          const handoffResolved = resolveNavigationHandoff({
            handoffMode,
            followUpTask: task,
            lastUserMessage: handoffUserMessage,
            greeting: finalCtx?.greeting,
          });
          if (handoffResolved.type === "greeting") {
            addMessage({ role: "assistant", content: handoffResolved.content });
          } else if (handoffResolved.type === "task" && sendMessageRef.current) {
            sendMessageRef.current(handoffResolved.task);
          }
        }, 1000);
      } else {
        // Basic applicant mode: only post a silent divider — no proactive greeting.
        // Service-provider mode: post the screen name + greeting as before.
        if (assistantMode === "applicant" && AI_CHAT_MODE === "basic") {
          // Guard: some screens (e.g. idmission-qr) are transient — they redirect away
          // within a second or two. Delay the divider so we don't announce a screen the
          // user never actually reaches.
          const guardedScreenId = ctx?.screenId || currentScreenId;
          clearTimeout(autoGuideTimerRef.current);
          autoGuideTimerRef.current = setTimeout(() => {
            const reCheckCtx = getScreenContext();
            if (!reCheckCtx || reCheckCtx.screenId !== guardedScreenId) return;
            announceScreen(screenName);
          }, 600);
        } else {
          const isHandoff = !!pendingFollowUpRef.current || pendingHandoffModeRef.current === "greeting";
          if (isHandoff) {
            addMessage({ role: "assistant", content: `--- **Now on: ${screenName}** ---` });
          } else {
            addMessage({ role: "assistant", content: `--- **Now on: ${screenName}** ---\n\nSwitched to **${screenName}**.` });
          }
        }
        if (pendingFollowUpRef.current || pendingHandoffModeRef.current) {
          setTimeout(() => executeNavigationHandoff(), 600);
        }
      }
    }
  }, [currentScreenId]);

  // When form data loads (or fails) after selectFormForEditing, auto-continue the conversation
  useEffect(() => {
    if (!pendingFormContinuationRef.current) return;
    const { toolArgs, history } = pendingFormContinuationRef.current;
    pendingFormContinuationRef.current = null;

    const ctx = getScreenContext();

    const chatEndpoint = ctx?.aiEndpoint || `${SERVER_URL}/api/ai/branding-chat`;

    // Build the function result — either success or a descriptive error
    let toolResult;
    if (ctx?.currentState?.detailedForm) {
      toolResult = "Form details loaded. The complete section and field structure is now available in context.";
    } else {
      const forms = ctx?.currentState?.forms || [];
      const formList = forms
        .map(
          (f) =>
            `"${f.name}"${f.headerText && f.headerText !== f.name ? ` (displayed as "${f.headerText}")` : ""} [${f._id}]`,
        )
        .join(", ");
      toolResult = `Error: Form with ID "${toolArgs.formId}" was not found — it may have been deleted or renamed. Available forms: ${formList || "none"}. Please use a valid form ID from this list and retry.`;
    }

    const continuationHistory = [
      ...history,
      {
        role: "assistant",
        content: null,
        function_call: { name: "selectFormForEditing", arguments: JSON.stringify(toolArgs) },
      },
      { role: "function", name: "selectFormForEditing", content: toolResult },
    ];

    const runContinuation = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(chatEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            messages: continuationHistory,
            chatMode: AI_CHAT_MODE,
            context: {
              screenId: ctx.screenId,
              screenName: ctx.screenName,
              description: ctx.description,
              currentState: ctx.currentState,
              logos: ctx.logos,
              colorPalette: ctx?.colorPalette || undefined,
              customPrompt: aiCustomPrompt || undefined,
            },
          }),
        });
        const data = await res.json();
        console.log("data", data);
        if (!data.success) throw new Error(data.message || "AI request failed");
        if (data.type === "tool_call") {
          await applyToolCall(data.tool, data.args, continuationHistory);
        } else {
          addMessage({ role: "assistant", content: data.content });
          if (isVoiceModeRef.current) speak(data.content);
        }
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("formNotLoaded")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    runContinuation();
  }, [formDataSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- AI messaging ----------

  // After a save tool completes, send the function result back to the AI so it can
  // chain a follow-up action (e.g. navigation) from the same user request.
  const continueAfterToolCall = async (toolName, toolArgs, resultSummary, currentHistory, chatEndpoint, ctx) => {
    const toolTurns = [
      { role: "assistant", content: null, function_call: { name: toolName, arguments: JSON.stringify(toolArgs) } },
      { role: "function", name: toolName, content: resultSummary },
    ];
    appendApiHistory(toolTurns);
    const toolResultHistory = [...getApiHistory()];
    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          buildChatPayload({
            messages: toolResultHistory,
            ctx,
            assistantMode,
            customPrompt: aiCustomPrompt,
            formLanguage: formLanguageRef.current,
          }),
        ),
      });
      const data = await res.json();
      console.log("data", data);
      if (!data.success) throw new Error(data.message || "AI request failed");
      if (data.type === "tool_call") {
        // Guard: if the screen changed since the AI was sent this context, discard the tool call.
        // This prevents stale responses (e.g. goToNextStep after OTP verification) from acting
        // on the wrong page after navigation has already occurred.
        const postToolCtx = getScreenContext();
        if (postToolCtx?.screenId !== ctx?.screenId) return;
        await applyToolCall(data.tool, data.args, toolResultHistory);
        if (data.tool === "enterTranslationMode") {
          applyDetectedLanguage(translationModeRef.current?.lang ?? data.detectedLanguage);
        } else {
          applyDetectedLanguage(data.detectedLanguage);
        }
      } else {
        applyDetectedLanguage(data.detectedLanguage);
        const assistantContent = data.content || toolArgs.explanation;
        appendApiHistory({ role: "assistant", content: assistantContent });
        addMessage({ role: "assistant", content: assistantContent });
        if (isVoiceModeRef.current) speak(assistantContent);
        // Dodge toward the next unfilled field so the panel doesn't cover the field the AI is about to address.
        if (assistantMode === "applicant" && ctx?.currentState?.fields) {
          const nextField = ctx.currentState.fields.find((f) => !f.filled && !f.isSignature);
          if (nextField) {
            const nextEl =
              document.getElementById(nextField.id) ||
              document.querySelector(`[name="${CSS.escape(nextField.id)}"]`) ||
              document.querySelector(`[data-ai-id="${CSS.escape(nextField.id)}"]`);
            if (nextEl) setTimeout(() => dodgeForField(nextEl), 150);
          }
        }
      }
    } catch {
      // Fall back to just showing the explanation
      addMessage({ role: "assistant", content: toolArgs.explanation });
      if (isVoiceModeRef.current) speak(toolArgs.explanation);
    }
  };

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  // Uses direct scrollTop assignment on the messages container — more reliable
  // than scrollIntoView which can be intercepted by ancestor scroll handlers.
  // Adds the "Now on: X" screen announcement and, if translation mode is active,
  // fetches and appends a translated version of the screen name.
  const announceScreen = async (name) => {
    const tm = translationModeRef.current;
    if (!tm) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/ai/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: name, targetLang: tm.lang, targetLangName: tm.langName }),
      });
      const data = await res.json();
      if (data.success && data.translation) {
        addMessage({ role: "assistant", content: `*(${tm.langName}: **${data.translation}**)* ` });
      }
    } catch {
      // silently ignore translation errors — the English announcement already posted
    }
  };

  // ── Hover-translation tooltip ─────────────────────────────────────────────
  // When translation mode is active, hovering a <label> shows its translated
  // text in a small fixed tooltip. Translations are cached to avoid re-fetching.
  useEffect(() => {
    if (!translationMode) {
      setTranslationTooltip(null);
      tooltipTargetRef.current = null;
      clearTimeout(tooltipTimerRef.current);
      return;
    }

    const { lang, langName } = translationMode;

    // Find a reasonable text block near the cursor. Prefer innermost short text;
    // also accept semantic tags and direct text nodes when walking up.
    const TEXT_TAGS = new Set([
      "LABEL", "BUTTON", "A", "TH", "TD", "SPAN", "P",
      "H1", "H2", "H3", "H4", "H5", "H6", "LI", "DT", "DD", "FIGCAPTION", "LEGEND",
    ]);
    const MAX_HOVER_TEXT = 200;

    const findInnerTextEl = (start) => {
      if (!start || start.nodeType !== Node.ELEMENT_NODE) return null;
      let node = start;
      while (node.children.length === 1) {
        const child = node.children[0];
        if (!child || child.nodeType !== Node.ELEMENT_NODE) break;
        node = child;
      }
      const text = node.textContent?.trim() ?? "";
      return text.length > 1 && text.length <= MAX_HOVER_TEXT ? node : null;
    };

    const getTextBlock = (el) => {
      if (!el || el.nodeType !== Node.ELEMENT_NODE) return null;
      if (panelRef.current?.contains(el)) return null;
      if (["INPUT", "TEXTAREA", "SELECT", "SVG"].includes(el.tagName)) return null;

      const inner = findInnerTextEl(el);
      if (inner && !panelRef.current?.contains(inner)) return inner;

      let node = el;
      while (node && node !== document.body) {
        if (node === panelRef.current) return null;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(node.tagName)) return null;

        const text = node.textContent?.trim() ?? "";
        if (text.length > 1 && text.length <= MAX_HOVER_TEXT) {
          const hasDirectText = Array.from(node.childNodes).some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim().length > 1,
          );
          if (hasDirectText || TEXT_TAGS.has(node.tagName)) return node;
        }
        node = node.parentElement;
      }
      return null;
    };

    const handleMouseOver = (e) => {
      const label = getTextBlock(e.target);
      if (!label) return;
      if (label === tooltipTargetRef.current) return; // still on same block

      clearTimeout(tooltipTimerRef.current);
      tooltipTargetRef.current = label;
      setTranslationTooltip(null);

      const text = label.textContent?.trim();
      if (!text) return;

      // Capture cursor position now — used for tooltip placement so it appears
      // near the hovered text regardless of how wide the ancestor container is.
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      tooltipTimerRef.current = setTimeout(async () => {
        if (tooltipTargetRef.current !== label) return; // moved away

        const x = mouseX;
        const y = mouseY - 12;

        // Show cached value immediately if available
        if (tooltipCacheRef.current[text]) {
          setTranslationTooltip({ text: tooltipCacheRef.current[text], x, y });
          return;
        }

        try {
          const res = await fetch(`${SERVER_URL}/api/ai/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, targetLang: lang, targetLangName: langName }),
          });
          const data = await res.json();
          if (data.success && data.translation) {
            tooltipCacheRef.current[text] = data.translation;
            if (tooltipTargetRef.current === label) {
              setTranslationTooltip({ text: data.translation, x, y });
            }
          }
        } catch {
          /* silently ignore */
        }
      }, 400);
    };

    const handleMouseOut = (e) => {
      const current = tooltipTargetRef.current;
      if (!current) return;
      const relatedTarget = e.relatedTarget;
      // Mouse moved into the tracked element or a descendant — keep timer alive
      if (relatedTarget && (current === relatedTarget || current.contains(relatedTarget))) return;
      clearTimeout(tooltipTimerRef.current);
      tooltipTargetRef.current = null;
      setTranslationTooltip(null);
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      clearTimeout(tooltipTimerRef.current);
      tooltipTargetRef.current = null;
      setTranslationTooltip(null);
    };
  }, [translationMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = useCallback((instant = false) => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (instant) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, []);

  // ── Panel dodge helpers ────────────────────────────────────────────────────

  const rectsOverlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  // Move the panel out of the way of `el` if they overlap.
  //
  // Evaluates all four available regions (left / right / above / below the field)
  // and picks the one where the panel fits best. Within the chosen region:
  //   - Width and height are capped to the available space.
  //   - When one dimension must shrink, the other is expanded proportionally
  //     (up to the region limit) so total panel area stays as large as possible.
  //   - A shrunken dimension never goes below PANEL_MIN_WIDTH / PANEL_MIN_HEIGHT.
  //
  // Saves the original position + dimensions to homePositionRef so they can
  // be fully restored when the panel is no longer overlapping.
  const dodgeForField = (el) => {
    if (!el || !panelRef.current) return;
    // Use the TARGET position (where the panel was last told to go) rather than
    // getBoundingClientRect(), which returns the mid-animation visual position.
    const t = panelTargetRef.current;
    const panelRect = { top: t.top, left: t.left, right: t.left + t.width, bottom: t.top + t.height };

    // Build the avoid-zone: start with the field, then union in its label and adjacent button.
    let fieldRect = el.getBoundingClientRect();

    // Radio buttons: the focused element is a tiny circle; expand to cover the entire group
    // (all options + their label text) by finding the closest ancestor that contains all
    // same-name inputs.
    if (el.type === "radio" && el.name) {
      const totalInDoc = document.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`).length;
      let container = el.parentElement;
      for (let depth = 0; depth < 8; depth++) {
        if (!container || container === document.body) break;
        if (container.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`).length >= totalInDoc) {
          const cr = container.getBoundingClientRect();
          fieldRect = { left: cr.left, right: cr.right, top: cr.top, bottom: cr.bottom };
          break;
        }
        container = container.parentElement;
      }
    }

    // Signature fields: the sign_text (attestation paragraph) is rendered as a previous sibling
    // of the [data-ai-type="sign"] wrapper, so union it in so the panel never covers it.
    if (el.getAttribute?.("data-ai-type") === "sign") {
      let sib = el.previousElementSibling;
      while (sib) {
        const sr = sib.getBoundingClientRect();
        if (sr.height > 0) {
          fieldRect = {
            left: Math.min(fieldRect.left, sr.left),
            right: Math.max(fieldRect.right, sr.right),
            top: Math.min(fieldRect.top, sr.top),
            bottom: Math.max(fieldRect.bottom, sr.bottom),
          };
        }
        sib = sib.previousElementSibling;
      }
    }

    const elTag = el.tagName || "?";
    const elId = el.id || el.getAttribute?.("data-ai-id") || "(no id)";
    console.log(
      `[DODGE] field: <${elTag}> id="${elId}" fieldRect={top:${fieldRect.top.toFixed(0)}, bot:${fieldRect.bottom.toFixed(0)}, left:${fieldRect.left.toFixed(0)}, right:${fieldRect.right.toFixed(0)}} panelRect={top:${panelRect.top.toFixed(0)}, bot:${panelRect.bottom.toFixed(0)}, left:${panelRect.left.toFixed(0)}, right:${panelRect.right.toFixed(0)}}`,
    );

    // Include the field's label so it is never covered.
    // Use only field-specific selectors to avoid accidentally grabbing labels for other fields.
    let labelEl = el.closest(".input-box")?.querySelector("h4") ?? null;
    if (!labelEl && el.id) {
      labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    }
    if (labelEl) {
      const lr = labelEl.getBoundingClientRect();
      console.log(
        `[DODGE] label found: <${labelEl.tagName}> text="${labelEl.textContent?.trim().slice(0, 40)}" rect={top:${lr.top.toFixed(0)}, bot:${lr.bottom.toFixed(0)}}`,
      );
      fieldRect = {
        left: Math.min(fieldRect.left, lr.left),
        right: Math.max(fieldRect.right, lr.right),
        top: Math.min(fieldRect.top, lr.top),
        bottom: Math.max(fieldRect.bottom, lr.bottom),
      };
    } else {
      console.log(`[DODGE] label: none found`);
    }

    // Include any adjacent button (e.g. "Send Code", "Verify", submit).
    // Only include if the button is within 100px of the field vertically — this prevents
    // distant UI buttons (e.g. "Enable Help" further down the page) from inflating the avoid-zone.
    const adjBtn = findAdjacentButton(el);
    if (adjBtn) {
      const btnRect = adjBtn.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const vertGap = Math.max(0, btnRect.top - elRect.bottom, elRect.top - btnRect.bottom);
      if (vertGap <= 100) {
        console.log(
          `[DODGE] button found: "${adjBtn.textContent?.trim().slice(0, 30)}" rect={top:${btnRect.top.toFixed(0)}, bot:${btnRect.bottom.toFixed(0)}}`,
        );
        fieldRect = {
          left: Math.min(fieldRect.left, btnRect.left),
          right: Math.max(fieldRect.right, btnRect.right),
          top: Math.min(fieldRect.top, btnRect.top),
          bottom: Math.max(fieldRect.bottom, btnRect.bottom),
        };
      } else {
        console.log(
          `[DODGE] button: found "${adjBtn.textContent?.trim().slice(0, 30)}" but ${vertGap.toFixed(0)}px away — skipping`,
        );
      }
    } else {
      console.log(`[DODGE] button: none found`);
    }

    // On the first field focus after a screen change, extend the avoid-zone to cover the form's
    // display text (from form container top down to the first field). This prevents the panel
    // from overlapping critical instructional text that appears above the first field on render.
    if (isInitialScreenDodgeRef.current) {
      isInitialScreenDodgeRef.current = false;
      const nowCtx = getScreenContext();
      if (nowCtx?.formRef?.current) {
        const cr = nowCtx.formRef.current.getBoundingClientRect();
        if (cr.top < fieldRect.top) fieldRect = { ...fieldRect, top: cr.top };
      }
    }

    console.log(
      `[DODGE] avoidRect after unions: {top:${fieldRect.top.toFixed(0)}, bot:${fieldRect.bottom.toFixed(0)}, left:${fieldRect.left.toFixed(0)}, right:${fieldRect.right.toFixed(0)}}`,
    );

    if (!rectsOverlap(panelRect, fieldRect)) {
      console.log(`[DODGE] no overlap — skipping move`);
      return;
    }

    // Save home once — subsequent calls while already dodging preserve the original home.
    if (!homePositionRef.current) {
      homePositionRef.current = {
        top: panelRect.top,
        left: panelRect.left,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
      };
    }

    const M = 8; // margin from viewport edges and field edges
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // The four candidate regions around the field
    const regions = [
      { id: "right", left: fieldRect.right + M, top: M, w: vw - fieldRect.right - M * 2, h: vh - M * 2 },
      { id: "left", left: M, top: M, w: fieldRect.left - M * 2, h: vh - M * 2 },
      { id: "below", left: M, top: fieldRect.bottom + M, w: vw - M * 2, h: vh - fieldRect.bottom - M * 2 },
      { id: "above", left: M, top: M, w: vw - M * 2, h: fieldRect.top - M * 2 },
    ];

    // Score each region: prefer regions that need the least shrinking
    const scored = regions
      .filter((r) => r.w >= PANEL_MIN_WIDTH && r.h >= PANEL_MIN_HEIGHT)
      .map((r) => {
        const fitW = Math.min(PANEL_WIDTH, r.w);
        const fitH = Math.min(PANEL_HEIGHT, r.h);
        return { ...r, fitW, fitH, score: fitW * fitH };
      })
      .sort((a, b) => b.score - a.score);

    regions.forEach((r) => {
      const pass = r.w >= PANEL_MIN_WIDTH && r.h >= PANEL_MIN_HEIGHT;
      const s = scored.find((s) => s.id === r.id);
      console.log(
        `[DODGE] region ${r.id}: w=${r.w.toFixed(0)} h=${r.h.toFixed(0)} ${pass ? `PASS score=${s?.score.toFixed(0)}` : "FILTERED (too small)"}`,
      );
    });

    // Pick the best usable region, or fall back to the largest raw region
    const best =
      scored[0] ??
      regions
        .map((r) => ({
          ...r,
          fitW: Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_WIDTH, r.w)),
          fitH: Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_HEIGHT, r.h)),
          score: r.w * r.h,
        }))
        .sort((a, b) => b.score - a.score)[0];

    console.log(`[DODGE] chosen region: ${best.id}`);

    // Compensate: if one dimension is compressed, expand the other proportionally
    // to preserve as much panel area as possible, capped to the region.
    let newW = best.fitW;
    let newH = best.fitH;
    const targetArea = PANEL_WIDTH * PANEL_HEIGHT;
    if (newW < PANEL_WIDTH && newH > 0) {
      newH = Math.min(best.h, Math.max(newH, Math.ceil(targetArea / newW)));
    }
    if (newH < PANEL_HEIGHT && newW > 0) {
      newW = Math.min(best.w, Math.max(newW, Math.ceil(targetArea / newH)));
    }
    newW = Math.max(PANEL_MIN_WIDTH, Math.min(best.w, newW));
    newH = Math.max(PANEL_MIN_HEIGHT, Math.min(best.h, newH));

    // Position the panel within the chosen region
    let newLeft = best.left;
    let newTop = best.top;
    if (best.id === "left") newLeft = Math.max(M, fieldRect.left - newW - M);
    if (best.id === "right") newLeft = fieldRect.right + M;
    if (best.id === "above") newTop = Math.max(M, fieldRect.top - newH - M);
    if (best.id === "below") newTop = fieldRect.bottom + M;

    // For vertical regions (above/below), maintain horizontal position if possible
    if (best.id === "above" || best.id === "below") {
      newLeft = Math.max(M, Math.min(vw - newW - M, panelRect.left));
    }
    // For horizontal regions (left/right), center vertically on the field
    if (best.id === "left" || best.id === "right") {
      const fieldCY = (fieldRect.top + fieldRect.bottom) / 2;
      newTop = Math.max(M, Math.min(vh - newH - M, fieldCY - newH / 2));
    }

    // Final viewport clamp — ensure the panel never goes off-screen regardless of region logic.
    newTop = Math.max(M, Math.min(vh - newH - M, newTop));
    newLeft = Math.max(M, Math.min(vw - newW - M, newLeft));

    console.log(
      `[DODGE] → move to top=${newTop.toFixed(0)} left=${newLeft.toFixed(0)} w=${newW.toFixed(0)} h=${newH.toFixed(0)}`,
    );
    panelTargetRef.current = { top: newTop, left: newLeft, width: newW, height: newH };
    setPanelWidth(newW);
    setPanelHeight(newH);
    setPosition({ top: newTop, left: newLeft });
    // After the panel repositions/resizes, scroll the messages list to the bottom
    // so the most recent message stays visible in the new layout.
    setTimeout(() => scrollToBottom(), 50);
  };

  // Restore panel to its home size and position.
  // Skips restore if the home position would still overlap the next unfilled field.
  const restoreHomePosition = (fields, afterFieldId) => {
    if (!homePositionRef.current) return;
    const home = homePositionRef.current;
    const rW = home.width ?? PANEL_WIDTH;
    const rH = home.height ?? PANEL_HEIGHT;
    const homeRect = { left: home.left, top: home.top, right: home.left + rW, bottom: home.top + rH };
    if (afterFieldId && fields?.length) {
      const idx = fields.findIndex((f) => f.id === afterFieldId);
      const nextDirect = fields.slice(idx + 1).find((f) => f.directEntry && !f.filled);
      if (nextDirect) {
        const nextEl =
          document.getElementById(nextDirect.id) || document.querySelector(`[name="${CSS.escape(nextDirect.id)}"]`);
        if (nextEl && rectsOverlap(homeRect, nextEl.getBoundingClientRect())) return;
      }
    }
    panelTargetRef.current = { top: home.top, left: home.left, width: rW, height: rH };
    setPanelWidth(rW);
    setPanelHeight(rH);
    setPosition({ top: home.top, left: home.left });
    homePositionRef.current = null;
  };

  // ── end panel dodge helpers ────────────────────────────────────────────────

  const applyToolCall = createApplyToolCall({
    getScreenContext,
    assistantMode,
    addMessage,
    isVoiceModeRef,
    speak,
    wt,
    aiCustomPrompt,
    continueAfterToolCall,
    pushRevertable,
    popRevertable,
    navigate,
    setIsLoading,
    setAdePanel,
    adePanelCallbackRef,
    confirmedValuesRef,
    signalContinuationPending,
    pendingFormContinuationRef,
    appendApiHistory,
    dodgeForField,
    scrollToBottom,
    setPreFillModal,
    preFillShownRef,
    setFieldErrorModal,
    confirmedErrorsRef,
    pendingFieldErrorRef,
    blockedClickTargetRef,
    navTimeoutRef,
    pendingFollowUpRef,
    pendingHandoffModeRef,
    pendingHandoffUserMessageRef,
    formLanguageRef,
    setIsOpen,
    getApiHistory,
    setPendingHandoffHistory,
    activatedFieldIdRef,
    inputRef,
    panelRef,
    homePositionRef,
    setIntroButtonsDismissed,
    introButtonsDismissed,
    pendingAnalysisRef,
    setOverlayContext,
    triggerAutoMessage: _triggerAutoMessage,
    translationModeRef,
    setTranslationMode,
    tooltipCacheRef,
    lastDetectedLanguageRef,
  });

  // ── Assisted Direct Entry (ADE) panel callbacks ────────────────────────────
  const handleAdePanelComplete = useCallback(
    async (value) => {
      const pending = adePanelCallbackRef.current;
      if (!pending) return;
      adePanelCallbackRef.current = null;
      setAdePanel(null);

      const { args, history, ctx } = pending;
      const { fieldId } = args;
      const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
      const fieldLabel = fieldMeta?.label || fieldId;
      const fieldMode = fieldMeta?.fieldMode || "direct";
      const defaultEndpoint =
        assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-chat` : `${SERVER_URL}/api/ai/branding-chat`;
      const chatEndpoint = ctx?.aiEndpoint || defaultEndpoint;

      if (fieldMode === "secure") {
        // Fill DOM directly — value never travels to AI server
        if (ctx.actions.fillField) {
          await ctx.actions.fillField({ fieldId, value });
        }
        const patchedCtx = {
          ...ctx,
          currentState: {
            ...ctx.currentState,
            fields:
              ctx.currentState?.fields?.map((f) =>
                f.id === fieldId ? { ...f, value: "[secure]", filled: true } : f,
              ) ?? [],
          },
        };
        await continueAfterToolCall(
          "openFieldPanel",
          args,
          `SECURE_PANEL_COMPLETE: Field "${fieldLabel}" was filled securely. The value was captured locally and was NOT transmitted to AI — do not ask for or repeat it. Mark this field as complete and move to the next field in list order.`,
          history,
          chatEndpoint,
          patchedCtx,
        );
      } else {
        // Direct entry — use provided value (read from DOM by ADEPanel)
        const filledValue = value || "";

        // Detect whether this is a Google Places field (for result summary messaging).
        const targetEl = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
        const isPlaces =
          targetEl?.getAttribute?.("data-ai-type") === "places" || !!targetEl?.closest?.("[data-places-input]");

        // For Places fields: React may not have committed city/state/zip/country values
        // to the DOM yet (onPlaceChanged -> setState -> async re-render).  Wait long enough
        // for the commit to land before we read any DOM values.
        if (isPlaces) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }

        // Always re-read ALL field values from the live DOM when building patchedFields.
        // The ctx snapshot saved in adePanelCallbackRef may be stale — e.g. Google Places
        // auto-fills city/state/zip/country after the snapshot was taken.  Reading the DOM
        // here ensures every subsequent AI turn sees the true current field state.
        const patchedFields =
          ctx.currentState?.fields?.map((f) => {
            if (f.id === fieldId) return { ...f, value: filledValue, filled: !!filledValue };
            if (f.isSignature) return f; // no standard input element
            let domValue, domFilled;
            if (f.type === "radio") {
              const checked = document.querySelector(`input[name="${CSS.escape(f.id)}"]:checked`);
              domValue = checked?.value || "";
              domFilled = !!domValue;
            } else {
              const el = document.getElementById(f.id) || document.querySelector(`[name="${CSS.escape(f.id)}"]`);
              if (!el) return f;
              if (f.type === "checkbox") {
                domValue = el.checked ? "true" : "false";
                domFilled = el.checked;
              } else {
                domValue = el.value || "";
                const isPhone =
                  f.type === "tel" || /phone|mobile|cell/i.test(f.id || "") || /phone|mobile|cell/i.test(el.name || "");
                domFilled = isPhone ? (domValue.match(/\d/g) || []).length >= 7 : !!domValue.trim();
              }
            }
            return { ...f, value: domValue, filled: domFilled };
          }) ?? [];

        const patchedCtx = {
          ...ctx,
          currentState: { ...ctx.currentState, fields: patchedFields },
        };

        const isRequired = fieldMeta?.required ?? false;

        // Record every panel completion in confirmedValuesRef so the Step 2
        // EMPTY_AT_SCAN check doesn't re-collect this field next turn.
        // Includes Places fields — the street address field itself is never written
        // by fillField in the Places flow, so it must be recorded here.
        if (filledValue) {
          confirmedValuesRef.current[fieldId] = filledValue;
        }

        // When Places fills address sub-fields, record them in confirmedValuesRef so the
        // Step 2 EMPTY_AT_SCAN check treats them as already-confirmed and skips them.
        if (isPlaces) {
          const originalFields = ctx.currentState?.fields ?? [];
          for (const pf of patchedFields) {
            if (pf.id === fieldId) continue; // primary field already recorded above
            if (!pf.filled || !pf.value) continue;
            const original = originalFields.find((f) => f.id === pf.id);
            if (!original?.filled) {
              confirmedValuesRef.current[pf.id] = pf.value;
            }
          }
        }

        // For Places completions, append a fresh CONFIRMED block so the AI sees the
        // newly-recorded city/state/zip/country values and skips them in Step 2.
        const placesConfirmedBlock = (() => {
          if (!isPlaces) return "";
          const entries = Object.entries(confirmedValuesRef.current);
          return entries.length > 0
            ? ` [CONFIRMED THIS SESSION: ${entries.map(([k, v]) => `${k}="${v}"`).join(", ")}]`
            : "";
        })();

        const resultSummary = isPlaces
          ? `PLACES_COMPLETE: Google Places address selected — "${filledValue}". Address sub-fields (city, state, zip/postal, country, etc.) have been auto-populated by the Places API; their updated values are in the field list. Skip any address sub-fields that are now filled — do NOT ask the applicant to re-enter them. Move to the next empty field after the address block (address line 2 if empty, then any non-address field).${placesConfirmedBlock}`
          : filledValue
            ? `Field "${fieldLabel}" filled with "${filledValue}" via direct entry.`
            : isRequired
              ? `panel dismissed without a value — field is still empty and required`
              : `panel dismissed without a value — field is still empty and optional`;

        await continueAfterToolCall("openFieldPanel", args, resultSummary, history, chatEndpoint, patchedCtx);
      }
    },
    [continueAfterToolCall],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdePanelCancel = useCallback(async () => {
    const pending = adePanelCallbackRef.current;
    adePanelCallbackRef.current = null;
    setAdePanel(null);
    if (!pending) return;

    const { args, history, ctx } = pending;
    const { fieldId } = args;
    const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
    const fieldLabel = fieldMeta?.label || fieldId;
    const isRequired = fieldMeta?.required ?? false;
    const defaultEndpoint =
      assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-chat` : `${SERVER_URL}/api/ai/branding-chat`;
    const chatEndpoint = ctx?.aiEndpoint || defaultEndpoint;

    await continueAfterToolCall(
      "openFieldPanel",
      args,
      isRequired
        ? `panel dismissed without a value — field is still empty and required`
        : `panel dismissed without a value — field is still empty and optional`,
      history,
      chatEndpoint,
      ctx,
    );
  }, [continueAfterToolCall, assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // When a "direct" ADE panel opens, temporarily re-enable the target field only.
  //
  // • Google Places field → enable ONLY the Places autocomplete input.
  // ── Pre-fill confirmation handlers (basic mode) ───────────────────────────
  const handlePreFillConfirm = useCallback(() => {
    setPreFillModal(null);
  }, []);

  const handlePreFillSkip = useCallback(() => {
    setPreFillModal(null);
  }, []);

  // ── Field-error modal handlers (basic mode) ───────────────────────────────

  // Shared: re-fires the button click that was intercepted while the error was pending.
  // Called after the modal closes so the original action continues uninterrupted.
  const replayBlockedClick = useCallback(() => {
    const el = blockedClickTargetRef.current;
    blockedClickTargetRef.current = null;
    pendingFieldErrorRef.current = null;
    if (el) setTimeout(() => el.click(), 0);
  }, []);

  const handleFieldErrorKeep = useCallback(() => {
    if (!fieldErrorModal) return;
    const { fieldId, currentValue } = fieldErrorModal;
    // Mark this value confirmed so the same error won't fire again for this field+value
    if (!confirmedErrorsRef.current[fieldId]) confirmedErrorsRef.current[fieldId] = new Set();
    confirmedErrorsRef.current[fieldId].add(currentValue);
    setFieldErrorModal(null);
    replayBlockedClick();
  }, [fieldErrorModal, replayBlockedClick]);

  const handleFieldErrorSave = useCallback(
    async (correctedValue) => {
      if (!fieldErrorModal) return;
      const { fieldId } = fieldErrorModal;
      setFieldErrorModal(null);
      const ctx = getScreenContext();
      if (ctx?.actions?.fillField) {
        const el = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
        if (el) dodgeForField(el);
        await ctx.actions.fillField({ fieldId, value: correctedValue });
      }
      // Re-fire the blocked click after the corrected value has been written to the field
      replayBlockedClick();
    },
    [fieldErrorModal, replayBlockedClick],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  //   The address sub-fields (city, state, zip, country, etc.) stay disabled for
  //   direct user interaction — the Places API populates them programmatically via
  //   React state when the user selects a suggestion, which works regardless of the
  //   disabled attribute.
  //
  // • Any other direct field → enable only that specific field.
  //
  // The cleanup re-disables everything when the panel closes.
  useEffect(() => {
    if (!adePanel || adePanel.fieldMode !== "direct") return;

    const targetEl =
      document.getElementById(adePanel.fieldId) ||
      document.querySelector(`[name="${CSS.escape(adePanel.fieldId)}"]`) ||
      document.querySelector(`[data-ai-id="${CSS.escape(adePanel.fieldId)}"]`);

    // Enable the target element and any sibling inputs within the same
    // PhoneInput container (e.g. the country <select> rendered internally by
    // react-phone-number-input, which has no id/name matching fieldId).
    const phoneContainer = targetEl?.closest?.(".PhoneInput") || null;
    const toEnable = maxHelpDisabledElsRef.current.filter((el) => {
      if (el === targetEl) return true;
      const id = el.id || el.getAttribute?.("name") || el.getAttribute?.("data-ai-id") || "";
      if (id === adePanel.fieldId) return true;
      if (phoneContainer && phoneContainer.contains(el)) return true;
      return false;
    });
    if (targetEl && !toEnable.includes(targetEl)) toEnable.unshift(targetEl);

    for (const el of toEnable) el.disabled = false;

    // Re-enable signature wrappers blocked via pointer-events (not .disabled).
    // Re-enable the matched wrapper AND any sign wrappers nested inside it
    // (e.g. SignatureBox renders its own data-ai-type="sign" div inside the outer wrapper).
    const signToEnable = maxHelpDisabledSignsRef.current.filter((wrapper) => {
      if (wrapper === targetEl) return true;
      const wId = wrapper.getAttribute?.("data-ai-id") || "";
      if (wId === adePanel.fieldId) return true;
      if (targetEl && targetEl.contains(wrapper)) return true;
      return false;
    });
    for (const wrapper of signToEnable) {
      wrapper.style.pointerEvents = "";
      wrapper.style.opacity = "";
      wrapper.style.userSelect = "";
      restoreSignTabOrder(wrapper);
    }

    return () => {
      for (const el of toEnable) el.disabled = true;
      for (const wrapper of signToEnable) {
        wrapper.style.pointerEvents = "none";
        wrapper.style.opacity = "0.55";
        wrapper.style.userSelect = "none";
        blockSignTabOrder(wrapper);
      }
    };
  }, [adePanel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when the ADE panel opens or closes — its height affects the layout.
  useEffect(() => {
    setTimeout(() => scrollToBottom(), 50);
  }, [adePanel, scrollToBottom]);

  // Handle action buttons embedded in assistant messages
  const handleMessageAction = useCallback((_action) => {
    // No intro action buttons currently in use
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;
    setInput("");
    pendingFieldFocusRef.current = null;

    const userMsg = { role: "user", content };
    addMessage(userMsg);
    appendApiHistory(mapVisibleToApiMessage(userMsg));
    setIsLoading(true);

    const ctx = getScreenContext();
    const history = getApiHistory();

    const clientNavPage =
      assistantMode === "service-provider" ? shouldClientNavigateFromMessage(content) : null;
    if (clientNavPage) {
      await applyToolCall(
        "navigateToPage",
        {
          page: clientNavPage,
          reason: `Taking you to ${PAGE_LABELS[clientNavPage] || clientNavPage}.`,
          handoffMode: "greeting",
        },
        history,
      );
      setIsLoading(false);
      return;
    }

    const defaultEndpoint =
      assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-chat` : `${SERVER_URL}/api/ai/branding-chat`;
    const chatEndpoint = ctx?.aiEndpoint || defaultEndpoint;

    console.log("%c[SEND] → AI request", "color:#070; font-weight:bold", {
      userMessage: content,
      fields: ctx?.currentState?.fields?.map((f) => ({ id: f.id, label: f.label, value: f.value, filled: f.filled })),
      maxHelpMode: assistantMode === "applicant",
    });

    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          buildChatPayload({
            messages: history,
            ctx,
            assistantMode,
            customPrompt: aiCustomPrompt,
            formLanguage: formLanguageRef.current,
          }),
        ),
      });

      const data = await res.json();
      console.log("data", data);
      if (!data.success) throw new Error(data.message || "AI request failed");
      console.log("%c[SEND] ← AI response", "color:#070", {
        type: data.type,
        tool: data.tool,
        args: data.args,
        content: data.content,
      });

      if (data.type === "tool_call") {
        await applyToolCall(data.tool, data.args, history);
        // enterTranslationMode sets translationModeRef — apply language after so we
        // don't clear mode when the API's detectedLanguage disagrees with the tool args.
        const langArg =
          data.tool === "enterTranslationMode"
            ? translationModeRef.current?.lang ?? data.detectedLanguage
            : data.detectedLanguage;
        applyDetectedLanguage(langArg);
      } else {
        applyDetectedLanguage(data.detectedLanguage);
        appendApiHistory({ role: "assistant", content: data.content });
        addMessage({ role: "assistant", content: data.content });
        if (isVoiceModeRef.current) speak(data.content);
      }
    } catch (err) {
      console.error("[AI Chat error]", err);
      addMessage({
        role: "assistant",
        content: `${wt("error")}${err.message ? `: ${err.message}` : ""}. ${wt("tryAgain")}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Silently triggers the AI to proactively guide the user — no user message shown in chat.
  // Used for auto-guidance on form arrival and after "keep open" is clicked.
  // Disabled in basic mode — the assistant is purely reactive there.
  const autoGuide = async (instruction, _retryCount = 0) => {
    if (AI_CHAT_MODE === "basic") return;
    const isFieldFocus = instruction.startsWith("[FIELD_FOCUS]");

    if (isLoadingRef.current) {
      if (isFieldFocus) {
        // Save the most recent field-focus instead of dropping it. When the current request
        // finishes, the finally block will process this so the bot always catches up to wherever
        // the user currently is. Incrementing the generation invalidates the in-flight request
        // so its response is discarded rather than shown for a field the user already left.
        fieldFocusGenerationRef.current++;
        pendingFieldFocusRef.current = instruction;
      } else if (_retryCount < 10) {
        setTimeout(() => autoGuideRef.current?.(instruction, _retryCount + 1), 600);
      }
      return;
    }

    // Snapshot the generation at request start. If it changes before the response arrives,
    // the user has moved to a new field and this response should be discarded.
    const generation = isFieldFocus ? ++fieldFocusGenerationRef.current : fieldFocusGenerationRef.current;

    // Create an AbortController so the fetch can be cancelled if the user moves on.
    const controller = new AbortController();
    autoGuideAbortRef.current = controller;

    const ctx = getScreenContext();
    const defaultEndpoint =
      assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-chat` : `${SERVER_URL}/api/ai/branding-chat`;
    const chatEndpoint = ctx?.aiEndpoint || defaultEndpoint;
    const autoMsg = mapVisibleToApiMessage({ role: "user", content: instruction });
    appendApiHistory(autoMsg);

    setIsLoading(true);
    const autoGuidePayload = buildChatPayload({
      messages: getApiHistory(),
      ctx,
      assistantMode,
      customPrompt: aiCustomPrompt,
      formLanguage: formLanguageRef.current,
    });
    console.log("%c[AUTOGUIDE] → AI request", "color:#a50; font-weight:bold", {
      instruction,
      fields: ctx?.currentState?.fields?.map((f) => ({ id: f.id, label: f.label, value: f.value, filled: f.filled })),
      maxHelpMode: autoGuidePayload.context.maxHelpMode,
    });
    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify(autoGuidePayload),
      });
      const data = await res.json();
      console.log("data", data);
      if (!data.success) throw new Error(data.message || "AI request failed");

      // Stale-response guard: if the generation changed (user moved to another field),
      // discard this response entirely.
      if (isFieldFocus && generation !== fieldFocusGenerationRef.current) return;

      console.log("%c[AUTOGUIDE] ← AI response", "color:#a50", {
        type: data.type,
        tool: data.tool,
        args: data.args,
        content: data.content,
      });
      if (data.type === "tool_call") {
        await applyToolCall(data.tool, data.args, getApiHistory());
        if (data.tool === "enterTranslationMode") {
          applyDetectedLanguage(translationModeRef.current?.lang ?? data.detectedLanguage);
        } else {
          applyDetectedLanguage(data.detectedLanguage);
        }
      } else {
        applyDetectedLanguage(data.detectedLanguage);
        appendApiHistory({ role: "assistant", content: data.content });
        addMessage({ role: "assistant", content: data.content });
        if (isVoiceModeRef.current) speak(data.content);
        // Dodge the panel and scroll to the first empty field so the applicant sees it highlighted.
        if (assistantMode === "applicant") {
          const fields = ctx?.currentState?.fields ?? [];
          const target = fields.find((f) => f.required && !f.filled) || fields.find((f) => !f.filled);
          if (target) {
            const el =
              document.getElementById(target.id) || document.querySelector(`[name="${CSS.escape(target.id)}"]`);
            if (el) {
              dodgeForField(el);
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            setTimeout(() => inputRef.current?.focus(), 80);
          }
        }
      }
    } catch (err) {
      if (err?.name === "AbortError") return; // user moved on — silent cancel, no logging
      // Other errors: silently fail — don't interrupt the user
    } finally {
      if (autoGuideAbortRef.current === controller) autoGuideAbortRef.current = null;
      setIsLoading(false);
      // If a newer field-focus arrived while we were busy with a manual message (non-abortable),
      // process it now so the bot catches up.
      const pending = pendingFieldFocusRef.current;
      if (pending) {
        pendingFieldFocusRef.current = null;
        setTimeout(() => autoGuideRef.current?.(pending), 0);
      }
    }
  };

  // Keep refs current so conversation-mode callbacks always call the latest functions
  sendMessageRef.current = sendMessage;
  autoGuideRef.current = autoGuide;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Never show the widget on the login page or when no user is authenticated,
  // unless this is an applicant form route (publicly accessible, no admin login required)
  const isApplicantFormRoute = pathname.startsWith("/application-form/");
  if (pathname === "/login" || (!user && !isApplicantFormRoute)) return null;

  const handleOpenFab = () => {
    sessionStorage.removeItem(WIDGET_CLOSED_KEY);
    const _t = headerBottom;
    const _l = Math.max(0, window.innerWidth - PANEL_WIDTH - 24);
    panelTargetRef.current = { top: _t, left: _l, width: PANEL_WIDTH, height: PANEL_HEIGHT };
    setPanelWidth(PANEL_WIDTH);
    setPanelHeight(PANEL_HEIGHT);
    setPosition({ top: _t, left: _l });
    setIsOpen(true);
  };

  const handleClosePanel = () => {
    if (assistantMode === "applicant") sessionStorage.setItem(WIDGET_CLOSED_KEY, "1");
    setIsOpen(false);
    stopSpeaking();
    stopListening();
    isVoiceModeRef.current = false;
    setIsVoiceMode(false);
  };

  return (
    <>
      {!isOpen && (
        <ChatFab
          fabRef={fabRef}
          fabNudged={fabNudged}
          effectiveLaunchColor={effectiveLaunchColor}
          aiUseCustomIcon={aiUseCustomIcon}
          onOpen={handleOpenFab}
        />
      )}

      {isOpen && (
        <ChatPanel
          panelRef={panelRef}
          panelWidth={panelWidth}
          panelHeight={panelHeight}
          position={position}
          dragRef={dragRef}
          resizeRef={resizeRef}
          fontFamily={fontFamily}
          effectiveHeaderColor={effectiveHeaderColor}
          effectiveBannerColor={effectiveBannerColor}
          effectiveBannerText={effectiveBannerText}
          headerIconColor={headerIconColor}
          aiUseCustomIcon={aiUseCustomIcon}
          getScreenContext={getScreenContext}
          onHeaderMouseDown={onHeaderMouseDown}
          onResizeMouseDown={onResizeMouseDown}
          onClose={handleClosePanel}
          bannerIdx={bannerIdx}
          bannerFading={bannerFading}
          messagesContainerRef={messagesContainerRef}
          messages={messages}
          isLoading={isLoading}
          adePanel={adePanel}
          effectiveLaunchColor={effectiveHeaderColor}
          handleAdePanelComplete={handleAdePanelComplete}
          handleAdePanelCancel={handleAdePanelCancel}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
          input={input}
          setInput={setInput}
          handleKeyDown={handleKeyDown}
          suppressChatFocusRef={suppressChatFocusRef}
          userFocusedChatRef={userFocusedChatRef}
          assistantMode={assistantMode}
          sendMessage={sendMessage}
          handleMessageAction={handleMessageAction}
          introButtonsDismissed={introButtonsDismissed}
        />
      )}

      <ChatOverlays
        preFillModal={preFillModal}
        fieldErrorModal={fieldErrorModal}
        translationTooltip={translationTooltip}
        effectiveHeaderColor={effectiveHeaderColor}
        headerIconColor={headerIconColor}
        primaryColor={primaryColor}
        buttonTextPrimary={buttonTextPrimary}
        fontFamily={fontFamily}
        handlePreFillConfirm={handlePreFillConfirm}
        handlePreFillSkip={handlePreFillSkip}
        handleFieldErrorKeep={handleFieldErrorKeep}
        handleFieldErrorSave={handleFieldErrorSave}
      />
    </>
  );
}
