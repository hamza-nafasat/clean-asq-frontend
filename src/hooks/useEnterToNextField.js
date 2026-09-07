import { useEffect, useRef } from "react";

const NEVER_IN_SEQUENCE = ["radio", "hidden", "file", "button", "submit"];

export const isEnterSequenceType = (type, includeCheckboxes = false) => {
  const t = type || "text";
  if (NEVER_IN_SEQUENCE.includes(t)) return false;
  if (t === "checkbox") return Boolean(includeCheckboxes);
  return true;
};

export function useEnterToNextField(containerRef, options = {}) {
  const { excludeIds = [], onLastFieldRef, onSpecialEnterRef, includeCheckboxes = false } = options;
  const excludeIdsRef = useRef(excludeIds);
  excludeIdsRef.current = excludeIds;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = (e) => {
      if (e.key !== "Enter" || e.defaultPrevented) return;
      const active = document.activeElement;
      if (!active || !container.contains(active)) return;
      if (active.tagName?.toLowerCase() !== "input") return;
      if (!isEnterSequenceType(active.type, includeCheckboxes)) return;
      if (active.disabled || active.readOnly) return;
      if (excludeIdsRef.current.includes(active.id)) return;

      // Let Google Places keep Enter while its suggestion dropdown is open.
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
}
