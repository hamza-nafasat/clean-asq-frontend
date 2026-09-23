import { AI_ENDPOINTS, CHAT_ROLES } from "@/components/shared/aiChat/constants/aiChatConstants.js";
import { getLanguageName } from "@/components/shared/aiChat/logic/widgetLanguage.js";
import { DEFAULT_LANGUAGE_CODE } from "@/lib/languages.js";

// shared cache, keyed by language + text
const translationCache = new Map();

// english text in the target language
export const translateForDisplay = async (text, targetLang) => {
  if (!text || !targetLang || targetLang === DEFAULT_LANGUAGE_CODE) return text;
  const cacheKey = `${targetLang}::${text}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

  try {
    const res = await fetch(AI_ENDPOINTS.TRANSLATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang, targetLangName: getLanguageName(targetLang) }),
    });
    const data = await res.json();
    const translated = data?.success && data?.data?.translation;
    if (translated) {
      translationCache.set(cacheKey, translated);
      return translated;
    }
  } catch (error) {
    console.error("Translate message error:", error);
  }
  return text;
};

// posts an assistant reply in the chosen language
export const createSay =
  ({ addMessage, isVoiceModeRef, speak, preferredLanguageRef }) =>
  async (content, extra = {}) => {
    const text = await translateForDisplay(content, preferredLanguageRef?.current);
    addMessage({ role: CHAT_ROLES.ASSISTANT, content: text, ...extra });
    if (text && isVoiceModeRef?.current) speak(text);
  };
