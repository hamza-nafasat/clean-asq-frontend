import { UseAIChat } from "@/context/AiChatContext";
import { useEffect } from "react";
/**
 * Call this in any page to register it with the AI chat widget.
 *
 * @param {object} context
 * @param {string}   context.screenId       - unique identifier e.g. "global-branding"
 * @param {string}   context.screenName     - human-readable name e.g. "Global Branding"
 * @param {string}   context.description    - what the screen does (shown to AI as context)
 * @param {object}   context.currentState   - live snapshot of the screen's state
 * @param {object}   context.actions        - map of { fieldName: setterFn } the AI can call
 * @param {string[]} [context.logos]        - list of logo URLs available on the screen
 * @param {object}   [context.deps]         - values that trigger a context re-register (like currentState)
 * @param {boolean}  [context.enabled]      - set false to unregister this context (e.g. during a live demo)
 */
export const useScreenContext = (context) => {
  const { registerScreenContext, unregisterScreenContext } = UseAIChat();
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
