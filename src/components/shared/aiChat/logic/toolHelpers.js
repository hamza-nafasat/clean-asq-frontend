import { HTTP_STATUSES } from "@/constants";
import { CHAT_ROLES } from "@/components/shared/aiChat/constants/aiChatConstants.js";
import { createSay } from "@/components/shared/aiChat/logic/translateMessage.js";

export const getErrorDetail = (err) => err?.data?.message || err?.message || "";

// widget string key for a refused request
const BLOCKED_STATUS_KEYS = {
  [HTTP_STATUSES.FORBIDDEN]: "noPermission",
  [HTTP_STATUSES.TOO_MANY_REQUESTS]: "tooManyRequests",
};

export const getBlockedMessageKey = (err) => BLOCKED_STATUS_KEYS[err?.status];

// json body plus the http status
export const postJson = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ...data, status: res.status };
};

const createToolHelpers = ({ addMessage, isVoiceModeRef, speak, wt, getScreenContext, preferredLanguageRef }) => {
  const say = createSay({ addMessage, isVoiceModeRef, speak, preferredLanguageRef });

  const reportCouldnt = (detail) => say(`${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`);

  // run a screen action, then confirm or report the failure
  const runActionAndSay = async (ctx, actionName, payload, explanation) => {
    if (!ctx.actions?.[actionName]) return say(wt("cantDoOnPage"));
    try {
      await ctx.actions[actionName](payload);
      await say(explanation);
    } catch (err) {
      const blockedKey = getBlockedMessageKey(err);
      if (blockedKey) return say(wt(blockedKey));
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
