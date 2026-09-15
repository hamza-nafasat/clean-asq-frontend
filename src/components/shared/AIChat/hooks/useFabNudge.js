import { useEffect, useState } from "react";

const FAB_SIZE = 70;
const FAB_RIGHT_PX = 64;
const FAB_BOTTOM_PX = 72;
const SAMPLE_OFFSET = 18;
const SCROLL_TOLERANCE = 4;
const BOTTOM_DISTANCE = 10;
const INTERACTIVE_SELECTOR = 'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"]';

const findScroller = () => {
  const main = document.querySelector("main");
  if (main && main.scrollHeight > main.clientHeight + SCROLL_TOLERANCE) return main;
  const de = document.scrollingElement || document.documentElement;
  if (de.scrollHeight > de.clientHeight + SCROLL_TOLERANCE) return de;
  return null;
};

// true when a clickable element sits under the fab's home spot
const overlapsInteractive = (fab) => {
  const homeRight = window.innerWidth - FAB_RIGHT_PX;
  const homeBottom = window.innerHeight - FAB_BOTTOM_PX;
  const cx = homeRight - FAB_SIZE / 2;
  const cy = homeBottom - FAB_SIZE / 2;
  const samplePoints = [
    [cx, cy],
    [cx - SAMPLE_OFFSET, cy - SAMPLE_OFFSET],
    [cx + SAMPLE_OFFSET, cy - SAMPLE_OFFSET],
    [cx - SAMPLE_OFFSET, cy + SAMPLE_OFFSET],
    [cx + SAMPLE_OFFSET, cy + SAMPLE_OFFSET],
  ];

  if (fab) fab.style.pointerEvents = "none";
  const overlaps = samplePoints.some(([px, py]) => {
    let el = document.elementFromPoint(px, py);
    while (el && el !== document.body) {
      if (el.matches(INTERACTIVE_SELECTOR)) return true;
      el = el.parentElement;
    }
    return false;
  });
  if (fab) fab.style.pointerEvents = "";
  return overlaps;
};

// nudge the fab down when it would cover a clickable element
const useFabNudge = ({ isOpen, currentScreenId, fabRef }) => {
  const [fabNudged, setFabNudged] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFabNudged(false);
      return;
    }

    const checkOverlap = () => {
      const scroller = findScroller();
      if (scroller) {
        const distFromBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
        if (distFromBottom > BOTTOM_DISTANCE) {
          setFabNudged(false);
          return;
        }
      }
      setFabNudged(overlapsInteractive(fabRef.current));
    };

    document.addEventListener("scroll", checkOverlap, { passive: true, capture: true });
    window.addEventListener("resize", checkOverlap, { passive: true });
    checkOverlap();
    return () => {
      document.removeEventListener("scroll", checkOverlap, { capture: true });
      window.removeEventListener("resize", checkOverlap);
      setFabNudged(false);
    };
  }, [isOpen, currentScreenId]); // eslint-disable-line react-hooks/exhaustive-deps

  return fabNudged;
};

export default useFabNudge;
