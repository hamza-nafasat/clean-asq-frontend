import getEnv from "../../../../lib/env.js";

export const SERVER_URL = getEnv("SERVER_URL");

export const PANEL_WIDTH = 520;
export const PANEL_HEIGHT = 700;
export const PANEL_MIN_WIDTH = 300;
export const PANEL_MIN_HEIGHT = 380;
export const PANEL_MARGIN = 8;

export function getViewportSize() {
  const vv = typeof window !== "undefined" ? window.visualViewport : null;
  return {
    width: Math.round(vv?.width ?? window.innerWidth),
    height: Math.round(vv?.height ?? window.innerHeight),
  };
}

/**
 * Size and place the panel so it stays fully on screen.
 * `top-right` sits under the page header; `bottom-right` docks to the corner.
 */
export function getOpenPanelLayout({
  anchor = "top-right",
  headerBottom = PANEL_MARGIN,
  margin = PANEL_MARGIN,
} = {}) {
  const { width: vw, height: vh } = getViewportSize();
  const width = Math.min(PANEL_WIDTH, Math.max(0, vw - margin * 2));
  const heightCap = Math.max(0, vh - margin * 2);

  let top;
  let height;

  if (anchor === "bottom-right") {
    height = Math.min(PANEL_HEIGHT, heightCap);
    top = Math.max(margin, vh - height - margin);
  } else {
    top = Math.min(Math.max(headerBottom, margin), Math.max(margin, vh - margin));
    height = Math.min(PANEL_HEIGHT, Math.max(0, vh - top - margin));
  }

  const left = Math.max(margin, vw - width - margin);
  return { top, left, width, height };
}

/** Shrink/shift an existing panel so it does not overflow the viewport. */
export function clampPanelToViewport(
  { top, left, width, height },
  margin = PANEL_MARGIN,
) {
  const { width: vw, height: vh } = getViewportSize();
  let nextWidth = Math.min(width, Math.max(0, vw - margin * 2));
  let nextHeight = Math.min(height, Math.max(0, vh - margin * 2));
  let nextLeft = Math.max(margin, Math.min(left, vw - nextWidth - margin));
  let nextTop = Math.max(margin, Math.min(top, vh - nextHeight - margin));
  nextWidth = Math.min(nextWidth, Math.max(0, vw - nextLeft - margin));
  nextHeight = Math.min(nextHeight, Math.max(0, vh - nextTop - margin));
  return { top: nextTop, left: nextLeft, width: nextWidth, height: nextHeight };
}

export const PAGE_ROUTES = {
  "application-forms": "/application-forms",
  branding: "/branding",
  "branding-create": "/branding/create",
  strategies: "/strategies",
  "lookup-management": "/strategies-key",
  "role-management": "/all-roles",
  "user-management": "/all-users",
  email: "/email",
  applications: "/applications",
  testing: "/testing",
};

export const PAGE_LABELS = {
  "application-forms": "Application Forms",
  branding: "Branding Management",
  "branding-create": "Create New Branding",
  strategies: "Strategies",
  "lookup-management": "Lookup Management",
  "role-management": "Role Management",
  "user-management": "User Management",
  email: "Email Templates",
  applications: "Applications",
  testing: "Automated Testing",
};

export function contrastingIconColor(hex = "#000000") {
  const h = hex.replace("#", "");
  if (h.length < 6) return "#ffffff";
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(parseInt(h.slice(0, 2), 16));
  const g = toLinear(parseInt(h.slice(2, 4), 16));
  const b = toLinear(parseInt(h.slice(4, 6), 16));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.179 ? "#000000" : "#ffffff";
}
