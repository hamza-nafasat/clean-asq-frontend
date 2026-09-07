const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const isUsableColor = (value) => typeof value === "string" && HEX.test(value.trim());

const normalizeHex = (hex) => {
  const h = hex.trim().toLowerCase();
  return h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;
};

export const relativeLuminance = (hex) => {
  const h = normalizeHex(hex);
  const toLinear = (c) => {
    const s = parseInt(c, 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = toLinear(h.slice(1, 3));
  const g = toLinear(h.slice(3, 5));
  const b = toLinear(h.slice(5, 7));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const readableTextOn = (backgroundHex) => {
  if (!isUsableColor(backgroundHex)) return "#ffffff";
  return "#ffffff";
};

export const brandedButtonStyle = (colors) => {
  const background = colors?.primary;
  if (!isUsableColor(background)) return {};

  const declared = colors?.buttonTextPrimary;
  const sameAsBackground = isUsableColor(declared) && normalizeHex(declared) === normalizeHex(background);
  const color = isUsableColor(declared) && !sameAsBackground ? declared : readableTextOn(background);

  return {
    backgroundColor: background,
    borderColor: background,
    color,
    transition: "all 0.3s ease",
  };
};
