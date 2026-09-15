const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export const safeImageUrl = (url) => {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/["'<>`\s]/.test(trimmed)) return "";
  if (/^data:image\/(png|jpe?g|gif|svg\+xml|webp|x-icon);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(parsed.protocol) ? trimmed : "";
  } catch {
    return ""; // relative or malformed - never interpolate raw
  }
};
