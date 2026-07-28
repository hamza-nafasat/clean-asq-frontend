import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useAddBrandingInFormMutation } from "../../../redux/apis/brandingApis";
import { useBranding } from "../../../hooks/BrandingContext";
import { checkFieldForErrors } from "../../../lib/checkFieldForErrors";
import { discoverFormFields } from "../../../lib/discoverFormFields";
import { UseAIChat } from "@/context/AiChatContext";
import { buildChatPayload } from "./utils/buildChatPayload.js";
import {
  contrastingIconColor,
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
import ChatFab from "./components/ChatFab.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import ChatOverlays from "./components/ChatOverlays.jsx";

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
    pushRevertable,
    popRevertable,
    signalContinuationPending,
    triggerAutoMessage: _triggerAutoMessage,
    autoMessageSignal,
    pendingAutoMessageRef,
    assistantMode,
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
  const [addBrandingToFormGlobal] = useAddBrandingInFormMutation();
  const headerIconColor = contrastingIconColor(effectiveHeaderColor);
  const [input, setInput] = useState("");
  const voice = aiVoice || "nova";

  const sendMessageRef = useRef(null);

  // Voice / PTT / TTS — behavior mirrors stagging's inline voice logic.
  const { speak, stopSpeaking, stopListening, setIsVoiceMode, isVoiceModeRef, pendingListenRef } = useAiVoice({
    assistantMode,
    voice,
    sendMessageRef,
  });

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
  // Tracks elements we disabled in applicant mode so we can re-enable them on page change.
  const maxHelpDisabledElsRef = useRef([]);
  const maxHelpDisabledSignsRef = useRef([]); // [data-ai-type="sign"] wrappers blocked via pointer-events
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerFading, setBannerFading] = useState(false);
  // Stores the most recent field-focus timer callback so onInputChange can reset the timer.
  const fieldTimerCallbackRef = useRef(null);
  const panelRef = useRef(null);
  // Panel dodge: saved position before moving out of the way of a field.
  const homePositionRef = useRef(null);
  // The fieldId of the field most recently activated/filled, so we know when to restore.
  const activatedFieldIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  // Set to true by activateField so the post-response auto-focus doesn't steal focus.
  const suppressChatFocusRef = useRef(false);
  // Set to true when the user explicitly focuses the chat textarea.
  const userFocusedChatRef = useRef(false);

  // Measure the real header height so button and panel sit flush below it.
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
  const resizeRef = useRef({ isResizing: false, edge: "", startX: 0, startY: 0, startW: 0, startH: 0, startLeft: 0, startTop: 0 });
  const panelTargetRef = useRef({
    top: 80,
    left: Math.max(0, window.innerWidth - PANEL_WIDTH - 24),
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
  });

  // Refs kept current every render — safe to read inside callbacks/effects
  const pendingFormContinuationRef = useRef(null); // stores { toolArgs, history } while waiting for form data to load
  const pendingFollowUpRef = useRef(null);   // task auto-sent after AI-triggered navigation
  const navTimeoutRef = useRef(null);        // clears stale follow-up if page never loads
  const prevScreenIdRef = useRef(null);
  const suppressNextScreenGreetingRef = useRef(false); // set by tool calls that handle their own transition message
  const initialGreetingShownRef = useRef(false); // prevents double-greeting when endpoint change clears messages mid-session
  // Tracks the most recently detected language (from AI [LANG:xx] tags) for widget string translation
  const lastDetectedLanguageRef = useRef(null);
  const fabRef = useRef(null);          // ref to the floating action button
  const [fabNudged, setFabNudged] = useState(false); // true when FAB is dodging an overlapping element
  const [introButtonsDismissed, setIntroButtonsDismissed] = useState(false);
  const [adePanel, setAdePanel] = useState(null);
  const adePanelCallbackRef = useRef(null); // stores { args, history, ctx } to avoid stale closures
  const confirmedValuesRef = useRef({}); // accumulates every fieldId→value filled this session; emitted on goToNextStep
  // Pre-fill confirmation dialog
  const [preFillModal, setPreFillModal] = useState(null); // null | { preFilled, remaining }
  const preFillShownRef = useRef(new Set()); // screenIds already shown — never show twice
  const preFillWatchRef = useRef(null); // interval watching slow-loading fields inside the modal

  // Silent field-error monitor
  const [fieldErrorModal, setFieldErrorModal] = useState(null); // null | { fieldId, ... }
  const confirmedErrorsRef = useRef({}); // { [fieldId]: Set<string> } — values the applicant confirmed intentionally
  const pendingFieldErrorRef = useRef(null);
  const blockedClickTargetRef = useRef(null);

  // Reset voice/conversation mode when a new applicant session starts (clearOnMount fires)
  useEffect(() => {
    if (!widgetResetSignal) return;
    stopSpeaking();
    stopListening();
    isVoiceModeRef.current = false;
    setIsVoiceMode(false);
    pendingListenRef.current = false;
    lastDetectedLanguageRef.current = null;
    // Allow the greeting to re-fire for the new session
    initialGreetingShownRef.current = false;
  }, [widgetResetSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-send a queued message (e.g. from clicking "Build live action" on the demo page)
  useEffect(() => {
    if (!autoMessageSignal || !pendingAutoMessageRef?.current) return;
    const text = pendingAutoMessageRef.current;
    pendingAutoMessageRef.current = null;
    setTimeout(() => { if (sendMessageRef.current) sendMessageRef.current(text); }, 400);
  }, [autoMessageSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // When the applicant focuses a form field (via Tab or click): the panel dodges IMMEDIATELY.
  useEffect(() => {
    if (!isOpen) return;

    let pauseTimer = null;
    let lastNotifiedFieldId = null;

    const cancelPendingWork = () => {
      clearTimeout(pauseTimer);
      pauseTimer = null;
      fieldTimerCallbackRef.current = null;
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
          cancelPendingWork();
          lastNotifiedFieldId = sigFieldId;
          const outerMarker = signMarker.parentElement?.closest("[data-ai-type='sign']") || signMarker;
          dodgeForField(outerMarker);
        }
        return;
      }

      if (!["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
      if (target === inputRef.current) return;
      const fieldId = target.type === "radio"
        ? target.getAttribute("name")
        : (target.id || target.getAttribute("name"));
      if (!fieldId) return;
      if (fieldId === lastNotifiedFieldId) return;

      cancelPendingWork();
      lastNotifiedFieldId = fieldId;
      activatedFieldIdRef.current = fieldId;
      dodgeForField(target);
    };

    // Fires on every keystroke in any form field. Any typing resets the guidance timer.
    const onInputChange = (e) => {
      const t = e.target;
      if (!["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName)) return;
      if (t === inputRef.current) return;
      const fId = t.id || t.getAttribute("name");
      if (!fId || fId !== lastNotifiedFieldId) return;
      if (fieldTimerCallbackRef.current) {
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

  // Silent field-error monitor — active in all applicant modes.
  useEffect(() => {
    if (assistantMode !== "applicant") return;

    const checkAndFlag = (el) => {
      if (!el || el === inputRef.current) return false;
      if (!["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) return false;
      if (el.type === "password" || el.type === "checkbox" || el.type === "radio") return false;
      if (el.closest?.("[data-ai-type='sign']")) return false;

      const rawValue = el.value?.trim();
      if (!rawValue) return false;

      const fieldId = el.id || el.getAttribute("name");
      if (!fieldId) return false;

      const ctx = getScreenContext();
      const fields = ctx?.currentState?.fields || [];
      const meta = fields.find((f) => f.id === fieldId);

      if (meta?.fieldMode === "secure" || meta?.isSignature) return false;
      // Skip auto-defaulted fields — e.g. PhoneInput's country-code selector
      if (meta?.isDefault) return false;

      const fieldLabel = meta?.label || fieldId;
      const fieldType  = meta?.type  || el.type || "text";

      // Company verification: "This company has no website" means skip website URL checks
      const noWebsiteEl =
        document.getElementById("noWebsite") || document.querySelector('input[name="noWebsite"]');
      if (noWebsiteEl?.checked) {
        const idLabel = `${fieldId} ${fieldLabel}`.toLowerCase();
        if (/(website|web\s*site|\burl\b|homepage|domain|company-url)/.test(idLabel)) return false;
      }

      const confirmed = confirmedErrorsRef.current[fieldId];
      if (confirmed instanceof Set && confirmed.has(rawValue)) return false;

      // Already pending — don't re-open the modal for the same error
      if (pendingFieldErrorRef.current) return true;

      const error = checkFieldForErrors(fieldId, fieldLabel, fieldType, rawValue);
      if (!error) return false;

      pendingFieldErrorRef.current = true;

      const isEmail = fieldType === "email" ||
        fieldId.toLowerCase().includes("email") ||
        fieldLabel.toLowerCase().includes("email");
      const retryNote = isEmail
        ? "If a step was already triggered using this address — such as sending a verification code — you may need to repeat it after saving the corrected value."
        : null;

      setFieldErrorModal({
        fieldId, fieldLabel, fieldType,
        description: error.description,
        suggestion: error.suggestion,
        currentValue: rawValue,
        retryNote,
      });
      return true;
    };

    // When the applicant clicks the "no website" checkbox/label, the URL field's
    // focusout fires before the checkbox is checked — skip validating that blur.
    let skipNextWebsiteFocusOut = false;
    const isNoWebsiteControl = (node) =>
      !!node?.closest?.(
        '#noWebsite, input[name="noWebsite"], [data-testid="company-no-website-checkbox"], label[for="noWebsite"]',
      );

    const onCaptureMouseDown = (e) => {
      if (e.target.closest("[data-field-error-modal]")) return;
      if (isNoWebsiteControl(e.target)) {
        skipNextWebsiteFocusOut = true;
        return;
      }
      const actionEl = e.target.closest("button, a, input[type='submit'], [role='button']");
      if (!actionEl) return;
      const focused = document.activeElement;
      const hasError = checkAndFlag(focused);
      if (hasError) {
        blockedClickTargetRef.current = actionEl;
      }
    };

    const onFocusOut = (e) => {
      if (skipNextWebsiteFocusOut) {
        skipNextWebsiteFocusOut = false;
        const leaving = `${e.target?.id || ""} ${e.target?.name || ""} ${e.target?.getAttribute?.("data-testid") || ""}`.toLowerCase();
        if (/(website|web\s*site|\burl\b|homepage|domain|company-url)/.test(leaving)) return;
      }
      const next = e.relatedTarget;
      if (isNoWebsiteControl(next)) return;
      checkAndFlag(e.target);
    };

    const onCaptureClick = (e) => {
      if (!pendingFieldErrorRef.current) return;
      if (e.target.closest("[data-field-error-modal]")) return;
      const actionEl = e.target.closest("button, a, input[type='submit'], [role='button']");
      if (!actionEl) return;
      e.stopPropagation();
      pendingFieldErrorRef.current = null;
      if (!blockedClickTargetRef.current) blockedClickTargetRef.current = actionEl;
    };

    document.addEventListener("mousedown", onCaptureMouseDown, true);
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("click", onCaptureClick, true);
    return () => {
      document.removeEventListener("mousedown", onCaptureMouseDown, true);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("click", onCaptureClick, true);
    };
  }, [assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-fill confirmation: polls until field values settle, then shows the review dialog.
  useEffect(() => {
    if (assistantMode !== "applicant") return;
    if (!currentScreenId) return;
    if (preFillShownRef.current.has(currentScreenId)) return;

    const screenId = currentScreenId;

    const FLOOR_MS = 150;
    const QUIET_MS = 100;
    const CAP_MS   = 15000;
    const POLL_MS  = 50;

    const start = Date.now();
    let quietSince = start;
    let lastKey = null;
    let cancelled = false;

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
      if (!ctx || ctx.screenId !== screenId) return;

      const container = ctx.formRef?.current ?? null;
      const fields = getLiveFields(ctx);

      const preFilled = fields
        .filter((f) => f.filled && !f.isSignature && f.fieldMode !== "secure")
        .map((f) => ({ ...f, isLoading: false }));

      const loadingPlaceholders = fields
        .filter((f) => !f.filled && !f.isSignature && f.fieldMode !== "secure" && isFieldLoading(container, f.id))
        .map((f) => ({ ...f, isLoading: true }));

      const allPreFilled = [...preFilled, ...loadingPlaceholders];

      if (allPreFilled.length < 3) return;

      preFillShownRef.current.add(screenId);

      const remaining = fields.filter(
        (f) => !f.filled && !f.isSignature && f.required && !isFieldLoading(container, f.id)
      );
      setPreFillModal({ preFilled: allPreFilled, remaining });
      void reason;
    };

    const poll = () => {
      if (cancelled) return;

      if (getScreenContext()?.screenId !== screenId) {
        cancelled = true;
        return;
      }

      const now = Date.now();
      const elapsed = now - start;
      const aiLoading = !!document.querySelector('[data-ai-loading="page"]');

      const key = getKey();
      if (key === null) {
        cancelled = true;
        return;
      }

      const keyChanged = key !== lastKey;
      if (keyChanged) {
        lastKey = key;
        quietSince = now;
      }

      if (elapsed >= CAP_MS) {
        tryFire("cap");
        return;
      }

      if (aiLoading) {
        quietSince = now;
        setTimeout(poll, POLL_MS);
        return;
      }

      if (elapsed >= FLOOR_MS && now - quietSince >= QUIET_MS) {
        tryFire("settled");
        return;
      }

      setTimeout(poll, POLL_MS);
    };

    setTimeout(poll, POLL_MS);
    return () => {
      cancelled = true;
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
        : ctx.currentState?.fields ?? [];

      setPreFillModal((prev) => {
        if (!prev) return null;
        let anyStillLoading = false;
        const newRemaining = [...prev.remaining];
        const updated = prev.preFilled.map((f) => {
          if (!f.isLoading) return f;
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
          if (stillLoading) { anyStillLoading = true; return f; }
          const live = liveFields.find((lf) => lf.id === f.id);
          if (live?.filled) return { ...f, value: live.value, isLoading: false };
          if (f.required && !newRemaining.some((r) => r.id === f.id)) {
            newRemaining.push({ id: f.id, label: f.label, required: true });
          }
          return null;
        }).filter(Boolean);

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

  // Returns the nearest enabled button adjacent to inputEl in the DOM.
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
        const newLeft = Math.max(0, Math.min(window.innerWidth - (cur.width ?? PANEL_WIDTH), dragRef.current.startLeft + dx));
        panelTargetRef.current = { ...cur, top: newTop, left: newLeft };
        setPosition({ top: newTop, left: newLeft });
      }
      if (resizeRef.current.isResizing) {
        const { edge, startX, startY, startW, startH, startLeft, startTop } = resizeRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newW = startW, newH = startH, newLeft = startLeft, newTop = startTop;
        if (edge.includes("e")) newW = startW + dx;
        if (edge.includes("w")) { newW = startW - dx; newLeft = startLeft + (startW - Math.max(PANEL_MIN_WIDTH, newW)); }
        if (edge.includes("s")) newH = startH + dy;
        if (edge.includes("n")) { newH = startH - dy; newTop = startTop + (startH - Math.max(PANEL_MIN_HEIGHT, newH)); }
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

  // Removes focusable descendants of a sign wrapper from the keyboard tab order.
  const blockSignTabOrder = (wrapper) => {
    const els = [wrapper, ...Array.from(wrapper.querySelectorAll('[tabindex], button'))];
    for (const el of els) {
      if (el.hasAttribute("data-ai-sig-tab")) continue;
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

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus chat input when opened (not in applicant mode — user types into form fields there).
  useEffect(() => {
    if (isOpen && assistantMode !== "applicant") setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoading && isOpen && (!suppressChatFocusRef.current || userFocusedChatRef.current)) {
      inputRef.current?.focus();
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Maps form language names (from detectFormLanguage) to BCP-47 codes.
  const FORM_LANG_TO_BCP47 = {
    "English": "en", "Spanish": "es", "French": "fr", "Portuguese": "pt",
    "Chinese": "zh", "Arabic": "ar", "German": "de", "Italian": "it",
    "Korean": "ko", "Japanese": "ja", "Vietnamese": "vi", "Hindi": "hi",
    "Russian": "ru", "Tagalog": "tl", "Filipino": "tl", "Polish": "pl",
  };

  // Update the last detected language ref whenever the AI signals a language via [LANG:xx].
  const applyDetectedLanguage = (detectedLanguage) => {
    if (!detectedLanguage) return;
    lastDetectedLanguageRef.current = detectedLanguage;

    const formLangCode = FORM_LANG_TO_BCP47[formLanguageRef.current] || "en";

    if (detectedLanguage === formLangCode) {
      if (translationModeRef.current) {
        translationModeRef.current = null;
        setTranslationMode(null);
      }
    } else if (translationModeRef.current && translationModeRef.current.lang !== detectedLanguage) {
      const langName = (() => {
        try { return new Intl.DisplayNames(["en"], { type: "language" }).of(detectedLanguage) || detectedLanguage; }
        catch { return detectedLanguage; }
      })();
      const newMode = { lang: detectedLanguage, langName };
      translationModeRef.current = newMode;
      setTranslationMode(newMode);
      tooltipCacheRef.current = {};
    }
  };

  // Translate a widget-generated string into the most recently detected language
  const wt = (key, ...args) => {
    const lang = lastDetectedLanguageRef.current || "en";
    const val = (WIDGET_STRINGS[lang] || WIDGET_STRINGS.en)[key] ?? WIDGET_STRINGS.en[key] ?? key;
    return typeof val === "function" ? val(...args) : val;
  };

  // When the panel opens in applicant mode, reposition to the bottom-right.
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
  const WIDGET_CLOSED_KEY = "ai-widget-user-closed";
  const openedByApplicantRef = useRef(false);
  const modeExitTimerRef    = useRef(null);
  useEffect(() => {
    if (assistantMode === "applicant") {
      clearTimeout(modeExitTimerRef.current);
      modeExitTimerRef.current = null;
      openedByApplicantRef.current = true;
    } else if (openedByApplicantRef.current) {
      modeExitTimerRef.current = setTimeout(() => {
        openedByApplicantRef.current = false;
        setIsOpen(false);
        preFillShownRef.current.clear();
        sessionStorage.removeItem(WIDGET_CLOSED_KEY);
      }, 150);
    }
  }, [assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Nudge the FAB down when its home position overlaps a clickable element.
  useEffect(() => {
    if (isOpen) { setFabNudged(false); return; }

    const FAB_W = 70, FAB_H = 70, FAB_RIGHT_PX = 64, FAB_BOTTOM_PX = 72;

    const findScroller = () => {
      const main = document.querySelector("main");
      if (main && main.scrollHeight > main.clientHeight + 4) return main;
      const de = document.scrollingElement || document.documentElement;
      if (de.scrollHeight > de.clientHeight + 4) return de;
      return null;
    };

    const checkOverlap = () => {
      const scroller = findScroller();

      if (scroller) {
        const distFromBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
        if (distFromBottom > 10) { setFabNudged(false); return; }
      }

      const homeRight  = window.innerWidth  - FAB_RIGHT_PX;
      const homeLeft   = homeRight - FAB_W;
      const homeBottom = window.innerHeight - FAB_BOTTOM_PX;
      const homeTop    = homeBottom - FAB_H;
      const cx = (homeLeft + homeRight) / 2;
      const cy = (homeTop  + homeBottom) / 2;
      const samplePoints = [
        [cx,           cy          ],
        [cx - 18,      cy - 18     ],
        [cx + 18,      cy - 18     ],
        [cx - 18,      cy + 18     ],
        [cx + 18,      cy + 18     ],
      ];

      const fab = fabRef.current;
      if (fab) fab.style.pointerEvents = "none";

      const INTERACTIVE = 'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"]';
      let overlaps = false;
      outer: for (const [px, py] of samplePoints) {
        let el = document.elementFromPoint(px, py);
        while (el && el !== document.body) {
          if (el.matches(INTERACTIVE)) { overlaps = true; break outer; }
          el = el.parentElement;
        }
      }

      if (fab) fab.style.pointerEvents = "";
      setFabNudged(overlaps);
    };

    document.addEventListener("scroll", checkOverlap, { passive: true, capture: true });
    window.addEventListener("resize", checkOverlap, { passive: true });
    checkOverlap();
    return () => {
      document.removeEventListener("scroll", checkOverlap, { capture: true });
      window.removeEventListener("resize", checkOverlap);
      setFabNudged(false);
    };
  }, [isOpen, currentScreenId]);

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
  const detectFormLanguage = (ctx) => {
    const fields = ctx?.currentState?.fields || [];
    const text = [
      ctx?.screenName || "",
      ctx?.description || "",
      ...fields.map((f) => `${f.label || ""} ${f.description || ""} ${f.placeholder || ""}`),
    ].join(" ");
    const len = text.replace(/\s/g, "").length || 1;

    if ((text.match(/[\u0600-\u06FF]/g) || []).length / len > 0.12) return "Arabic";
    if ((text.match(/[\u4E00-\u9FFF]/g) || []).length / len > 0.12) return "Chinese";
    if ((text.match(/[\u3040-\u30FF]/g) || []).length / len > 0.12) return "Japanese";
    if ((text.match(/[\uAC00-\uD7AF]/g) || []).length / len > 0.12) return "Korean";
    if ((text.match(/[\u0400-\u04FF]/g) || []).length / len > 0.12) return "Russian";
    if ((text.match(/[\u0590-\u05FF]/g) || []).length / len > 0.12) return "Hebrew";
    if ((text.match(/[\u0E00-\u0E7F]/g) || []).length / len > 0.12) return "Thai";
    if ((text.match(/[\u0900-\u097F]/g) || []).length / len > 0.12) return "Hindi";

    const tl = text.toLowerCase();
    if (/\b(nombre|empresa|dirección|ciudad|país|fecha|teléfono|correo|apellido)\b/.test(tl)) return "Spanish";
    if (/\b(nom|prénom|adresse|entreprise|ville|pays|téléphone|courriel|date)\b/.test(tl)) return "French";
    if (/\b(nome|empresa|endereço|cidade|estado|país|telefone|cpf|cnpj)\b/.test(tl)) return "Portuguese";
    if (/\b(vorname|nachname|unternehmen|anschrift|straße|stadt|land|telefon|datum)\b/.test(tl)) return "German";
    if (/\b(nome|azienda|indirizzo|città|paese|telefono|codice fiscale|data)\b/.test(tl)) return "Italian";

    return "English";
  };

  // Show greeting only on very first open (empty transcript).
  useEffect(() => {
    if (!isOpen || messages.length !== 0) return;
    if (initialGreetingShownRef.current) return;
    const ctx = getScreenContext();
    const screenName = ctx?.screenName || "this screen";

    if (assistantMode === "applicant") {
      const detectedLang = detectFormLanguage(ctx);
      formLanguageRef.current = detectedLang;
      if (detectedLang !== "English") lastDetectedLanguageRef.current = detectedLang.toLowerCase().slice(0, 2);

      const stepInfo = ctx?.currentState?.currentStep != null
        ? ` — Step ${ctx.currentState.currentStep + 1} of ${ctx.currentState.totalSteps}`
        : "";
      const greetings = {
        Spanish:    "¡Hola! Soy tu **asistente de solicitud**. Tengo contexto completo sobre esta solicitud y puedo responder cualquier pregunta.\n\nPregúntame lo que necesites sobre el formulario, los requisitos o el proceso.",
        French:     "Bonjour\u00a0! Je suis votre **assistant de candidature**. J'ai le contexte complet de cette candidature et je peux répondre à toutes vos questions.\n\nN'hésitez pas à me poser des questions sur le formulaire, les exigences ou le processus.",
        Portuguese: "Olá! Sou o seu **assistente de candidatura**. Tenho contexto completo sobre esta candidatura e posso responder a qualquer pergunta.\n\nFique à vontade para me perguntar qualquer coisa sobre o formulário, os requisitos ou o processo.",
        German:     "Hallo! Ich bin Ihr **Bewerbungsassistent**. Ich habe vollständigen Kontext zu dieser Bewerbung und beantworte gerne alle Ihre Fragen.\n\nFragen Sie mich gerne alles zum Formular, den Anforderungen oder dem Ablauf.",
        Italian:    "Ciao! Sono il tuo **assistente per la domanda**. Ho il contesto completo di questa domanda e posso rispondere a qualsiasi tua domanda.\n\nChiedimi pure qualsiasi cosa sul modulo, i requisiti o il processo.",
        Arabic:     "مرحباً! أنا **مساعد الطلب** الخاص بك. لدي سياق كامل حول هذا الطلب ويمكنني الإجابة على أي أسئلة لديك.\n\nلا تتردد في سؤالي عن أي شيء يتعلق بالنموذج أو المتطلبات أو العملية.",
        Chinese:    "你好！我是您的**申请助手**。我对本申请有完整的上下文，可以回答您的任何问题。\n\n欢迎随时询问有关表格、要求或流程的任何问题。",
        Japanese:   "こんにちは！私はあなたの**申請アシスタント**です。この申請の全情報を把握しており、どんな質問にもお答えします。\n\nフォーム、要件、または手続きについて何でもお気軽にご質問ください。",
        Korean:     "안녕하세요! 저는 귀하의 **신청 도우미**입니다. 이 신청에 대한 전체 맥락을 파악하고 있으며 모든 질문에 답변드릴 수 있습니다.\n\n양식, 요건 또는 절차에 대해 무엇이든 자유롭게 질문해 주세요.",
        Russian:    "Привет! Я ваш **помощник по заявке**. У меня есть полный контекст этой заявки, и я могу ответить на любые ваши вопросы.\n\nНе стесняйтесь спрашивать меня о форме, требованиях или процессе.",
      };
      const content = ctx?.greeting || greetings[detectedLang] ||
        `Hi! I'm your **application assistant**.\n\nYou're currently on **${screenName}**${stepInfo}.\n\nHere's what I can do:\n- **Answer questions** about any field or requirement\n- **Explain what's needed** for each section\n- **Scroll to any field** if you're not sure where to find it\n- **Communicate in any language** — just start typing in yours\n\nFeel free to ask me anything!`;
      setIntroButtonsDismissed(true);
      addMessage({ role: "assistant", content });
    } else {
      const content = ctx?.greeting ||
        `Hi! I'm your assistant. I can see you're working on **${screenName}**.\n\nWhat would you like to do?`;
      addMessage({ role: "assistant", content });
    }
    initialGreetingShownRef.current = true;
  }, [isOpen, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // When the active screen changes: append a new greeting + run any pending follow-up.
  useEffect(() => {
    if (!currentScreenId) return;

    const isScreenChange =
      prevScreenIdRef.current !== null && prevScreenIdRef.current !== currentScreenId;
    prevScreenIdRef.current = currentScreenId;

    if (isScreenChange) {
      const ctx = getScreenContext();
      const screenName = ctx?.screenName || currentScreenId;

      if (assistantMode === "applicant") {
        if (!isOpen) return;
        const guardedScreenId = ctx?.screenId || currentScreenId;
        setTimeout(() => {
          const reCheckCtx = getScreenContext();
          if (!reCheckCtx || reCheckCtx.screenId !== guardedScreenId) return;
          if (!isOpen) return;
          const stepStr = reCheckCtx?.currentState?.currentStep != null
            ? ` — Step ${reCheckCtx.currentState.currentStep + 1} of ${reCheckCtx.currentState.totalSteps}`
            : "";
          addMessage({ role: "assistant", content: `You're now on **${screenName}**${stepStr}. Feel free to ask me anything about this step.` });
          announceScreen(screenName);
        }, 600);
      } else {
        if (suppressNextScreenGreetingRef.current) {
          suppressNextScreenGreetingRef.current = false;
        } else {
          const greeting = ctx?.greeting ||
            `I'm now on **${screenName}**. What would you like to do?`;
          addMessage({ role: "assistant", content: greeting });
        }
      }
      // If we arrived here via an AI navigateToPage or template-switch tool call, auto-send the follow-up task.
      if (pendingFollowUpRef.current) {
        const task = pendingFollowUpRef.current;
        pendingFollowUpRef.current = null;
        if (navTimeoutRef.current) { clearTimeout(navTimeoutRef.current); navTimeoutRef.current = null; }
        const taskContent = typeof task === "object" ? task.content : task;
        const taskSilent = typeof task === "object" ? !!task.silent : false;
        setTimeout(() => { if (sendMessageRef.current) sendMessageRef.current(taskContent, { silent: taskSilent }); }, 800);
      }
    }
  }, [currentScreenId]); // eslint-disable-line react-hooks/exhaustive-deps

  // When form data loads (or fails) after selectFormForEditing, auto-continue the conversation
  useEffect(() => {
    if (!pendingFormContinuationRef.current) return;
    const { toolArgs, history } = pendingFormContinuationRef.current;
    pendingFormContinuationRef.current = null;

    const ctx = getScreenContext();

    const chatEndpoint = ctx?.aiEndpoint || `${SERVER_URL}/api/ai/branding-chat`;

    let toolResult;
    if (ctx?.currentState?.detailedForm) {
      const sectionCount = ctx.currentState.detailedForm.sections?.length ?? 0;
      if (sectionCount > 0) {
        toolResult = `Form details loaded. ${sectionCount} section(s) found — the complete section and field structure is now available in context.`;
      } else {
        toolResult = `Form loaded but no sections were found in context. This may be a temporary loading issue. Ask the user to try again, or call selectFormForEditing again with the same formId to retry.`;
      }
    } else {
      const forms = ctx?.currentState?.forms || [];
      const formList = forms.map((f) =>
        `"${f.name}"${f.headerText && f.headerText !== f.name ? ` (displayed as "${f.headerText}")` : ""} [${f._id}]`
      ).join(", ");
      toolResult = `Error: Form with ID "${toolArgs.formId}" was not found — it may have been deleted or renamed. Available forms: ${formList || "none"}. Please use a valid form ID from this list and retry.`;
    }

    const continuationHistory = [
      ...history,
      { role: "assistant", content: null, function_call: { name: "selectFormForEditing", arguments: JSON.stringify(toolArgs) } },
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
        if (!data.success) throw new Error(data.message || "AI request failed");
        if (data.type === "tool_call") {
          await applyToolCall(data.tool, data.args, continuationHistory);
        } else {
          addMessage({ role: "assistant", content: data.content });
          if (isVoiceModeRef.current) speak(data.content);
        }
      } catch (err) {
        const detail = err?.message || "";
        addMessage({ role: "assistant", content: `${wt("formNotLoaded")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      } finally {
        setIsLoading(false);
      }
    };

    runContinuation();
  }, [formDataSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── AI messaging ──────────────────────────────────────────────────────────

  // After a save tool completes, send the function result back to the AI so it can
  // chain a follow-up action (e.g. navigation) from the same user request.
  const continueAfterToolCall = async (toolName, toolArgs, resultSummary, currentHistory, chatEndpoint, ctx, suppressPlainTextResponse = false) => {
    const toolResultHistory = [
      ...currentHistory,
      { role: "assistant", content: null, function_call: { name: toolName, arguments: JSON.stringify(toolArgs) } },
      { role: "function", name: toolName, content: resultSummary },
    ];
    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildChatPayload({ messages: toolResultHistory, ctx, assistantMode })),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "AI request failed");
      applyDetectedLanguage(data.detectedLanguage);
      if (data.type === "tool_call") {
        // Guard: if the screen changed since the AI was sent this context, discard the tool call.
        const postToolCtx = getScreenContext();
        if (postToolCtx?.screenId !== ctx?.screenId) return;
        await applyToolCall(data.tool, data.args, toolResultHistory);
      } else if (!suppressPlainTextResponse) {
        addMessage({ role: "assistant", content: data.content || toolArgs.explanation });
        if (isVoiceModeRef.current) speak(data.content || toolArgs.explanation);
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
      if (!suppressPlainTextResponse) {
        addMessage({ role: "assistant", content: toolArgs.explanation });
        if (isVoiceModeRef.current) speak(toolArgs.explanation);
      }
    }
  };

  // Adds the "Now on: X" screen announcement translation when translation mode is active.
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
  useEffect(() => {
    if (!translationMode) {
      setTranslationTooltip(null);
      tooltipTargetRef.current = null;
      clearTimeout(tooltipTimerRef.current);
      return;
    }

    const { lang, langName } = translationMode;

    const getTextBlock = (el) => {
      if (!el) return null;
      if (panelRef.current?.contains(el)) return null;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return null;

      let node = el;
      while (node && node !== document.body) {
        if (node === panelRef.current) return null;
        const hasDirectText = Array.from(node.childNodes).some(
          (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim().length > 1
        );
        if (hasDirectText) return node;
        node = node.parentElement;
      }
      return null;
    };

    const handleMouseOver = (e) => {
      const label = getTextBlock(e.target);
      if (!label) return;
      if (label === tooltipTargetRef.current) return;

      clearTimeout(tooltipTimerRef.current);
      tooltipTargetRef.current = label;
      setTranslationTooltip(null);

      const text = label.textContent?.trim();
      if (!text) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      tooltipTimerRef.current = setTimeout(async () => {
        if (tooltipTargetRef.current !== label) return;

        const x = mouseX;
        const y = mouseY - 12;

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
        } catch { /* silently ignore */ }
      }, 400);
    };

    const handleMouseOut = (e) => {
      const current = tooltipTargetRef.current;
      if (!current) return;
      const relatedTarget = e.relatedTarget;
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
  }, [translationMode]);

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

  const rectsOverlap = (a, b) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  // Move the panel out of the way of `el` if they overlap.
  const dodgeForField = (el) => {
    if (!el || !panelRef.current) return;
    const t = panelTargetRef.current;
    const panelRect = { top: t.top, left: t.left, right: t.left + t.width, bottom: t.top + t.height };

    let fieldRect = el.getBoundingClientRect();

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

    if (el.getAttribute?.("data-ai-type") === "sign") {
      let sib = el.previousElementSibling;
      while (sib) {
        const sr = sib.getBoundingClientRect();
        if (sr.height > 0) {
          fieldRect = {
            left:   Math.min(fieldRect.left,   sr.left),
            right:  Math.max(fieldRect.right,  sr.right),
            top:    Math.min(fieldRect.top,    sr.top),
            bottom: Math.max(fieldRect.bottom, sr.bottom),
          };
        }
        sib = sib.previousElementSibling;
      }
    }

    // Include the field's label so it is never covered.
    let labelEl = el.closest(".input-box")?.querySelector("h4") ?? null;
    if (!labelEl && el.id) {
      labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    }
    if (labelEl) {
      const lr = labelEl.getBoundingClientRect();
      fieldRect = {
        left:   Math.min(fieldRect.left,   lr.left),
        right:  Math.max(fieldRect.right,  lr.right),
        top:    Math.min(fieldRect.top,    lr.top),
        bottom: Math.max(fieldRect.bottom, lr.bottom),
      };
    }

    const adjBtn = findAdjacentButton(el);
    if (adjBtn) {
      const btnRect = adjBtn.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const vertGap = Math.max(0, btnRect.top - elRect.bottom, elRect.top - btnRect.bottom);
      if (vertGap <= 100) {
        fieldRect = {
          left:   Math.min(fieldRect.left,   btnRect.left),
          right:  Math.max(fieldRect.right,  btnRect.right),
          top:    Math.min(fieldRect.top,    btnRect.top),
          bottom: Math.max(fieldRect.bottom, btnRect.bottom),
        };
      }
    }

    if (!rectsOverlap(panelRect, fieldRect)) return;

    if (!homePositionRef.current) {
      homePositionRef.current = {
        top: panelRect.top,
        left: panelRect.left,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
      };
    }

    const M = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const regions = [
      { id: "right", left: fieldRect.right + M, top: M,               w: vw - fieldRect.right - M * 2, h: vh - M * 2 },
      { id: "left",  left: M,                   top: M,               w: fieldRect.left - M * 2,        h: vh - M * 2 },
      { id: "below", left: M,                   top: fieldRect.bottom + M, w: vw - M * 2, h: vh - fieldRect.bottom - M * 2 },
      { id: "above", left: M,                   top: M,               w: vw - M * 2, h: fieldRect.top - M * 2 },
    ];

    const scored = regions
      .filter((r) => r.w >= PANEL_MIN_WIDTH && r.h >= PANEL_MIN_HEIGHT)
      .map((r) => {
        const fitW = Math.min(PANEL_WIDTH, r.w);
        const fitH = Math.min(PANEL_HEIGHT, r.h);
        return { ...r, fitW, fitH, score: fitW * fitH };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0] ?? regions
      .map((r) => ({ ...r, fitW: Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_WIDTH, r.w)), fitH: Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_HEIGHT, r.h)), score: r.w * r.h }))
      .sort((a, b) => b.score - a.score)[0];

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

    let newLeft = best.left;
    let newTop  = best.top;
    if (best.id === "left")  newLeft = Math.max(M, fieldRect.left - newW - M);
    if (best.id === "right") newLeft = fieldRect.right + M;
    if (best.id === "above") newTop  = Math.max(M, fieldRect.top - newH - M);
    if (best.id === "below") newTop  = fieldRect.bottom + M;

    if (best.id === "above" || best.id === "below") {
      newLeft = Math.max(M, Math.min(vw - newW - M, panelRect.left));
    }
    if (best.id === "left" || best.id === "right") {
      const fieldCY = (fieldRect.top + fieldRect.bottom) / 2;
      newTop = Math.max(M, Math.min(vh - newH - M, fieldCY - newH / 2));
    }

    newTop  = Math.max(M, Math.min(vh - newH - M, newTop));
    newLeft = Math.max(M, Math.min(vw - newW - M, newLeft));

    panelTargetRef.current = { top: newTop, left: newLeft, width: newW, height: newH };
    setPanelWidth(newW);
    setPanelHeight(newH);
    setPosition({ top: newTop, left: newLeft });
    setTimeout(() => scrollToBottom(), 50);
  };

  // ── end panel dodge helpers ────────────────────────────────────────────────

  const applyToolCall = createApplyToolCall({
    getScreenContext,
    assistantMode,
    addMessage,
    isVoiceModeRef,
    speak,
    wt,
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
    dodgeForField,
    scrollToBottom,
    activatedFieldIdRef,
    inputRef,
    suppressChatFocusRef,
    suppressNextScreenGreetingRef,
    pendingFollowUpRef,
    navTimeoutRef,
    translationModeRef,
    setTranslationMode,
    tooltipCacheRef,
    sendMessageRef,
    addBrandingToFormGlobal,
  });

  // ── Assisted Direct Entry (ADE) panel callbacks ────────────────────────────
  const handleAdePanelComplete = useCallback(async (value) => {
    const pending = adePanelCallbackRef.current;
    if (!pending) return;
    adePanelCallbackRef.current = null;
    setAdePanel(null);

    const { args, history, ctx } = pending;
    const { fieldId } = args;
    const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
    const fieldLabel = fieldMeta?.label || fieldId;
    const fieldMode = fieldMeta?.fieldMode || "direct";
    const defaultEndpoint = assistantMode === "applicant"
      ? `${SERVER_URL}/api/ai/applicant-chat`
      : `${SERVER_URL}/api/ai/branding-chat`;
    const chatEndpoint = ctx?.aiEndpoint || defaultEndpoint;

    if (fieldMode === "secure") {
      if (ctx.actions.fillField) {
        await ctx.actions.fillField({ fieldId, value });
      }
      const patchedCtx = {
        ...ctx,
        currentState: {
          ...ctx.currentState,
          fields: ctx.currentState?.fields?.map((f) =>
            f.id === fieldId ? { ...f, value: "[secure]", filled: true } : f
          ) ?? [],
        },
      };
      await continueAfterToolCall(
        "openFieldPanel", args,
        `SECURE_PANEL_COMPLETE: Field "${fieldLabel}" was filled securely. The value was captured locally and was NOT transmitted to AI — do not ask for or repeat it. Mark this field as complete and move to the next field in list order.`,
        history, chatEndpoint, patchedCtx
      );
    } else {
      const filledValue = value || "";

      const targetEl =
        document.getElementById(fieldId) ||
        document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
      const isPlaces =
        targetEl?.getAttribute?.("data-ai-type") === "places" ||
        !!targetEl?.closest?.("[data-places-input]");

      if (isPlaces) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      const patchedFields = ctx.currentState?.fields?.map((f) => {
        if (f.id === fieldId) return { ...f, value: filledValue, filled: !!filledValue };
        if (f.isSignature) return f;
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
            const isPhone = f.type === "tel" || /phone|mobile|cell/i.test(f.id || "") || /phone|mobile|cell/i.test(el.name || "");
            domFilled = isPhone
              ? (domValue.match(/\d/g) || []).length >= 7
              : !!domValue.trim();
          }
        }
        return { ...f, value: domValue, filled: domFilled };
      }) ?? [];

      const patchedCtx = {
        ...ctx,
        currentState: { ...ctx.currentState, fields: patchedFields },
      };

      const isRequired = fieldMeta?.required ?? false;

      if (filledValue) {
        confirmedValuesRef.current[fieldId] = filledValue;
      }

      if (isPlaces) {
        const originalFields = ctx.currentState?.fields ?? [];
        for (const pf of patchedFields) {
          if (pf.id === fieldId) continue;
          if (!pf.filled || !pf.value) continue;
          const original = originalFields.find((f) => f.id === pf.id);
          if (!original?.filled) {
            confirmedValuesRef.current[pf.id] = pf.value;
          }
        }
      }

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

      await continueAfterToolCall(
        "openFieldPanel", args,
        resultSummary,
        history, chatEndpoint, patchedCtx
      );
    }
  }, [continueAfterToolCall]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdePanelCancel = useCallback(async () => {
    const pending = adePanelCallbackRef.current;
    adePanelCallbackRef.current = null;
    setAdePanel(null);
    if (!pending) return;

    const { args, history, ctx } = pending;
    const { fieldId } = args;
    const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
    const isRequired = fieldMeta?.required ?? false;
    const defaultEndpoint = assistantMode === "applicant"
      ? `${SERVER_URL}/api/ai/applicant-chat`
      : `${SERVER_URL}/api/ai/branding-chat`;
    const chatEndpoint = ctx?.aiEndpoint || defaultEndpoint;

    await continueAfterToolCall(
      "openFieldPanel", args,
      isRequired
        ? `panel dismissed without a value — field is still empty and required`
        : `panel dismissed without a value — field is still empty and optional`,
      history, chatEndpoint, ctx
    );
  }, [continueAfterToolCall, assistantMode]);

  // When a "direct" ADE panel opens, temporarily re-enable the target field only.
  useEffect(() => {
    if (!adePanel || adePanel.fieldMode !== "direct") return;

    const targetEl =
      document.getElementById(adePanel.fieldId) ||
      document.querySelector(`[name="${CSS.escape(adePanel.fieldId)}"]`) ||
      document.querySelector(`[data-ai-id="${CSS.escape(adePanel.fieldId)}"]`);

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
  }, [adePanel]);

  // Scroll to bottom when the ADE panel opens or closes — its height affects the layout.
  useEffect(() => {
    setTimeout(() => scrollToBottom(), 50);
  }, [adePanel, scrollToBottom]);

  // ── Pre-fill confirmation handlers ────────────────────────────────────────
  const handlePreFillConfirm = useCallback(() => {
    setPreFillModal(null);
  }, []);

  const handlePreFillSkip = useCallback(() => {
    setPreFillModal(null);
  }, []);

  // ── Field-error modal handlers ────────────────────────────────────────────
  const replayBlockedClick = useCallback(() => {
    const el = blockedClickTargetRef.current;
    blockedClickTargetRef.current = null;
    pendingFieldErrorRef.current = null;
    if (el) setTimeout(() => el.click(), 0);
  }, []);

  const handleFieldErrorKeep = useCallback(() => {
    if (!fieldErrorModal) return;
    const { fieldId, currentValue } = fieldErrorModal;
    if (!confirmedErrorsRef.current[fieldId]) confirmedErrorsRef.current[fieldId] = new Set();
    confirmedErrorsRef.current[fieldId].add(currentValue);
    setFieldErrorModal(null);
    replayBlockedClick();
  }, [fieldErrorModal, replayBlockedClick]);

  const handleFieldErrorSave = useCallback(async (correctedValue) => {
    if (!fieldErrorModal) return;
    const { fieldId } = fieldErrorModal;
    setFieldErrorModal(null);
    const ctx = getScreenContext();
    if (ctx?.actions?.fillField) {
      const el = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
      if (el) dodgeForField(el);
      await ctx.actions.fillField({ fieldId, value: correctedValue });
    }
    replayBlockedClick();
  }, [fieldErrorModal, replayBlockedClick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle action buttons embedded in assistant messages
  const handleMessageAction = useCallback(() => {
    // No intro action buttons currently in use
  }, []);

  const sendMessage = async (text, { silent = false } = {}) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;
    if (!silent) setInput("");

    const userMsg = { role: "user", content };
    if (!silent) addMessage(userMsg);
    setIsLoading(true);

    const ctx = getScreenContext();
    const defaultEndpoint = assistantMode === "applicant"
      ? `${SERVER_URL}/api/ai/applicant-chat`
      : `${SERVER_URL}/api/ai/branding-chat`;
    const chatEndpoint = ctx?.aiEndpoint || defaultEndpoint;
    const history = [...messages, userMsg]
      // Drop visual-only assistant messages (formPreview bubbles with empty content) —
      // Bedrock rejects { text: "" } content blocks, and they carry no AI context value.
      .filter((m) => m.role !== "assistant" || m.content || m.function_call)
      .map((m) => {
        const msg = { role: m.role, content: m.content ?? null };
        if (m.function_call) msg.function_call = m.function_call;
        if (m.name) msg.name = m.name;
        // Embed suggestColors hex values into content so the AI can reproduce them exactly when asked to apply
        if (m.toolCall?.tool === "suggestColors" && m.toolCall?.colors?.length) {
          const colorList = m.toolCall.colors
            .map((c) => `${c.hex}→${c.targetProperty || c.purpose}`)
            .join(", ");
          msg.content = `${msg.content ?? ""}\n[Suggested colors: ${colorList}]`;
        }
        return msg;
      });

    // For applicant mode, discover live field state from the DOM so the AI
    // always has up-to-date required/filled info.
    const liveFields = (assistantMode === "applicant" && ctx?.formRef?.current)
      ? discoverFormFields(ctx.formRef.current, { silent: true })
      : null;
    const enrichedCurrentState = liveFields
      ? { ...ctx?.currentState, fields: liveFields }
      : ctx?.currentState;

    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildChatPayload({
          messages: history,
          ctx,
          assistantMode,
          currentState: enrichedCurrentState,
          formLanguage: formLanguageRef.current,
        })),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "AI request failed");
      applyDetectedLanguage(data.detectedLanguage);

      if (data.type === "tool_call") {
        await applyToolCall(data.tool, data.args, history);
      } else {
        addMessage({ role: "assistant", content: data.content });
        if (isVoiceModeRef.current) speak(data.content);
      }
    } catch (err) {
      console.error("[AI Chat error]", err);
      addMessage({ role: "assistant", content: `${wt("error")}${err.message ? `: ${err.message}` : ""}. ${wt("tryAgain")}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Keep refs current so conversation-mode callbacks always call the latest functions
  sendMessageRef.current = sendMessage;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleOpenFab = () => {
    // Applicant manually reopening — clear the "user closed" flag so it auto-opens again going forward
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

  // Never show the widget on the login page or when no user is authenticated,
  // unless this is an applicant form route (publicly accessible, no admin login required)
  const isApplicantFormRoute = pathname.startsWith("/application-form/");
  if (pathname === "/login" || (!user && !isApplicantFormRoute)) return null;

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
