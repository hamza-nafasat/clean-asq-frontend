import { useEffect, useRef } from "react";

/**
 * Enter in a text-like input focuses the next visible text input in `containerRef`.
 * On the last input, calls `onLastFieldRef.current?.()`.
 *
 * Skips radio/checkbox/file/hidden, respects `e.defaultPrevented` (suggestion dropdowns),
 * and leaves Google Places autocomplete alone while its dropdown is open.
 *
 * @param {React.RefObject<HTMLElement|null>} containerRef
 * @param {{
 *   onLastFieldRef?: React.MutableRefObject<(() => void) | null | undefined>,
 *   excludeIds?: string[],
 *   onSpecialEnterRef?: React.MutableRefObject<((active: Element, e: KeyboardEvent) => boolean) | null | undefined>,
 * }} [options]
 */
export function useEnterToNextField(containerRef, options = {}) {
  const { excludeIds = [], onLastFieldRef, onSpecialEnterRef } = options;
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
      const type = active.type || "text";
      if (type === "radio" || type === "checkbox" || type === "hidden" || type === "file" || type === "button" || type === "submit") {
        return;
      }
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
          el.type !== "radio" &&
          el.type !== "checkbox" &&
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
    // Refs are stable; re-bind only if the container node identity changes via remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
