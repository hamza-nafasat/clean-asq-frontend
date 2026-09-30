import { FONT_OPTIONS, YES_NO_VALUES } from "@/constants";
import { matchesOption, matchesText } from "@/utils/listFilter";
import { BRANDING_FILTER_KEYS } from "./branding.constants";

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

// sender name on this site's domain
export const toSenderEmail = (value) => {
  const localPart = String(value ?? "").split("@")[0];
  const emailDomain = window.location.hostname;
  return localPart && emailDomain ? `${localPart}@${emailDomain}` : localPart;
};

const toFontKey = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

// match stored font to option name
export const normalizeFontFamily = (value) => {
  if (!value) return value;
  const key = toFontKey(value);
  const match = FONT_OPTIONS.find((font) => toFontKey(font.value) === key || font.slug === key);
  return match?.value ?? value;
};

const toYesNo = (value) => (value ? YES_NO_VALUES.YES : YES_NO_VALUES.NO);

// brandings matching every filter
export const filterBrandings = (brandings, forms, filters) => {
  const appliedIds = new Set(forms.map((form) => String(form?.branding?._id ?? form?.branding ?? "")));
  return brandings.filter(
    (branding) =>
      matchesText([branding?.name, branding?.url], filters[BRANDING_FILTER_KEYS.SEARCH]) &&
      matchesOption(toYesNo(branding?.isDefault), filters[BRANDING_FILTER_KEYS.DEFAULT]) &&
      matchesOption(toYesNo(appliedIds.has(String(branding?._id))), filters[BRANDING_FILTER_KEYS.APPLIED_TO_FORMS]),
  );
};
