import { useEffect } from "react";
import useAiChat from "@/hooks/useAiChat";
import { AI_ASSISTANT_MODES, STORAGE_KEYS, WIDGET_CLOSED_FLAG } from "@/constants";

// register an applicant page with the AI widget and switch it to applicant mode
export const useApplicantScreenContext = (context, { clearOnMount = false, autoOpen = false } = {}) => {
  const { registerScreenContext, unregisterScreenContext, setAssistantMode, resetSession, setIsOpen } = useAiChat();

  useEffect(() => {
    setAssistantMode(AI_ASSISTANT_MODES.APPLICANT);
    // clears messages, language and voice mode for a new application
    if (clearOnMount) resetSession();
    if (autoOpen) {
      const userClosed = sessionStorage.getItem(STORAGE_KEYS.AI_WIDGET_USER_CLOSED) === WIDGET_CLOSED_FLAG;
      if (!userClosed) setIsOpen(true);
    }
    return () => setAssistantMode(AI_ASSISTANT_MODES.SERVICE_PROVIDER);
  }, [setAssistantMode, resetSession, setIsOpen, clearOnMount, autoOpen]);

  useEffect(() => {
    registerScreenContext(context);
    return () => unregisterScreenContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.deps]);
};
