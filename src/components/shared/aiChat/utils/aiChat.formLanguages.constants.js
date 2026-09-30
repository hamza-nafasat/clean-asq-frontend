// form language names mapped to BCP-47 codes
export const FORM_LANG_TO_BCP47 = {
  English: "en",
  Spanish: "es",
  French: "fr",
  Portuguese: "pt",
  Chinese: "zh",
  Arabic: "ar",
  German: "de",
  Italian: "it",
  Korean: "ko",
  Japanese: "ja",
  Vietnamese: "vi",
  Hindi: "hi",
  Russian: "ru",
  Tagalog: "tl",
  Filipino: "tl",
  Polish: "pl",
};

// unicode script ranges that identify a form language
export const SCRIPT_LANGUAGE_PATTERNS = [
  { language: "Arabic", pattern: /[\u0600-\u06FF]/g },
  { language: "Chinese", pattern: /[\u4E00-\u9FFF]/g },
  { language: "Japanese", pattern: /[\u3040-\u30FF]/g },
  { language: "Korean", pattern: /[\uAC00-\uD7AF]/g },
  { language: "Russian", pattern: /[\u0400-\u04FF]/g },
  { language: "Hebrew", pattern: /[\u0590-\u05FF]/g },
  { language: "Thai", pattern: /[\u0E00-\u0E7F]/g },
  { language: "Hindi", pattern: /[\u0900-\u097F]/g },
];

// common field words that identify a latin-script form language
export const WORD_LANGUAGE_PATTERNS = [
  { language: "Spanish", pattern: /\b(nombre|empresa|dirección|ciudad|país|fecha|teléfono|correo|apellido)\b/ },
  { language: "French", pattern: /\b(nom|prénom|adresse|entreprise|ville|pays|téléphone|courriel|date)\b/ },
  { language: "Portuguese", pattern: /\b(nome|empresa|endereço|cidade|estado|país|telefone|cpf|cnpj)\b/ },
  { language: "German", pattern: /\b(vorname|nachname|unternehmen|anschrift|straße|stadt|land|telefon|datum)\b/ },
  { language: "Italian", pattern: /\b(nome|azienda|indirizzo|città|paese|telefono|codice fiscale|data)\b/ },
];

