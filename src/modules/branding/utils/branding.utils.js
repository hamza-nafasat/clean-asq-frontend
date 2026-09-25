import { FONT_OPTIONS } from "@/constants";

// clipboard api with execCommand fallback
export const copyTextToClipboard = (text) => {
  const attemptCopy = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  };
  return navigator.clipboard?.writeText
    ? navigator.clipboard
        .writeText(text)
        .then(() => true)
        .catch(() => attemptCopy())
    : Promise.resolve(attemptCopy());
};

export const isTruthy = (value) => Boolean(value);

export const isDefined = (value) => value !== undefined;

const toFontKey = (name) => name.trim().toLowerCase().replace(/[\s_]+/g, "-");

// match stored font to option name
export const normalizeFontFamily = (value) => {
  if (!value) return value;
  const key = toFontKey(value);
  const match = FONT_OPTIONS.find((font) => toFontKey(font.value) === key || font.slug === key);
  return match?.value ?? value;
};
