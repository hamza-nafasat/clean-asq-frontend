import { FONT_OPTIONS } from "@/constants";

const toSlug = (name) => name.trim().toLowerCase().replace(/\s+/g, "-");

// "Source Sans Pro" → var(--font-source-sans)
export const toFontVariable = (fontFamily) => {
  const name = toSlug(String(fontFamily));
  const slug = FONT_OPTIONS.find((font) => toSlug(font.value) === name)?.slug ?? name;
  return `var(--font-${slug})`;
};
