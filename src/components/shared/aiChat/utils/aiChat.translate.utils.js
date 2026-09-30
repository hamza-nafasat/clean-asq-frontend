import { AI_ENDPOINTS, CHAT_ROLES } from "@/components/shared/aiChat/utils/aiChat.constants.js";
import { getLanguageName } from "@/components/shared/aiChat/utils/aiChat.language.utils.js";
import { DEFAULT_LANGUAGE_CODE } from "@/lib/languages.js";
import { getActiveFormId } from "@/hooks/useAiChat";

// shared cache, keyed by language + text
const translationCache = new Map();

// translation, or null when it fails
export const requestTranslation = async ({ text, targetLang, targetLangName }) => {
  try {
    const res = await fetch(AI_ENDPOINTS.TRANSLATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang, targetLangName, formId: getActiveFormId() }),
    });
    const data = await res.json();
    return (data?.success && data?.data?.translation) || null;
  } catch {
    return null;
  }
};

// english text in the target language
export const translateForDisplay = async (text, targetLang) => {
  if (!text || !targetLang || targetLang === DEFAULT_LANGUAGE_CODE) return text;
  const cacheKey = `${targetLang}::${text}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

  const translated = await requestTranslation({ text, targetLang, targetLangName: getLanguageName(targetLang) });
  if (!translated) return text;
  translationCache.set(cacheKey, translated);
  return translated;
};

// posts an assistant reply in the chosen language
export const createSay =
  ({ addMessage, isVoiceModeRef, speak, preferredLanguageRef }) =>
  async (content, extra = {}) => {
    const text = await translateForDisplay(content, preferredLanguageRef?.current);
    addMessage({ role: CHAT_ROLES.ASSISTANT, content: text, ...extra });
    if (text && isVoiceModeRef?.current) speak(text);
  };
