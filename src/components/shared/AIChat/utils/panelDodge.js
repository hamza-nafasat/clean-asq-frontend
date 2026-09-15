import {
  PANEL_HEIGHT,
  PANEL_MIN_HEIGHT,
  PANEL_MIN_WIDTH,
  PANEL_WIDTH,
} from "@/components/shared/AIChat/constants/aiChatConstants.js";

const DODGE_MARGIN = 8;
const ADJACENT_BUTTON_MAX_GAP = 100;
const ADJACENT_BUTTON_DEPTH = 4;
const RADIO_GROUP_DEPTH = 8;

const rectsOverlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const unionRect = (a, b) => ({
  left: Math.min(a.left, b.left),
  right: Math.max(a.right, b.right),
  top: Math.min(a.top, b.top),
  bottom: Math.max(a.bottom, b.bottom),
});

// nearest enabled button next to the input
const findAdjacentButton = (inputEl) => {
  let el = inputEl;
  for (let depth = 0; depth < ADJACENT_BUTTON_DEPTH; depth++) {
    let sibling = el.nextElementSibling;
    while (sibling) {
      if (sibling.tagName === "BUTTON" && !sibling.disabled) return sibling;
      const btn = sibling.querySelector("button:not([disabled])");
      if (btn) return btn;
      sibling = sibling.nextElementSibling;
    }
    el = el.parentElement;
    if (!el || el === document.body) break;
  }
  return null;
};

// area the panel must not cover: field, radio group, signature, label, button
const getFieldRect = (el) => {
  let fieldRect = el.getBoundingClientRect();

  if (el.type === "radio" && el.name) {
    const selector = `input[type="radio"][name="${CSS.escape(el.name)}"]`;
    const totalInDoc = document.querySelectorAll(selector).length;
    let container = el.parentElement;
    for (let depth = 0; depth < RADIO_GROUP_DEPTH; depth++) {
      if (!container || container === document.body) break;
      if (container.querySelectorAll(selector).length >= totalInDoc) {
        const cr = container.getBoundingClientRect();
        fieldRect = { left: cr.left, right: cr.right, top: cr.top, bottom: cr.bottom };
        break;
      }
      container = container.parentElement;
    }
  }

  if (el.getAttribute?.("data-ai-type") === "sign") {
    let sib = el.previousElementSibling;
    while (sib) {
      const sr = sib.getBoundingClientRect();
      if (sr.height > 0) fieldRect = unionRect(fieldRect, sr);
      sib = sib.previousElementSibling;
    }
  }

  let labelEl = el.closest(".input-box")?.querySelector("h4") ?? null;
  if (!labelEl && el.id) labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
  if (labelEl) fieldRect = unionRect(fieldRect, labelEl.getBoundingClientRect());

  const adjBtn = findAdjacentButton(el);
  if (adjBtn) {
    const btnRect = adjBtn.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const vertGap = Math.max(0, btnRect.top - elRect.bottom, elRect.top - btnRect.bottom);
    if (vertGap <= ADJACENT_BUTTON_MAX_GAP) fieldRect = unionRect(fieldRect, btnRect);
  }

  return fieldRect;
};

// pick the free region with the most room around the field
const pickBestRegion = (fieldRect, vw, vh) => {
  const M = DODGE_MARGIN;
  const regions = [
    { id: "right", left: fieldRect.right + M, top: M, w: vw - fieldRect.right - M * 2, h: vh - M * 2 },
    { id: "left", left: M, top: M, w: fieldRect.left - M * 2, h: vh - M * 2 },
    { id: "below", left: M, top: fieldRect.bottom + M, w: vw - M * 2, h: vh - fieldRect.bottom - M * 2 },
    { id: "above", left: M, top: M, w: vw - M * 2, h: fieldRect.top - M * 2 },
  ];

  const scored = regions
    .filter((r) => r.w >= PANEL_MIN_WIDTH && r.h >= PANEL_MIN_HEIGHT)
    .map((r) => {
      const fitW = Math.min(PANEL_WIDTH, r.w);
      const fitH = Math.min(PANEL_HEIGHT, r.h);
      return { ...r, fitW, fitH, score: fitW * fitH };
    })
    .sort((a, b) => b.score - a.score);

  return (
    scored[0] ??
    regions
      .map((r) => ({
        ...r,
        fitW: Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_WIDTH, r.w)),
        fitH: Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_HEIGHT, r.h)),
        score: r.w * r.h,
      }))
      .sort((a, b) => b.score - a.score)[0]
  );
};

// new panel layout that clears the field, or null when it already does
export const computeDodgeLayout = (el, panelTarget, homePositionRef) => {
  const t = panelTarget;
  const panelRect = { top: t.top, left: t.left, right: t.left + t.width, bottom: t.top + t.height };
  const fieldRect = getFieldRect(el);
  if (!rectsOverlap(panelRect, fieldRect)) return null;

  if (!homePositionRef.current) {
    homePositionRef.current = { top: panelRect.top, left: panelRect.left, width: PANEL_WIDTH, height: PANEL_HEIGHT };
  }

  const M = DODGE_MARGIN;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const best = pickBestRegion(fieldRect, vw, vh);

  let newW = best.fitW;
  let newH = best.fitH;
  const targetArea = PANEL_WIDTH * PANEL_HEIGHT;
  if (newW < PANEL_WIDTH && newH > 0) newH = Math.min(best.h, Math.max(newH, Math.ceil(targetArea / newW)));
  if (newH < PANEL_HEIGHT && newW > 0) newW = Math.min(best.w, Math.max(newW, Math.ceil(targetArea / newH)));
  newW = Math.max(PANEL_MIN_WIDTH, Math.min(best.w, newW));
  newH = Math.max(PANEL_MIN_HEIGHT, Math.min(best.h, newH));

  let newLeft = best.left;
  let newTop = best.top;
  if (best.id === "left") newLeft = Math.max(M, fieldRect.left - newW - M);
  if (best.id === "right") newLeft = fieldRect.right + M;
  if (best.id === "above") newTop = Math.max(M, fieldRect.top - newH - M);
  if (best.id === "below") newTop = fieldRect.bottom + M;

  if (best.id === "above" || best.id === "below") {
    newLeft = Math.max(M, Math.min(vw - newW - M, panelRect.left));
  }
  if (best.id === "left" || best.id === "right") {
    const fieldCY = (fieldRect.top + fieldRect.bottom) / 2;
    newTop = Math.max(M, Math.min(vh - newH - M, fieldCY - newH / 2));
  }

  newTop = Math.max(M, Math.min(vh - newH - M, newTop));
  newLeft = Math.max(M, Math.min(vw - newW - M, newLeft));

  return { top: newTop, left: newLeft, width: newW, height: newH };
};
