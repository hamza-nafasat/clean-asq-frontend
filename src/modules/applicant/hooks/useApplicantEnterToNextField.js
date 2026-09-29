import { useEffect, useRef } from "react";
import { FIELD_TYPES, KEYBOARD_KEYS } from "@/constants";
import { ENTER_SKIPPED_INPUT_TYPES } from "../utils/applicant.constants";

// enter skips radios, files and buttons
const isEnterSequenceType = (type, includeCheckboxes = false) => {
  const t = type || FIELD_TYPES.TEXT;
  if (ENTER_SKIPPED_INPUT_TYPES.includes(t)) return false;
  if (t === FIELD_TYPES.CHECKBOX) return Boolean(includeCheckboxes);
  return true;
};

const useApplicantEnterToNextField = (containerRef, options = {}) => {
  const { excludeIds = [], onLastFieldRef, onSpecialEnterRef, includeCheckboxes = false } = options;
  const excludeIdsRef = useRef(excludeIds);
  excludeIdsRef.current = excludeIds;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = (e) => {
      if (e.key !== KEYBOARD_KEYS.ENTER || e.defaultPrevented) return;
      const active = document.activeElement;
      if (!active || !container.contains(active)) return;
      if (active.tagName?.toLowerCase() !== "input") return;
      if (!isEnterSequenceType(active.type, includeCheckboxes)) return;
      if (active.disabled || active.readOnly) return;
      if (excludeIdsRef.current.includes(active.id)) return;

      // keep enter for the open places dropdown
      const pac = document.querySelector(".pac-container");
      if (pac && getComputedStyle(pac).display !== "none" && active.closest("[data-places-input]")) {
        return;
      }

      if (onSpecialEnterRef?.current?.(active, e)) return;

      const inputs = Array.from(
        container.querySelectorAll(
          "input:not([disabled]):not([readonly]):not([type=hidden]):not([type=file]):not([type=button]):not([type=submit])",
        ),
      ).filter(
        (el) =>
          el.offsetParent !== null &&
          isEnterSequenceType(el.type, includeCheckboxes) &&
          !excludeIdsRef.current.includes(el.id),
      );

      const idx = inputs.indexOf(active);
      if (idx === -1) return;
      e.preventDefault();
      if (idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      } else {
        onLastFieldRef?.current?.();
      }
    };

    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }, [containerRef, includeCheckboxes, onLastFieldRef, onSpecialEnterRef]);
};

export default useApplicantEnterToNextField;
