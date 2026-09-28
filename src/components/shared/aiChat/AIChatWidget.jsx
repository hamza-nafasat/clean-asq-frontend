import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useUpdateMyProfileMutation } from "@/redux/apis/auth.apis";
import { userExist } from "@/redux/slices/auth.slice";
import useAiChat from "@/hooks/useAiChat";
import useBranding from "@/hooks/useBranding";
import ChatFab from "./components/ChatFab.jsx";
import ChatOverlays from "./components/ChatOverlays.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import useAdePanel from "./hooks/useAdePanel.js";
import { useAiVoice } from "./hooks/useAiVoice.js";
import useChatMessaging from "./hooks/useChatMessaging.js";
import useFabNudge from "./hooks/useFabNudge.js";
import useFieldErrorMonitor from "./hooks/useFieldErrorMonitor.js";
import useFieldFocusDodge from "./hooks/useFieldFocusDodge.js";
import usePanelLayout from "./hooks/usePanelLayout.js";
import usePreFillReview from "./hooks/usePreFillReview.js";
import useScreenConversation from "./hooks/useScreenConversation.js";
import useTranslationTooltip from "./hooks/useTranslationTooltip.js";
import { AI_ASSISTANT_MODES, STORAGE_KEYS, WIDGET_CLOSED_FLAG } from "@/constants";
import { contrastingIconColor, DEFAULT_AI_VOICE, DEFAULT_FORM_LANGUAGE } from "./constants/aiChatConstants.js";
import { getWidgetString } from "./logic/widgetLanguage.js";

const LOGIN_PATH = "/login";
const APPLICANT_FORM_PATH_PREFIX = "/application-form/";
const AUTO_MESSAGE_DELAY_MS = 400;
const INPUT_FOCUS_DELAY_MS = 100;
const MODE_EXIT_DELAY_MS = 150;

