const toLinear = (channel) => {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

// black or white, whichever reads better
export const getContrastColor = (hex, threshold = 0.179) => {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return "#ffffff";
  const L =
    0.2126 * toLinear(parseInt(h.slice(0, 2), 16)) +
    0.7152 * toLinear(parseInt(h.slice(2, 4), 16)) +
    0.0722 * toLinear(parseInt(h.slice(4, 6), 16));
  return L > threshold ? "#000000" : "#ffffff";
};
