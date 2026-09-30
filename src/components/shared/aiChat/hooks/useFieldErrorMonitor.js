import { useEffect, useRef, useState } from "react";
import { AI_ASSISTANT_MODES } from "@/constants";
import { checkFieldForErrors } from "@/utils/checkFieldForErrors";
import {
  ACTION_ELEMENT_SELECTOR,
  buildRetryNote,
  FIELD_ERROR_MODAL_SELECTOR,
  getCheckableField,
  isNoWebsiteControl,
  isWebsiteText,
} from "@/components/shared/aiChat/utils/aiChat.fieldError.utils.js";

// silently checks applicant fields and asks to confirm obvious typos
const useFieldErrorMonitor = ({ assistantMode, getScreenContext, inputRef, dodgeForField }) => {
  const [fieldErrorModal, setFieldErrorModal] = useState(null);
  // values the applicant confirmed on purpose, per field
  const confirmedErrorsRef = useRef({});
  const pendingFieldErrorRef = useRef(null);
  const blockedClickTargetRef = useRef(null);

  useEffect(() => {
    if (assistantMode !== AI_ASSISTANT_MODES.APPLICANT) return;

    const checkAndFlag = (el) => {
      const field = getCheckableField(el, getScreenContext(), inputRef.current);
      if (!field) return false;
      const { fieldId, fieldLabel, fieldType, rawValue } = field;

      const confirmed = confirmedErrorsRef.current[fieldId];
      if (confirmed instanceof Set && confirmed.has(rawValue)) return false;

      // an error is already waiting on the applicant
      if (pendingFieldErrorRef.current) return true;

      const error = checkFieldForErrors(fieldId, fieldLabel, fieldType, rawValue);
      if (!error) return false;

      pendingFieldErrorRef.current = true;
      setFieldErrorModal({
        fieldId,
        fieldLabel,
        fieldType,
        description: error.description,
        suggestion: error.suggestion,
        currentValue: rawValue,
        retryNote: buildRetryNote(field),
      });
      return true;
    };

    // clicking "no website" blurs the url field before the box is checked
    let skipNextWebsiteFocusOut = false;

    const onCaptureMouseDown = (e) => {
      if (e.target.closest(FIELD_ERROR_MODAL_SELECTOR)) return;
      if (isNoWebsiteControl(e.target)) {
        skipNextWebsiteFocusOut = true;
        return;
      }
      const actionEl = e.target.closest(ACTION_ELEMENT_SELECTOR);
      if (!actionEl) return;
      if (checkAndFlag(document.activeElement)) blockedClickTargetRef.current = actionEl;
    };

    const onFocusOut = (e) => {
      if (skipNextWebsiteFocusOut) {
        skipNextWebsiteFocusOut = false;
        const leaving =
          `${e.target?.id || ""} ${e.target?.name || ""} ${e.target?.getAttribute?.("data-testid") || ""}`.toLowerCase();
        if (isWebsiteText(leaving)) return;
      }
      if (isNoWebsiteControl(e.relatedTarget)) return;
      checkAndFlag(e.target);
    };

    const onCaptureClick = (e) => {
      if (!pendingFieldErrorRef.current) return;
      if (e.target.closest(FIELD_ERROR_MODAL_SELECTOR)) return;
      const actionEl = e.target.closest(ACTION_ELEMENT_SELECTOR);
      if (!actionEl) return;
      e.stopPropagation();
      pendingFieldErrorRef.current = null;
      if (!blockedClickTargetRef.current) blockedClickTargetRef.current = actionEl;
    };

    document.addEventListener("mousedown", onCaptureMouseDown, true);
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("click", onCaptureClick, true);
    return () => {
      document.removeEventListener("mousedown", onCaptureMouseDown, true);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("click", onCaptureClick, true);
    };
  }, [assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // re-run the click the error modal interrupted
  const replayBlockedClick = () => {
    const el = blockedClickTargetRef.current;
    blockedClickTargetRef.current = null;
    pendingFieldErrorRef.current = null;
    if (el) setTimeout(() => el.click(), 0);
  };

  const handleFieldErrorKeep = () => {
    if (!fieldErrorModal) return;
    const { fieldId, currentValue } = fieldErrorModal;
    if (!confirmedErrorsRef.current[fieldId]) confirmedErrorsRef.current[fieldId] = new Set();
    confirmedErrorsRef.current[fieldId].add(currentValue);
    setFieldErrorModal(null);
    replayBlockedClick();
  };

  const handleFieldErrorSave = async (correctedValue) => {
    if (!fieldErrorModal) return;
    const { fieldId } = fieldErrorModal;
    setFieldErrorModal(null);
    const ctx = getScreenContext();
    if (ctx?.actions?.fillField) {
      const el = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
      if (el) dodgeForField(el);
      await ctx.actions.fillField({ fieldId, value: correctedValue });
    }
    replayBlockedClick();
  };

  return { fieldErrorModal, handleFieldErrorKeep, handleFieldErrorSave };
};

export default useFieldErrorMonitor;
