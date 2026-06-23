import getEnv from "../../../../lib/env.js";

export const SERVER_URL = getEnv("SERVER_URL");
export const AI_CHAT_MODE = import.meta.env.VITE_AI_CHAT_MODE ?? "guided";

export const PANEL_WIDTH = 520;
export const PANEL_HEIGHT = 700;
export const PANEL_MIN_WIDTH = 300;
export const PANEL_MIN_HEIGHT = 380;

export const MAX_API_HISTORY_TURNS = 30;

export const PAGE_ROUTES = {
  // `home` and `application-forms` are intentional aliases — same route, different page IDs for AI navigation phrasing.
  home: "/application-forms",
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
  home: "Home",
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