const AIChatWidget = () => {
  const aiChat = useAiChat();
  const { isOpen, setIsOpen, messages, addMessage, isLoading, setIsLoading, getScreenContext, currentScreenId } = aiChat;
  const { formDataSignal, widgetResetSignal, pushRevertable, popRevertable, signalContinuationPending } = aiChat;
  const { autoMessageSignal, pendingAutoMessageRef, assistantMode } = aiChat;
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const branding = useBranding();
  const { accentColor, secondaryColor, buttonTextSecondary, fontFamily, aiVoice, aiCustomPrompt } = branding;
  const { aiLaunchButtonColor, aiHeaderColor, aiBannerColor, aiBannerTextColor, primaryColor } = branding;
  const { buttonTextPrimary, aiUseCustomIcon } = branding;
  const isApplicant = assistantMode === AI_ASSISTANT_MODES.APPLICANT;

  const effectiveLaunchColor = aiLaunchButtonColor || accentColor;
  const effectiveHeaderColor = aiHeaderColor || accentColor;
  const headerIconColor = contrastingIconColor(effectiveHeaderColor);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [input, setInput] = useState("");
  const [translationMode, setTranslationMode] = useState(null);
  const [introButtonsDismissed, setIntroButtonsDismissed] = useState(false);
  const [adePanel, setAdePanel] = useState(null);
  // empty until explicitly chosen
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || "");

  const sendMessageRef = useRef(null);
  const panelRef = useRef(null);
  const fabRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const refs = {
    translationModeRef: useRef(null),
    tooltipCacheRef: useRef({}),
    formLanguageRef: useRef(DEFAULT_FORM_LANGUAGE),
    lastDetectedLanguageRef: useRef(null),
    initialGreetingShownRef: useRef(false),
    lastAnnouncedScreenIdRef: useRef(null),
    prevScreenIdRef: useRef(null),
    suppressNextScreenGreetingRef: useRef(false),
    pendingFollowUpRef: useRef(null),
    navTimeoutRef: useRef(null),
    pendingFormContinuationRef: useRef(null),
    preferredLanguageRef: useRef(preferredLanguage),
  };
  refs.preferredLanguageRef.current = preferredLanguage;
  const activatedFieldIdRef = useRef(null);
  const adePanelCallbackRef = useRef(null);
  const confirmedValuesRef = useRef({});
  // set when a tool focuses a field, so the chat input does not steal focus
  const suppressChatFocusRef = useRef(false);
  const userFocusedChatRef = useRef(false);
  const openedByApplicantRef = useRef(false);
  const modeExitTimerRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  // adopt the account's saved language
  useEffect(() => {
    if (user?.preferredLanguage) setPreferredLanguage(user.preferredLanguage);
  }, [user?.preferredLanguage]);

  const handleSelectPreferredLanguage = (code) => {
    setPreferredLanguage(code);
    if (user?._id) {
      updateMyProfile({ preferredLanguage: code })
        .unwrap()
        .then(() => dispatch(userExist({ ...user, preferredLanguage: code })))
        .catch((error) => console.error("Save preferred language error:", error));
    }
  };

  const voiceControls = useAiVoice({ assistantMode, voice: aiVoice || DEFAULT_AI_VOICE, sendMessageRef });
  const { speak, stopSpeaking, stopListening, setIsVoiceMode, isVoiceModeRef, pendingListenRef } = voiceControls;

  // a new applicant session resets voice and the greeting
  useEffect(() => {
    if (!widgetResetSignal) return;
    stopSpeaking();
    stopListening();
    isVoiceModeRef.current = false;
    setIsVoiceMode(false);
    pendingListenRef.current = false;
    refs.lastDetectedLanguageRef.current = null;
    refs.initialGreetingShownRef.current = false;
    refs.lastAnnouncedScreenIdRef.current = null;
  }, [widgetResetSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // send a queued message such as "Build live action" from the demo page
  useEffect(() => {
    if (!autoMessageSignal || !pendingAutoMessageRef?.current) return;
    const text = pendingAutoMessageRef.current;
    pendingAutoMessageRef.current = null;
    setTimeout(() => sendMessageRef.current?.(text), AUTO_MESSAGE_DELAY_MS);
  }, [autoMessageSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = useCallback((instant = false) => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (instant) el.scrollTop = el.scrollHeight;
    else el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  const panel = usePanelLayout({ isOpen, assistantMode, pathname, panelRef, scrollToBottom });
  const { dodgeForField } = panel;
  useFieldFocusDodge({ isOpen, assistantMode, inputRef, activatedFieldIdRef, dodgeForField });
  const fieldErrors = useFieldErrorMonitor({ assistantMode, getScreenContext, inputRef, dodgeForField });
  const { preFillModal, preFillShownRef, dismissPreFill } = usePreFillReview({
    assistantMode,
    currentScreenId,
    getScreenContext,
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // reopen at the latest message
  useEffect(() => {
    if (isOpen) scrollToBottom(true);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // applicants type into the form, so only other modes focus the chat input
  useEffect(() => {
    if (isOpen && !isApplicant) setTimeout(() => inputRef.current?.focus(), INPUT_FOCUS_DELAY_MS);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoading && isOpen && (!suppressChatFocusRef.current || userFocusedChatRef.current)) {
      inputRef.current?.focus();
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // close the widget when leaving the applicant flow
  useEffect(() => {
    if (isApplicant) {
      clearTimeout(modeExitTimerRef.current);
      modeExitTimerRef.current = null;
      openedByApplicantRef.current = true;
    } else if (openedByApplicantRef.current) {
      modeExitTimerRef.current = setTimeout(() => {
        openedByApplicantRef.current = false;
        setIsOpen(false);
        preFillShownRef.current.clear();
        sessionStorage.removeItem(STORAGE_KEYS.AI_WIDGET_USER_CLOSED);
      }, MODE_EXIT_DELAY_MS);
    }
  }, [assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fabNudged = useFabNudge({ isOpen, currentScreenId, fabRef });

  const wt = getWidgetString;

  const { syncConversationWithScreen } = useScreenConversation({
    isOpen,
    isOpenRef,
    messageCount: messages.length,
    assistantMode,
    currentScreenId,
    getScreenContext,
    addMessage,
    sendMessageRef,
    setIntroButtonsDismissed,
    refs,
  });

  const { continueAfterToolCall, sendMessage } = useChatMessaging({
    assistantMode,
    messages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    addMessage,
    getScreenContext,
    formDataSignal,
    aiCustomPrompt,
    wt,
    speak,
    isVoiceModeRef,
    dodgeForField,
    syncConversationWithScreen,
    setTranslationMode,
    refs,
    toolBindings: {
      ...refs,
      getScreenContext,
      assistantMode,
      addMessage,
      isVoiceModeRef,
      speak,
      wt,
      pushRevertable,
      popRevertable,
      navigate,
      setIsLoading,
      setAdePanel,
      adePanelCallbackRef,
      confirmedValuesRef,
      signalContinuationPending,
      dodgeForField,
      scrollToBottom,
      activatedFieldIdRef,
      inputRef,
      suppressChatFocusRef,
      setTranslationMode,
      sendMessageRef,
    },
  });
  // conversation-mode callbacks always call the latest send
  sendMessageRef.current = sendMessage;

  const translationTooltip = useTranslationTooltip({ translationMode, panelRef, tooltipCacheRef: refs.tooltipCacheRef });
  const { handleAdePanelComplete, handleAdePanelCancel } = useAdePanel({
    adePanel,
    setAdePanel,
    adePanelCallbackRef,
    assistantMode,
    continueAfterToolCall,
    confirmedValuesRef,
    scrollToBottom,
  });

  // TODO: handle intro action buttons once messages carry them
  const handleMessageAction = () => {};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleOpenFab = () => {
    // reopening by hand lets the widget auto-open again
    sessionStorage.removeItem(STORAGE_KEYS.AI_WIDGET_USER_CLOSED);
    panel.openAtHome();
    setIsOpen(true);
  };

  const handleClosePanel = () => {
    if (isApplicant) sessionStorage.setItem(STORAGE_KEYS.AI_WIDGET_USER_CLOSED, WIDGET_CLOSED_FLAG);
    setIsOpen(false);
    stopSpeaking();
    stopListening();
    isVoiceModeRef.current = false;
    setIsVoiceMode(false);
  };

  // hidden when signed out, except on public applicant form routes
  const isApplicantFormRoute = pathname.startsWith(APPLICANT_FORM_PATH_PREFIX);
  if (pathname === LOGIN_PATH || (!user && !isApplicantFormRoute)) return null;

  return (
    <>
      {!isOpen && (
        <ChatFab
          fabRef={fabRef}
          fabNudged={fabNudged}
          effectiveLaunchColor={effectiveLaunchColor}
          aiUseCustomIcon={aiUseCustomIcon}
          onOpen={handleOpenFab}
        />
      )}

      {isOpen && (
        <ChatPanel
          panelRef={panelRef}
          panelWidth={panel.panelWidth}
          panelHeight={panel.panelHeight}
          position={panel.position}
          dragRef={panel.dragRef}
          resizeRef={panel.resizeRef}
          fontFamily={fontFamily}
          effectiveHeaderColor={effectiveHeaderColor}
          effectiveBannerColor={aiBannerColor || secondaryColor}
          effectiveBannerText={aiBannerTextColor || buttonTextSecondary}
          headerIconColor={headerIconColor}
          aiUseCustomIcon={aiUseCustomIcon}
          getScreenContext={getScreenContext}
          onHeaderMouseDown={panel.handleHeaderMouseDown}
          onResizeMouseDown={panel.handleResizeMouseDown}
          onClose={handleClosePanel}
          preferredLanguage={preferredLanguage}
          onSelectPreferredLanguage={handleSelectPreferredLanguage}
          messagesContainerRef={messagesContainerRef}
          messages={messages}
          isLoading={isLoading}
          adePanel={adePanel}
          handleAdePanelComplete={handleAdePanelComplete}
          handleAdePanelCancel={handleAdePanelCancel}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
          input={input}
          setInput={setInput}
          handleKeyDown={handleKeyDown}
          suppressChatFocusRef={suppressChatFocusRef}
          userFocusedChatRef={userFocusedChatRef}
          assistantMode={assistantMode}
          sendMessage={sendMessage}
          handleMessageAction={handleMessageAction}
          introButtonsDismissed={introButtonsDismissed}
        />
      )}

      <ChatOverlays
        preFillModal={preFillModal}
        fieldErrorModal={fieldErrors.fieldErrorModal}
        translationTooltip={translationTooltip}
        effectiveHeaderColor={effectiveHeaderColor}
        headerIconColor={headerIconColor}
        primaryColor={primaryColor}
        buttonTextPrimary={buttonTextPrimary}
        fontFamily={fontFamily}
        handlePreFillConfirm={dismissPreFill}
        handlePreFillSkip={dismissPreFill}
        handleFieldErrorKeep={fieldErrors.handleFieldErrorKeep}
        handleFieldErrorSave={fieldErrors.handleFieldErrorSave}
      />
    </>
  );
};

export default AIChatWidget;
