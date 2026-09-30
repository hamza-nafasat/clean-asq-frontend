import { useEffect } from "react";

const INPUT_FOCUS_DELAY_MS = 100;

// keeps messages scrolled and input focused
const useChatScrollFocus = ({
  isOpen,
  isLoading,
  isApplicant,
  messages,
  scrollToBottom,
  inputRef,
  suppressChatFocusRef,
  userFocusedChatRef,
}) => {
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
};

export default useChatScrollFocus;
