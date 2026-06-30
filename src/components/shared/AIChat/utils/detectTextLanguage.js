/**
 * Lightweight text-language detection for form defaults and custom-prompt language.
 * Mirrors backend/src/global/utils/aiLanguagePrompt.js heuristics.
 */

const URDU_MARKERS_RE = /[\u06C1\u06BE\u06AF\u0679\u0688\u0691\u06BA\u0626\u0624\u0686\u067E\u0698\u06A9]/;

const scriptRatio = (text, re) => {
  const matches = text.match(re);
  if (!matches) return 0;
  const len = text.replace(/\s/g, "").length || 1;
  return matches.length / len;
};

/** @returns {{ code: string, name: string } | null} */
export function detectTextLanguage(text) {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (scriptRatio(trimmed, /[\u0900-\u097F]/g) > 0.12) return { code: "hi", name: "Hindi" };
  if (scriptRatio(trimmed, /[\u4E00-\u9FFF]/g) > 0.12) return { code: "zh", name: "Chinese" };
  if (scriptRatio(trimmed, /[\u3040-\u30FF]/g) > 0.12) return { code: "ja", name: "Japanese" };
  if (scriptRatio(trimmed, /[\uAC00-\uD7AF]/g) > 0.12) return { code: "ko", name: "Korean" };
  if (scriptRatio(trimmed, /[\u0400-\u04FF]/g) > 0.12) return { code: "ru", name: "Russian" };
  if (scriptRatio(trimmed, /[\u0590-\u05FF]/g) > 0.12) return { code: "he", name: "Hebrew" };
  if (scriptRatio(trimmed, /[\u0E00-\u0E7F]/g) > 0.12) return { code: "th", name: "Thai" };

  const arabicScriptRatio = scriptRatio(trimmed, /[\u0600-\u06FF]/g);
  if (arabicScriptRatio > 0.12) {
    if (URDU_MARKERS_RE.test(trimmed)) return { code: "ur", name: "Urdu" };
    return { code: "ar", name: "Arabic" };
  }

  const tl = trimmed.toLowerCase();
  if (/\b(nombre|empresa|dirección|ciudad|país|fecha|teléfono|correo|apellido|cómo|qué)\b/.test(tl)) {
    return { code: "es", name: "Spanish" };
  }
  if (/\b(nom|prénom|adresse|entreprise|ville|pays|téléphone|courriel|date|comment)\b/.test(tl)) {
    return { code: "fr", name: "French" };
  }
  if (/\b(nome|empresa|endereço|cidade|estado|país|telefone|cpf|cnpj|como)\b/.test(tl)) {
    return { code: "pt", name: "Portuguese" };
  }
  if (/\b(vorname|nachname|unternehmen|anschrift|straße|stadt|land|telefon|datum|wie)\b/.test(tl)) {
    return { code: "de", name: "German" };
  }
  if (/\b(nome|azienda|indirizzo|città|paese|telefono|codice fiscale|data|come)\b/.test(tl)) {
    return { code: "it", name: "Italian" };
  }
  if (/\b(nasıl|merhaba|şirket|adres|telefon|tarih)\b/.test(tl)) return { code: "tr", name: "Turkish" };
  if (/\b(kya|kaise|aap|hai|yeh|mera|apka|shukriya|salam)\b/.test(tl)) return { code: "ur", name: "Urdu" };

  if (/[a-z]/i.test(trimmed)) return { code: "en", name: "English" };
  return null;
}

/** Detect form UI language from screen context field labels and metadata. */
export function detectFormLanguage(ctx) {
  const fields = ctx?.currentState?.fields || [];
  const text = [
    ctx?.screenName || "",
    ctx?.description || "",
    ...fields.map((f) => `${f.label || ""} ${f.description || ""} ${f.placeholder || ""}`),
  ].join(" ");

  const detected = detectTextLanguage(text);
  return detected?.name || "English";
}

export function resolveDefaultResponseLanguage({ customPrompt, formLanguage } = {}) {
  if (customPrompt) {
    const fromPrompt = detectTextLanguage(customPrompt);
    if (fromPrompt && fromPrompt.code !== "en") return fromPrompt;
  }
  if (formLanguage && formLanguage !== "English") {
    const codeMap = {
      English: "en",
      Spanish: "es",
      French: "fr",
      Portuguese: "pt",
      German: "de",
      Italian: "it",
      Chinese: "zh",
      Arabic: "ar",
      Urdu: "ur",
      Hindi: "hi",
      Korean: "ko",
      Japanese: "ja",
      Russian: "ru",
      Vietnamese: "vi",
      Turkish: "tr",
    };
    const code = codeMap[formLanguage] || "en";
    if (code !== "en") return { code, name: formLanguage };
  }
  return { code: "en", name: "English" };
}

const RTL_LANGUAGE_CODES = new Set(["ar", "ur", "he", "fa", "ps"]);

/** True for languages that read right-to-left in the chat UI. */
export function isRtlLanguage(code) {
  return !!code && RTL_LANGUAGE_CODES.has(code);
}

/** Infer message text direction from optional lang code or content heuristics. */
export function resolveMessageDirection(content, langCode) {
  if (langCode) return isRtlLanguage(langCode) ? "rtl" : "ltr";
  const detected = detectTextLanguage(typeof content === "string" ? content : "");
  return isRtlLanguage(detected?.code) ? "rtl" : "ltr";
}
