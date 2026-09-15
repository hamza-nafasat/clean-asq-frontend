import { DEFAULT_FORM_LANGUAGE } from "@/components/shared/AIChat/constants/aiChatConstants.js";
import {
  SCRIPT_LANGUAGE_PATTERNS,
  WORD_LANGUAGE_PATTERNS,
} from "@/components/shared/AIChat/constants/formLanguages.js";
import { WIDGET_STRINGS } from "@/components/shared/AIChat/constants/widgetStrings.js";

const DEFAULT_LANGUAGE_CODE = "en";
const SCRIPT_SHARE_THRESHOLD = 0.12;

// widget string in the detected language, falling back to english
export const translateWidgetString = (lang, key, ...args) => {
  const strings = WIDGET_STRINGS[lang || DEFAULT_LANGUAGE_CODE] || WIDGET_STRINGS.en;
  const val = strings[key] ?? WIDGET_STRINGS.en[key] ?? key;
  return typeof val === "function" ? val(...args) : val;
};

export const getLanguageName = (code) => {
  try {
    return new Intl.DisplayNames([DEFAULT_LANGUAGE_CODE], { type: "language" }).of(code) || code;
  } catch {
    return code;
  }
};

// natural language of the form from its labels and descriptions
export const detectFormLanguage = (ctx) => {
  const fields = ctx?.currentState?.fields || [];
  const text = [
    ctx?.screenName || "",
    ctx?.description || "",
    ...fields.map((f) => `${f.label || ""} ${f.description || ""} ${f.placeholder || ""}`),
  ].join(" ");
  const len = text.replace(/\s/g, "").length || 1;

  const script = SCRIPT_LANGUAGE_PATTERNS.find(
    ({ pattern }) => (text.match(pattern) || []).length / len > SCRIPT_SHARE_THRESHOLD,
  );
  if (script) return script.language;

  const lowerText = text.toLowerCase();
  const word = WORD_LANGUAGE_PATTERNS.find(({ pattern }) => pattern.test(lowerText));
  return word ? word.language : DEFAULT_FORM_LANGUAGE;
};
