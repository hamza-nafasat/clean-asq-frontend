import { useEffect, useRef } from "react";

// focus the first visible input once, after the render cascade settles
const useApplicantFocusFirstInput = (containerRef, isReady = true) => {
  const hasFocusedRef = useRef(false);

  useEffect(() => {
    if (!isReady || hasFocusedRef.current) return;
    hasFocusedRef.current = true;
    let frame2;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;
        const inputs = Array.from(container.querySelectorAll("input:not([disabled]):not([readonly])")).filter(
          (el) => el.offsetParent !== null,
        );
        if (inputs.length > 0) inputs[0].focus();
      });
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [containerRef, isReady]);
};

export default useApplicantFocusFirstInput;
