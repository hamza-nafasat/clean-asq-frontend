import { useEffect } from "react";
import { FIELD_TYPES } from "@/constants";

const EDITABLE_TAGS = ["INPUT", "SELECT", "TEXTAREA"];
const SIGN_MARKER_SELECTOR = "[data-ai-type='sign']";

// the panel dodges whichever form field the applicant focuses
const useFieldFocusDodge = ({ isOpen, assistantMode, inputRef, activatedFieldIdRef, dodgeForField }) => {
  useEffect(() => {
    if (!isOpen) return;

    let lastNotifiedFieldId = null;

    const onFocusIn = (e) => {
      const target = e.target;

      // phone country selector: move on to the number input
      if (target.classList?.contains("PhoneInputCountrySelect")) {
        const numberInput = target.closest(".PhoneInput")?.querySelector(".PhoneInputInput");
        if (numberInput && e.relatedTarget !== numberInput) numberInput.focus();
        return;
      }

      // signature focus lands on the wrapper or anything inside it
      const signMarker = target.closest?.(SIGN_MARKER_SELECTOR);
      if (signMarker) {
        const sigFieldId = signMarker.getAttribute("data-ai-id");
        if (sigFieldId && sigFieldId !== lastNotifiedFieldId) {
          lastNotifiedFieldId = sigFieldId;
          dodgeForField(signMarker.parentElement?.closest(SIGN_MARKER_SELECTOR) || signMarker);
        }
        return;
      }

      if (!EDITABLE_TAGS.includes(target.tagName)) return;
      if (target === inputRef.current) return;
      const fieldId = target.type === FIELD_TYPES.RADIO ? target.getAttribute("name") : target.id || target.getAttribute("name");
      if (!fieldId || fieldId === lastNotifiedFieldId) return;

      lastNotifiedFieldId = fieldId;
      activatedFieldIdRef.current = fieldId;
      dodgeForField(target);
    };

    document.addEventListener("focusin", onFocusIn, true);
    return () => document.removeEventListener("focusin", onFocusIn, true);
  }, [assistantMode, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useFieldFocusDodge;
