import { AI_ENDPOINTS, CHAT_ROLES, SERVER_URL } from "@/components/shared/aiChat/constants/aiChatConstants.js";
import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";
import { postJson } from "@/components/shared/aiChat/logic/toolHelpers.js";

const LOGO_DONE_TEXT = "Done! The modified logo has been added to your available logos.";

const LOGO_PROCESSING_PATHS = {
  [AI_TOOLS.RESIZE_LOGO]: "logo-resize",
  [AI_TOOLS.CROP_LOGO]: "logo-crop",
  [AI_TOOLS.ROUND_LOGO_CORNERS]: "logo-round-corners",
  [AI_TOOLS.FLATTEN_LOGO]: "logo-flatten",
  [AI_TOOLS.FLIP_LOGO]: "logo-flip",
  [AI_TOOLS.ROTATE_LOGO]: "logo-rotate",
  [AI_TOOLS.GRAYSCALE_LOGO]: "logo-grayscale",
  [AI_TOOLS.ADD_LOGO_PADDING]: "logo-padding",
  [AI_TOOLS.TRIM_LOGO]: "logo-trim",
  [AI_TOOLS.REMOVE_BACKGROUND_FROM_LOGO]: "logo-remove-background",
};

const createLogoTools = ({ bindings }) => {
  const { addMessage, isVoiceModeRef, speak, setIsLoading, getScreenContext } = bindings;

  // post a logo job, add the result to the logo panel, and confirm
  const runLogoJob = async ({ url, body, failureMessage, doneText, errorPrefix }) => {
    setIsLoading(true);
    try {
      const data = await postJson(url, body);
      if (!data.success) throw new Error(data.message || failureMessage);
      const freshCtx = getScreenContext();
      if (freshCtx?.actions?.addLogo) freshCtx.actions.addLogo(data.data?.url);
      addMessage({ role: CHAT_ROLES.ASSISTANT, content: doneText });
      if (isVoiceModeRef.current) speak(LOGO_DONE_TEXT);
    } catch (err) {
      addMessage({ role: CHAT_ROLES.ASSISTANT, content: `${errorPrefix}: ${err.message || "please try again."}` });
    } finally {
      setIsLoading(false);
    }
  };

  const processLogo = (tool) => async (args) => {
    const { logoUrl, explanation, ...params } = args;
    addMessage({ role: CHAT_ROLES.ASSISTANT, content: explanation });
    await runLogoJob({
      url: `${SERVER_URL}/api/ai/${LOGO_PROCESSING_PATHS[tool]}`,
      body: { logoUrl, ...params },
      failureMessage: "Logo processing failed",
      doneText: LOGO_DONE_TEXT,
      errorPrefix: "Sorry, I couldn't process the logo",
    });
  };

  return {
    [AI_TOOLS.EDIT_LOGO]: async (args) => {
      const { logoUrl, instructions, explanation } = args;
      addMessage({ role: CHAT_ROLES.ASSISTANT, content: `${explanation} — this may take up to 30 seconds…` });
      await runLogoJob({
        url: AI_ENDPOINTS.LOGO_EDIT,
        body: { logoUrl, instructions },
        failureMessage: "Logo edit failed",
        doneText:
          "Done! The modified logo has been added to your available logos — you can now select it from the logo panel.",
        errorPrefix: "Sorry, I couldn't edit the logo",
      });
    },
    ...Object.fromEntries(Object.keys(LOGO_PROCESSING_PATHS).map((tool) => [tool, processLogo(tool)])),
  };
};

export default createLogoTools;
