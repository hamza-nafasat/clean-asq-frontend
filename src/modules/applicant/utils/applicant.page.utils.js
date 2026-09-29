import { openLinksInNewTab } from "@/utils/linkTargets";

// drop vw padding and width before adding link targets
export const formatOtpDisplayHtml = (html) =>
  openLinksInNewTab(
    String(html || "")
      .replace(/padding:\s*0\s*[\d.]+vw;?/g, "padding: 0;")
      .replace(/width:\s*[\d.]+vw;?/g, "width: 100%;"),
  );

export const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// label + value rows of the ID Mission details form for the page download
export const collectIdMissionFieldRows = (container) => {
  if (!container) return [];
  const rows = [];
  container.querySelectorAll("input:not([type=hidden]):not([type=file]), select, textarea").forEach((el) => {
    const value = el.value?.trim();
    if (!value) return;
    const h4 = el.closest("div")?.parentElement?.querySelector("h4");
    const label = h4?.textContent?.trim() || el.placeholder || el.name || el.id;
    if (label) rows.push({ label: label.replace(/[*:]+$/, "").trim(), value });
  });
  return rows;
};

// label + value rows of a stepper step for the page download
export const collectStepFieldRows = (container) => {
  if (!container) return [];
  const rows = [];
  container.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el.type === "file" || el.type === "hidden") return;
    const value = el.value?.trim();
    if (!value) return;
    const label =
      document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() ||
      el.getAttribute("data-ai-label") ||
      el.placeholder ||
      el.name ||
      "";
    if (label) rows.push({ label: label.replace(/[*:]+$/, "").trim(), value });
  });
  return rows;
};
