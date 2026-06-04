import { UseAIChat } from "@/context/AiChatContext";
import { useEffect } from "react";

/**
 * Register an applicant-facing page with the AI chat widget.
 * Switches the widget to "applicant" mode for the lifetime of the page.
 *
 * context.currentState.fields should be an array of:
 *   { id, label, type, value, required, filled, isSignature }
 *
 * context.actions may include:
 *   fillField(fieldId, value)  — never wire signature fields here
 *   scrollToField(fieldId)
 *   goToNextStep()
 *   goToPrevStep()
 *
 * The AI is instructed server-side to never call fillField on signature fields
 * and to never call a submitForm action (which is simply never registered).
 *
 * Pass clearOnMount: true on the first page of an application form to ensure
 * the chat history is wiped clean every time the flow starts.
 */
export const useApplicantScreenContext = (context, { clearOnMount = false, autoOpen = false } = {}) => {
  const { registerScreenContext, unregisterScreenContext, setAssistantMode, resetSession, setIsOpen } = UseAIChat();

  // Switch to applicant mode while this page is mounted; reset session and/or open widget if requested
  useEffect(() => {
    console.log(
      `%c[SCREEN-CTX] mount screenId="${context?.screenId}" clearOnMount=${clearOnMount} autoOpen=${autoOpen}`,
      "color:#0369a1; font-weight:bold",
    );
    setAssistantMode("applicant");
    if (clearOnMount) resetSession(); // clears messages, resets language to EN, resets voice mode
    if (autoOpen) {
      const userClosed = sessionStorage.getItem("ai-widget-user-closed") === "1";
      console.log(
        `%c[SCREEN-CTX] autoOpen=true userClosed=${userClosed} → screenId="${context?.screenId}"`,
        userClosed ? "color:#6b7280" : "color:#dc2626; font-weight:bold",
      );
      if (!userClosed) setIsOpen(true);
    }
    return () => {
      console.log(
        `%c[SCREEN-CTX] unmount screenId="${context?.screenId}" → setAssistantMode("service-provider")`,
        "color:#0369a1",
      );
      setAssistantMode("service-provider");
    };
  }, [setAssistantMode, resetSession, setIsOpen, clearOnMount, autoOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    registerScreenContext(context);
    return () => unregisterScreenContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.deps]);
};
