import { useEffect } from "react";
import { AI_ASSISTANT_MODES } from "@/constants";
import {
  AI_ENDPOINTS,
  CHAT_ROLES,
  DEFAULT_FORM_LANGUAGE,
} from "@/components/shared/aiChat/utils/aiChat.constants.js";
import { requestTranslation, translateForDisplay } from "@/components/shared/aiChat/utils/aiChat.translate.utils.js";
import { detectFormLanguage } from "@/components/shared/aiChat/utils/aiChat.language.utils.js";

const APPLICANT_ANNOUNCE_DELAY_MS = 600;
const FOLLOW_UP_SEND_DELAY_MS = 800;

const getStepInfo = (state) =>
  state?.currentStep != null ? ` — Step ${state.currentStep + 1} of ${state.totalSteps}` : "";

const buildGreeting = (ctx, isApplicant) => {
  const screenName = ctx?.screenName || "this screen";
  if (!isApplicant) {
    return (
      ctx?.greeting ||
      `Hi! I'm your assistant. I can see you're working on **${screenName}**.\n\nWhat would you like to do?`
    );
  }
  return (
    ctx?.greeting ||
    `Hi! I'm your **application assistant**.\n\nYou're currently on **${screenName}**${getStepInfo(ctx?.currentState)}.\n\nHere's what I can do:\n- **Answer questions** about any field or requirement\n- **Explain what's needed** for each section\n- **Scroll to any field** if you're not sure where to find it\n- **Communicate in any language** — pick yours from the language menu above\n\nFeel free to ask me anything!`
  );
};

// greeting, screen announcements, and follow-ups after navigation
const useScreenConversation = ({
  isOpen,
  isOpenRef,
  messageCount,
  assistantMode,
  currentScreenId,
  getScreenContext,
  addMessage,
  sendMessageRef,
  setIntroButtonsDismissed,
  refs,
}) => {
  const { initialGreetingShownRef, lastAnnouncedScreenIdRef, prevScreenIdRef, formLanguageRef } = refs;
  const { lastDetectedLanguageRef, suppressNextScreenGreetingRef, pendingFollowUpRef, navTimeoutRef } = refs;
  const { translationModeRef, preferredLanguageRef } = refs;
  const isApplicant = assistantMode === AI_ASSISTANT_MODES.APPLICANT;

  // post an announcement in the chosen language
  const announce = async (content, targetLang = preferredLanguageRef.current) => {
    const msg = { role: CHAT_ROLES.ASSISTANT, content: await translateForDisplay(content, targetLang) };
    addMessage(msg);
    return msg;
  };

  // `resumed` means the screen changed while the panel was closed
  const buildScreenAnnouncement = (ctx, { resumed = false } = {}) => {
    const screenName = ctx?.screenName || ctx?.screenId || "this screen";
    const stepStr = getStepInfo(ctx?.currentState);

    if (!resumed) {
      return isApplicant
        ? `You're now on **${screenName}**${stepStr}. Feel free to ask me anything about this step.`
        : ctx?.greeting || `I'm now on **${screenName}**. What would you like to do?`;
    }

    return isApplicant
      ? `While this chat was closed you moved to **${screenName}**${stepStr}. I'm now looking at this page — feel free to ask me anything about it.`
      : `While this chat was closed you moved to **${screenName}**. I'm now working with this page — what would you like to do?`;
  };

  // add the screen name in the translation language
  const announceScreen = async (name) => {
    const tm = translationModeRef.current;
    if (!tm) return;
    const translation = await requestTranslation({ text: name, targetLang: tm.lang, targetLangName: tm.langName });
    if (translation) addMessage({ role: CHAT_ROLES.ASSISTANT, content: `*(${tm.langName}: **${translation}**)* ` });
  };

  // announce a screen the transcript has not seen; returns the added message
  const syncConversationWithScreen = async () => {
    const ctx = getScreenContext();
    const screenId = ctx?.screenId;
    if (!screenId) return null;
    if (lastAnnouncedScreenIdRef.current === null) {
      // the greeting or first message anchors the conversation
      lastAnnouncedScreenIdRef.current = screenId;
      return null;
    }
    if (lastAnnouncedScreenIdRef.current === screenId) return null;

    lastAnnouncedScreenIdRef.current = screenId;
    const content = buildScreenAnnouncement(ctx, { resumed: true });
    if (!content) return null;
    const msg = await announce(content);
    if (isApplicant) announceScreen(ctx.screenName || screenId);
    return msg;
  };

  // greet on the very first open
  useEffect(() => {
    if (!isOpen || messageCount !== 0) return;
    if (initialGreetingShownRef.current) return;
    const ctx = getScreenContext();

    if (isApplicant) {
      const detectedLang = detectFormLanguage(ctx);
      formLanguageRef.current = detectedLang;
      if (detectedLang !== DEFAULT_FORM_LANGUAGE) lastDetectedLanguageRef.current = detectedLang.toLowerCase().slice(0, 2);
      setIntroButtonsDismissed(true);
      announce(buildGreeting(ctx, true));
    } else {
      announce(buildGreeting(ctx, false));
    }
    initialGreetingShownRef.current = true;
    lastAnnouncedScreenIdRef.current = ctx?.screenId ?? null;
  }, [isOpen, messageCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // reopening after navigating while closed announces the new screen
  useEffect(() => {
    if (isOpen) syncConversationWithScreen();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // on screen change: announce it and send any pending follow-up
  useEffect(() => {
    if (!currentScreenId) return;

    const isScreenChange = prevScreenIdRef.current !== null && prevScreenIdRef.current !== currentScreenId;
    prevScreenIdRef.current = currentScreenId;
    if (!isScreenChange) return;

    const ctx = getScreenContext();
    if (isApplicant) {
      // closed: the reopen sync announces it
      if (!isOpen) return;
      const guardedScreenId = ctx?.screenId || currentScreenId;
      setTimeout(() => {
        const reCheckCtx = getScreenContext();
        if (!reCheckCtx || reCheckCtx.screenId !== guardedScreenId) return;
        if (!isOpenRef.current) return;
        if (lastAnnouncedScreenIdRef.current === guardedScreenId) return;
        lastAnnouncedScreenIdRef.current = guardedScreenId;
        announce(buildScreenAnnouncement(reCheckCtx));
        announceScreen(reCheckCtx.screenName || guardedScreenId);
      }, APPLICANT_ANNOUNCE_DELAY_MS);
    } else {
      lastAnnouncedScreenIdRef.current = currentScreenId;
      if (suppressNextScreenGreetingRef.current) {
        suppressNextScreenGreetingRef.current = false;
      } else {
        announce(buildScreenAnnouncement(ctx));
      }
    }

    if (!pendingFollowUpRef.current) return;
    const task = pendingFollowUpRef.current;
    pendingFollowUpRef.current = null;
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = null;
    }
    const taskContent = typeof task === "object" ? task.content : task;
    const taskSilent = typeof task === "object" ? !!task.silent : false;
    setTimeout(() => {
      if (sendMessageRef.current) sendMessageRef.current(taskContent, { silent: taskSilent });
    }, FOLLOW_UP_SEND_DELAY_MS);
  }, [currentScreenId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { syncConversationWithScreen };
};

export default useScreenConversation;
