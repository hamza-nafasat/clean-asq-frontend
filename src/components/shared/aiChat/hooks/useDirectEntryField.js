import { useEffect, useRef, useState } from "react";
import { FIELD_TYPES } from "@/constants";
import { FIELD_MODES } from "../utils/aiChat.constants.js";

const COMPLETE_SOURCES = { BLUR: "blur", CHANGE: "change", ENTER: "enter", TAB: "tab" };

const findField = (fieldId) =>
  document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);

// focus the real field, detect when filled
const useDirectEntryField = ({ fieldId, fieldMode, onComplete }) => {
  const [fieldFocused, setFieldFocused] = useState(false);

  // latest onComplete for the listeners
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (fieldMode !== FIELD_MODES.DIRECT) return;
    const el = findField(fieldId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        el.focus();
        setFieldFocused(true);
      }, 400);
    }
  }, [fieldId, fieldMode]);

  useEffect(() => {
    if (fieldMode !== FIELD_MODES.DIRECT) return;
    const el = findField(fieldId);
    if (!el) return;

    const isDateField = el.type === FIELD_TYPES.DATE;
    let completed = false;
    let isTyping = false;
    let typingTimer = null;

    const tryComplete = (source) => {
      if (completed) return;
      const value = el.value ?? "";

      // date change fires mid-typing
      if (isDateField && source === COMPLETE_SOURCES.CHANGE && isTyping) return;

      // only tab or enter skip empty
      if (!value.trim() && source !== COMPLETE_SOURCES.TAB && source !== COMPLETE_SOURCES.ENTER) return;

      completed = true;
      clearTimeout(typingTimer);
      onCompleteRef.current(value);
    };

    // delay so autocomplete fills first
    const onBlur = () => setTimeout(() => tryComplete(COMPLETE_SOURCES.BLUR), 200);
    const onChange = () => setTimeout(() => tryComplete(COMPLETE_SOURCES.CHANGE), 50);
    const onKeyDown = (e) => {
      if (isDateField && /^[0-9]$/.test(e.key)) {
        isTyping = true;
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
          isTyping = false;
        }, 3000);
      }
      if (e.key === "Enter") setTimeout(() => tryComplete(COMPLETE_SOURCES.ENTER), 150);
      if (e.key === "Tab") setTimeout(() => tryComplete(COMPLETE_SOURCES.TAB), 150);
    };

    el.addEventListener("blur", onBlur);
    el.addEventListener("change", onChange);
    el.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(typingTimer);
      el.removeEventListener("blur", onBlur);
      el.removeEventListener("change", onChange);
      el.removeEventListener("keydown", onKeyDown);
    };
  }, [fieldId, fieldMode]);

  return fieldFocused;
};

export default useDirectEntryField;
