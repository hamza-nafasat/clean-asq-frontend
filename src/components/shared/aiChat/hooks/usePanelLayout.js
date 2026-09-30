import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AI_ASSISTANT_MODES } from "@/constants";
import {
  clampPanelToViewport,
  getOpenPanelLayout,
  PANEL_ANCHORS,
  PANEL_HEIGHT,
  PANEL_MIN_HEIGHT,
  PANEL_MIN_WIDTH,
  PANEL_WIDTH,
} from "@/components/shared/aiChat/utils/aiChat.constants.js";
import { computeDodgeLayout } from "@/components/shared/aiChat/utils/aiChat.panelDodge.utils.js";

const HEADER_SELECTOR = ".bg-header";
const FALLBACK_HEADER_BOTTOM = 80;
const DODGE_SCROLL_DELAY_MS = 50;

const measureHeaderBottom = () => {
  const header = document.querySelector(HEADER_SELECTOR);
  return header ? header.getBoundingClientRect().bottom : FALLBACK_HEADER_BOTTOM;
};

// panel size and position after a resize drag
const resizeLayout = ({ edge, startX, startY, startW, startH, startLeft, startTop }, e) => {
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  let newW = startW,
    newH = startH,
    newLeft = startLeft,
    newTop = startTop;
  if (edge.includes("e")) newW = startW + dx;
  if (edge.includes("w")) {
    newW = startW - dx;
    newLeft = startLeft + (startW - Math.max(PANEL_MIN_WIDTH, newW));
  }
  if (edge.includes("s")) newH = startH + dy;
  if (edge.includes("n")) {
    newH = startH - dy;
    newTop = startTop + (startH - Math.max(PANEL_MIN_HEIGHT, newH));
  }
  newW = Math.max(PANEL_MIN_WIDTH, Math.min(newW, window.innerWidth - newLeft));
  newH = Math.max(PANEL_MIN_HEIGHT, Math.min(newH, window.innerHeight - newTop));
  return { top: newTop, left: newLeft, width: newW, height: newH };
};

const usePanelLayout = ({ isOpen, assistantMode, pathname, panelRef, scrollToBottom }) => {
  const [headerBottom, setHeaderBottom] = useState(measureHeaderBottom);
  const [position, setPosition] = useState(() => {
    const layout = getOpenPanelLayout({ headerBottom: FALLBACK_HEADER_BOTTOM });
    return { top: layout.top, left: layout.left };
  });
  const [panelWidth, setPanelWidth] = useState(() => getOpenPanelLayout({ headerBottom: FALLBACK_HEADER_BOTTOM }).width);
  const [panelHeight, setPanelHeight] = useState(
    () => getOpenPanelLayout({ headerBottom: FALLBACK_HEADER_BOTTOM }).height,
  );
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 });
  const resizeRef = useRef({ isResizing: false, edge: "", startX: 0, startY: 0, startW: 0, startH: 0, startLeft: 0, startTop: 0 });
  const panelTargetRef = useRef(getOpenPanelLayout({ headerBottom: FALLBACK_HEADER_BOTTOM }));
  // position saved before the panel dodges a field
  const homePositionRef = useRef(null);

  const applyLayout = (layout) => {
    panelTargetRef.current = layout;
    setPanelWidth(layout.width);
    setPanelHeight(layout.height);
    setPosition({ top: layout.top, left: layout.left });
  };

  const openAtHome = () =>
    applyLayout(
      getOpenPanelLayout({
        anchor: assistantMode === AI_ASSISTANT_MODES.APPLICANT ? PANEL_ANCHORS.BOTTOM_RIGHT : PANEL_ANCHORS.TOP_RIGHT,
        headerBottom,
      }),
    );

  // keep the panel flush below the measured header
  useLayoutEffect(() => {
    const update = () => {
      const header = document.querySelector(HEADER_SELECTOR);
      if (header) setHeaderBottom(header.getBoundingClientRect().bottom);
    };
    update();
    const header = document.querySelector(HEADER_SELECTOR);
    if (!header) return;
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (dragRef.current.isDragging) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const cur = panelTargetRef.current;
        const panelH = cur.height ?? PANEL_HEIGHT;
        const panelW = cur.width ?? PANEL_WIDTH;
        const newTop = Math.max(0, Math.min(window.innerHeight - panelH, dragRef.current.startTop + dy));
        const newLeft = Math.max(0, Math.min(window.innerWidth - panelW, dragRef.current.startLeft + dx));
        panelTargetRef.current = { ...cur, top: newTop, left: newLeft };
        setPosition({ top: newTop, left: newLeft });
      }
      if (resizeRef.current.isResizing) applyLayout(resizeLayout(resizeRef.current, e));
    };
    const onMouseUp = () => {
      // a drag sets a new home
      if (dragRef.current.isDragging) homePositionRef.current = null;
      dragRef.current.isDragging = false;
      resizeRef.current.isResizing = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // fit the panel to the viewport whenever it opens
  useLayoutEffect(() => {
    if (!isOpen) return;
    openAtHome();
  }, [isOpen, assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep the open panel inside the viewport on resize
  useEffect(() => {
    if (!isOpen) return;
    const clampOpenPanel = () => {
      const cur = panelTargetRef.current;
      const next = clampPanelToViewport(cur);
      if (next.top === cur.top && next.left === cur.left && next.width === cur.width && next.height === cur.height) {
        return;
      }
      applyLayout(next);
    };
    window.addEventListener("resize", clampOpenPanel);
    window.visualViewport?.addEventListener("resize", clampOpenPanel);
    return () => {
      window.removeEventListener("resize", clampOpenPanel);
      window.visualViewport?.removeEventListener("resize", clampOpenPanel);
    };
  }, [isOpen]);

  const handleResizeMouseDown = (e, edge) => {
    e.preventDefault();
    e.stopPropagation();
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    resizeRef.current = {
      isResizing: true,
      edge,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
      startLeft: rect.left,
      startTop: rect.top,
    };
  };

  const handleHeaderMouseDown = (e) => {
    if (e.target.closest("button")) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, startLeft: rect.left, startTop: rect.top };
    e.preventDefault();
  };

  // move the panel out of the way of a field
  const dodgeForField = (el) => {
    if (!el || !panelRef.current) return;
    const next = computeDodgeLayout(el, panelTargetRef.current, homePositionRef);
    if (!next) return;
    applyLayout(next);
    setTimeout(() => scrollToBottom(), DODGE_SCROLL_DELAY_MS);
  };

  return {
    position,
    panelWidth,
    panelHeight,
    dragRef,
    resizeRef,
    openAtHome,
    dodgeForField,
    handleResizeMouseDown,
    handleHeaderMouseDown,
  };
};

export default usePanelLayout;
