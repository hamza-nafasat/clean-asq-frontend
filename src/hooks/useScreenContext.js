import useAiChat from "@/hooks/useAiChat";
import { useEffect } from "react";
// call this in any page to register it with the AI chat widget
export const useScreenContext = (context) => {
  const { registerScreenContext, unregisterScreenContext } = useAiChat();
  const enabled = context.enabled !== false; // default true

  useEffect(() => {
    if (enabled) {
      registerScreenContext(context);
    } else {
      unregisterScreenContext();
    }
    return () => unregisterScreenContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.deps, enabled]);
};
