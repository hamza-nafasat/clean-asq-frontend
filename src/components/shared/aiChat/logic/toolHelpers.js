import { CHAT_ROLES } from "@/components/shared/aiChat/constants/aiChatConstants.js";

export const getErrorDetail = (err) => err?.data?.message || err?.message || "";

export const postJson = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return res.json();
};

const createToolHelpers = ({ addMessage, isVoiceModeRef, speak, wt, getScreenContext }) => {
  // show a reply and read it aloud in voice mode
  const say = (content) => {
    addMessage({ role: CHAT_ROLES.ASSISTANT, content });
    if (isVoiceModeRef.current) speak(content);
  };

  const reportCouldnt = (detail) =>
    addMessage({
      role: CHAT_ROLES.ASSISTANT,
      content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
    });

  // run a screen action, then confirm or report the failure
  const runActionAndSay = async (ctx, actionName, payload, explanation) => {
    try {
      if (ctx.actions[actionName]) await ctx.actions[actionName](payload);
      say(explanation);
    } catch (err) {
      reportCouldnt(getErrorDetail(err));
    }
  };

  // append a form preview built from the freshest matching screen
  const addFormPreview = (ctx, mapSections) => {
    const nowCtx = getScreenContext();
    const baseForm = (nowCtx?.screenId === ctx.screenId ? nowCtx : ctx).currentState?.detailedForm;
    if (!baseForm) return;
    addMessage({
      role: CHAT_ROLES.ASSISTANT,
      content: "",
      formPreview: { formName: baseForm.name || baseForm.headerText, sections: mapSections(baseForm.sections || []) },
    });
  };

  return { say, reportCouldnt, runActionAndSay, addFormPreview };
};

export default createToolHelpers;
