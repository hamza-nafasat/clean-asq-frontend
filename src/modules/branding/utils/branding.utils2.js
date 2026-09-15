// resolves true for a light logo, false for dark, null when it has no transparency
export const detectLogo = (blobUrl) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.src = blobUrl;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      try {
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        let hasTransparency = false;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 255) hasTransparency = true;
          if (alpha > 0) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }

        if (!hasTransparency) {
          resolve(null);
          return;
        }

        const avg = count > 0 ? (r + g + b) / (3 * count) : 0;
        resolve(avg > 200);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject("Failed to load image");
  });

export const hslToHex = (h, s, l) => {
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

// colour for a swatch family at a slider position
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

// black or white, whichever reads better on the background
export const getContrastColor = (hex = "#000") => {
  const h = hex.replace("#", "");
  if (h.length < 6) return "#ffffff";
  const to = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const L =
    0.2126 * to(parseInt(h.slice(0, 2), 16)) +
    0.7152 * to(parseInt(h.slice(2, 4), 16)) +
    0.0722 * to(parseInt(h.slice(4, 6), 16));
  return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? "#000000" : "#ffffff";
};

// rgb or rgba string to an upper-case hex for colour inputs
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
