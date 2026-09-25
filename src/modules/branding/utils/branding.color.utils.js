const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const randomHex = () => {
  const ch = () =>
    Math.floor(Math.random() * 180 + 38)
      .toString(16)
      .padStart(2, "0");
  return `#${ch()}${ch()}${ch()}`;
};

export const isValidHex = (value) => /^#[0-9a-fA-F]{6}$/.test(value);

// swatch colour at slider position
export const computeSliderColor = (index, sliderValue, customColor) => {
  const v = sliderValue;
  switch (index) {
    case 0:
      return hslToHex(0, 0, v * 0.4);
    case 1:
      return hslToHex(0, 0, 60 + v * 0.4);
    case 2:
      return hslToHex(0, 0, 5 + v * 0.9);
    case 3:
      return hslToHex(0, 100, 10 + v * 0.8);
    case 4:
      return hslToHex(60, 100, 10 + v * 0.8);
    case 5:
      return hslToHex(v * 0.6, 100, 50);
    case 6:
      return hslToHex(240, 100, 10 + v * 0.8);
    case 7:
      return hslToHex(240 + v * 0.6, 100, 50);
    case 8:
      return hslToHex(60 + v * 1.8, 100, 45);
    case 9:
      return customColor;
    default:
      return "#000000";
  }
};

// rgb string to hex
export const toHexColor = (raw) => {
  const m = raw?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return raw || "#000000";
  return (
    "#" +
    [m[1], m[2], m[3]]
      .map((n) => parseInt(n).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
};

export const parseGradient = (value) => {
  if (!value || !value.startsWith("linear-gradient")) return null;
  const match = value.match(/linear-gradient\((\d+)deg,\s*(#[0-9a-fA-F]{3,8}),\s*(#[0-9a-fA-F]{3,8})\)/);
  if (!match) return null;
  return { angle: parseInt(match[1]), color1: match[2], color2: match[3] };
};

export const toGradient = (angle, color1, color2) => `linear-gradient(${angle}deg, ${color1}, ${color2})`;
