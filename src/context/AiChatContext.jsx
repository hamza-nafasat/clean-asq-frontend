import { createContext, useCallback, useContext, useRef, useState } from "react";
import { discoverFormFields, domFillField } from "../lib/discoverFormFields";

const AIChatContext = createContext(null);

/** Trim oldest turns while keeping the most recent tool chain intact. */
function trimApiHistory(history, maxTurns = 30) {
  if (history.length <= maxTurns) return history;
  return history.slice(-maxTurns);
}

export const AIChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentScreenId, setCurrentScreenId] = useState(null);
  // Incremented each time detailedForm._id arrives/changes — triggers auto-continuation
  const [formDataSignal, setFormDataSignal] = useState(0);
  // Incremented when a full session reset is requested — widget watches this to reset voice mode
  const [widgetResetSignal, setWidgetResetSignal] = useState(0);
  // Incremented when a caller wants to open the chat and auto-send a message
  const [autoMessageSignal, setAutoMessageSignal] = useState(0);
  const pendingAutoMessageRef = useRef(null);
  // "service-provider" = admin/service portal pages; "applicant" = application form pages
  const [assistantMode, setAssistantMode] = useState("service-provider");
  // Incremented when the applicant types directly into form fields (not via chat)
  const [fieldChangeSignal, setFieldChangeSignal] = useState(0);
  const screenContextRef = useRef(null);
  // Tracks the aiEndpoint of the last registered context so we can detect
  // when the user navigates to a page that uses a different AI assistant.
  const lastEndpointRef = useRef(null);
  // Overlay context — set by modals/drawers that appear on top of a page and need to
  // temporarily hijack the AI endpoint without touching the page's screen context.
  // Takes priority over screenContextRef when set.
  const overlayContextRef = useRef(null);
  const currentScreenIdRef = useRef(null);
  // Tracks { screenId, formId } to detect when a new form loads within the same screen
  const formDataVersionRef = useRef({ screenId: null, formId: null });
  // Tracks last-known field values to detect user-typed changes
  const prevFieldValuesRef = useRef({});
  // True between signalContinuationPending() and the form loading (or failing)
  const continuationPendingRef = useRef(false);
  // Stack of reversible AI actions — each entry: { description, revertFn(ctx) }
  const actionLogRef = useRef([]);
  // Full API conversation (includes hidden auto-guide turns and tool-call chains)
  const apiHistoryRef = useRef([]);

  const clearApiHistory = useCallback(() => {
    apiHistoryRef.current = [];
  }, []);

  const getApiHistory = useCallback(() => [...apiHistoryRef.current], []);

  const appendApiHistory = useCallback((entries) => {
    const batch = Array.isArray(entries) ? entries : [entries];
    apiHistoryRef.current = trimApiHistory([...apiHistoryRef.current, ...batch]);
  }, []);

  const setApiHistory = useCallback((history) => {
    apiHistoryRef.current = trimApiHistory(Array.isArray(history) ? history : []);
  }, []);

  // Screens call this to register their state + action callbacks.
  // Conversation is preserved across screen changes — no wipe.
  // If context.formRef is provided, field list is discovered from the live DOM
  // instead of using whatever was passed in currentState.fields — this ensures
  // the order and values always match exactly what is rendered on screen.
  const registerScreenContext = useCallback((context) => {
    console.log("%c[CONTEXT] registerScreenContext called", "color:#888; font-weight:bold", {
      screenId: context?.screenId,
      screenName: context?.screenName,
      fieldCount: context?.currentState?.fields?.length,
      fields: context?.currentState?.fields?.map((f) => ({
        id: f.id,
        label: f.label,
        value: f.value,
        filled: f.filled,
      })),
    });
    if (context?.formRef?.current) {
      const container = context.formRef.current;

      // Replace fields list with live DOM discovery
      const discovered = discoverFormFields(container);
      if (discovered.length > 0) {
        context = {
          ...context,
          currentState: { ...context.currentState, fields: discovered },
        };
      }
      console.log(
        "%c[CONTEXT] after DOM discovery:",
        "color:#888",
        discovered.map((f) => ({ id: f.id, label: f.label, value: f.value, filled: f.filled })),
      );

      // Auto-wire fillField via DOM dispatch — triggers each field's existing
      // onChange handler so no per-form mapping is needed.
      // A component may still override this by providing its own fillField.
      if (!context.actions?.fillField) {
        context = {
          ...context,
          actions: {
            ...context.actions,
            fillField: ({ fieldId, value }) => domFillField(container, fieldId, value),
          },
        };
      }
    }
    const incoming = context?.screenId ?? null;
    if (incoming && incoming !== currentScreenIdRef.current) {
      currentScreenIdRef.current = incoming;
      setCurrentScreenId(incoming); // reactive signal for the widget
      // Reset tracked form so the new screen can trigger a fresh signal
      formDataVersionRef.current = { screenId: incoming, formId: null };
    }

    // Fire formDataSignal when detailedForm._id appears or changes within the same screen
    const newFormId = context?.currentState?.detailedForm?._id ?? null;
    const formLoadError = context?.currentState?.detailedFormLoadError ?? false;
    if (
      incoming &&
      incoming === formDataVersionRef.current.screenId &&
      newFormId &&
      newFormId !== formDataVersionRef.current.formId
    ) {
      formDataVersionRef.current.formId = newFormId;
      continuationPendingRef.current = false;
      setFormDataSignal((s) => s + 1);
    } else if (continuationPendingRef.current && incoming === formDataVersionRef.current.screenId && formLoadError) {
      // Form fetch failed — fire the signal so the pending continuation can report the error
      continuationPendingRef.current = false;
      setFormDataSignal((s) => s + 1);
    }

    // Detect user-typed field changes (fires fieldChangeSignal for the widget to react)
    const incomingFields = context?.currentState?.fields;
    if (incoming && incomingFields?.length) {
      let hasUserChange = false;
      for (const f of incomingFields) {
        const key = `${incoming}_${f.id}`;
        const prev = prevFieldValuesRef.current[key];
        const curr = f.value ?? "";
        if (prev !== undefined && prev !== curr) hasUserChange = true;
        prevFieldValuesRef.current[key] = curr;
      }
      if (hasUserChange) setFieldChangeSignal((s) => s + 1);
    }

    // Clear conversation history when switching to a different AI assistant
    // (different aiEndpoint = different persona/tools). We track the last endpoint
    // separately from screenContextRef because unregisterScreenContext nulls the ref
    // before the new context is registered, so we can't compare from the ref alone.
    const newEndpoint = context?.aiEndpoint || null;
    if (lastEndpointRef.current && newEndpoint && lastEndpointRef.current !== newEndpoint) {
      console.log(
        `%c[CONTEXT] endpoint changed ${lastEndpointRef.current} → ${newEndpoint} — clearing API history only`,
        "color:#c80; font-weight:bold",
      );
      clearApiHistory();
    }
    if (newEndpoint) lastEndpointRef.current = newEndpoint;

    screenContextRef.current = context;
  }, [clearApiHistory]);

  const unregisterScreenContext = useCallback(() => {
    screenContextRef.current = null;
  }, []);

  // Returns overlay context when one is active, otherwise the page screen context.
  const getScreenContext = useCallback(() => overlayContextRef.current ?? screenContextRef.current, []);

  const setOverlayContext = useCallback((ctx) => {
    overlayContextRef.current = ctx;
  }, []);
  const clearOverlayContext = useCallback(() => {
    overlayContextRef.current = null;
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { ...msg, id: Date.now() + Math.random() }]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    clearApiHistory();
  }, [clearApiHistory]);

  // Full session reset: wipe history, signal widget to reset voice mode.
  // Call this when a fresh application flow begins (clearOnMount).
  const resetSession = useCallback(() => {
    setMessages([]);
    clearApiHistory();
    setWidgetResetSignal((s) => s + 1);
  }, [clearApiHistory]);

  const pushRevertable = useCallback((entry) => {
    actionLogRef.current.push(entry);
  }, []);

  const popRevertable = useCallback(() => {
    return actionLogRef.current.pop() ?? null;
  }, []);

  // Reset the tracked form ID so the next registerScreenContext call — even for the
  // same form — is treated as a new load and fires formDataSignal.
  const signalContinuationPending = useCallback(() => {
    formDataVersionRef.current = { ...formDataVersionRef.current, formId: null };
    continuationPendingRef.current = true;
  }, []);

  // Open the chat widget and auto-send a message as if the user typed it.
  // The widget watches autoMessageSignal and fires sendMessage(pendingAutoMessageRef.current).
  const triggerAutoMessage = useCallback((text) => {
    pendingAutoMessageRef.current = text;
    setIsOpen(true);
    setAutoMessageSignal((s) => s + 1);
  }, []);

  return (
    <AIChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        messages,
        addMessage,
        clearMessages,
        resetSession,
        isLoading,
        setIsLoading,
        currentScreenId,
        formDataSignal,
        widgetResetSignal,
        fieldChangeSignal,
        registerScreenContext,
        unregisterScreenContext,
        getScreenContext,
        setOverlayContext,
        clearOverlayContext,
        pushRevertable,
        popRevertable,
        signalContinuationPending,
        triggerAutoMessage,
        autoMessageSignal,
        pendingAutoMessageRef,
        assistantMode,
        setAssistantMode,
        getApiHistory,
        appendApiHistory,
        setApiHistory,
        clearApiHistory,
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
};

export const UseAIChat = () => {
  const ctx = useContext(AIChatContext);
  if (!ctx) throw new Error("useAIChat must be used inside AIChatProvider");
  return ctx;
};
