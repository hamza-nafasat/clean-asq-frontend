import { useCallback } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
  addMessage as addMessageAction,
  bumpFieldChangeSignal,
  bumpFormDataSignal,
  clearMessages as clearMessagesAction,
  resetSession as resetSessionAction,
  setAssistantMode as setAssistantModeAction,
  setCurrentScreenId,
  setIsLoading as setIsLoadingAction,
  setIsOpen as setIsOpenAction,
} from "@/redux/slices/aiChat.slice";
import { discoverFormFields, domFillField } from "@/utils/discoverFormFields";

// one assistant per app, so its live references sit at module scope
const screenContextRef = { current: null };
const overlayContextRef = { current: null };
const currentScreenIdRef = { current: null };
const formDataVersionRef = { current: { screenId: null, formId: null } };
const prevFieldValuesRef = { current: {} };
const continuationPendingRef = { current: false };
const actionLogRef = { current: [] };

const resolveValue = (value, current) => (typeof value === "function" ? value(current) : value);

const useAiChat = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const aiChat = useSelector((state) => state.aiChat);

  const setIsOpen = useCallback(
    (value) => dispatch(setIsOpenAction(resolveValue(value, store.getState().aiChat.isOpen))),
    [dispatch, store],
  );
  const setIsLoading = useCallback(
    (value) => dispatch(setIsLoadingAction(resolveValue(value, store.getState().aiChat.isLoading))),
    [dispatch, store],
  );
  const setAssistantMode = useCallback(
    (value) => dispatch(setAssistantModeAction(resolveValue(value, store.getState().aiChat.assistantMode))),
    [dispatch, store],
  );

  // screens register their state and actions; the conversation survives screen changes
  const registerScreenContext = useCallback(
    (context) => {
      if (context?.formRef?.current) {
        const container = context.formRef.current;

        // live DOM field order and values win over the passed field list
        const discovered = discoverFormFields(container);
        if (discovered.length > 0) {
          context = { ...context, currentState: { ...context.currentState, fields: discovered } };
        }

        // fill fields through each field's own onChange unless the screen overrides it
        if (!context.actions?.fillField) {
          context = {
            ...context,
            actions: { ...context.actions, fillField: ({ fieldId, value }) => domFillField(container, fieldId, value) },
          };
        }
      }

      const incoming = context?.screenId ?? null;
      if (incoming && incoming !== currentScreenIdRef.current) {
        currentScreenIdRef.current = incoming;
        dispatch(setCurrentScreenId(incoming));
        formDataVersionRef.current = { screenId: incoming, formId: null };
      }

      // signal when a new form loads, or when a pending form load fails
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
        dispatch(bumpFormDataSignal());
      } else if (continuationPendingRef.current && incoming === formDataVersionRef.current.screenId && formLoadError) {
        continuationPendingRef.current = false;
        dispatch(bumpFormDataSignal());
      }

      // detect fields the user typed into directly
      const incomingFields = context?.currentState?.fields;
      if (incoming && incomingFields?.length) {
        let hasUserChange = false;
        for (const field of incomingFields) {
          const key = `${incoming}_${field.id}`;
          const previous = prevFieldValuesRef.current[key];
          const current = field.value ?? "";
          if (previous !== undefined && previous !== current) hasUserChange = true;
          prevFieldValuesRef.current[key] = current;
        }
        if (hasUserChange) dispatch(bumpFieldChangeSignal());
      }

      screenContextRef.current = context;
    },
    [dispatch],
  );

  const unregisterScreenContext = useCallback(() => {
    screenContextRef.current = null;
  }, []);

  // an open overlay takes priority over the page
  const getScreenContext = useCallback(() => overlayContextRef.current ?? screenContextRef.current, []);

  const setOverlayContext = useCallback((context) => {
    overlayContextRef.current = context;
  }, []);

  const clearOverlayContext = useCallback(() => {
    overlayContextRef.current = null;
  }, []);

  const addMessage = useCallback((message) => dispatch(addMessageAction(message)), [dispatch]);

  const clearMessages = useCallback(() => dispatch(clearMessagesAction()), [dispatch]);

  const resetSession = useCallback(() => dispatch(resetSessionAction()), [dispatch]);

  const pushRevertable = useCallback((entry) => {
    actionLogRef.current.push(entry);
  }, []);

  const popRevertable = useCallback(() => actionLogRef.current.pop() ?? null, []);

  // the next registration of the same form counts as a fresh load
  const signalContinuationPending = useCallback(() => {
    formDataVersionRef.current = { ...formDataVersionRef.current, formId: null };
    continuationPendingRef.current = true;
  }, []);

  return {
    ...aiChat,
    setIsOpen,
    addMessage,
    clearMessages,
    resetSession,
    setIsLoading,
    registerScreenContext,
    unregisterScreenContext,
    getScreenContext,
    setOverlayContext,
    clearOverlayContext,
    pushRevertable,
    popRevertable,
    signalContinuationPending,
    setAssistantMode,
  };
};

export default useAiChat;
