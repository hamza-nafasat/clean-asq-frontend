import { countries, getEmojiFlag, languages } from "countries-list";

export const DEFAULT_LANGUAGE_CODE = "en";
const NO_COUNTRY_FLAG = "🌐";

// flag of the language's main country
const getLanguageFlag = (code) => {
  try {
    const country = new Intl.Locale(code).maximize().region;
    return countries[country] ? getEmojiFlag(country) : NO_COUNTRY_FLAG;
  } catch {
    return NO_COUNTRY_FLAG;
  }
};

// every language with native name and flag
export const LANGUAGES = Object.entries(languages)
  .map(([code, lang]) => ({ code, name: lang.name, nativeName: lang.native, flag: getLanguageFlag(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));
