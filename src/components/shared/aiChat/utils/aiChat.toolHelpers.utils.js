import { HTTP_STATUSES } from "@/constants";
import { CHAT_ROLES } from "@/components/shared/aiChat/utils/aiChat.constants.js";
import { createSay } from "@/components/shared/aiChat/utils/aiChat.translate.utils.js";

export const getErrorDetail = (err) => err?.data?.message || err?.message || "";

// widget key for refused requests
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

  // cancelled, blocked, or failed action
  const reportActionError = (err) => {
    if (err?.isCancelled) return say(wt("cancelledChange"));
    const blockedKey = getBlockedMessageKey(err);
    if (blockedKey) return say(wt(blockedKey));
    return reportCouldnt(getErrorDetail(err));
  };

  // run action; true on success
  const runActionAndSay = async (ctx, actionName, payload, explanation) => {
    if (!ctx.actions?.[actionName]) {
      say(wt("cantDoOnPage"));
      return false;
    }
    try {
      await ctx.actions[actionName](payload);
      await say(explanation);
      return true;
    } catch (err) {
      reportActionError(err);
      return false;
    }
  };

  // append preview from freshest screen
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

  return { say, reportCouldnt, reportActionError, runActionAndSay, addFormPreview };
};

export default createToolHelpers;
