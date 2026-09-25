export const getLogoUrl = (logo) => (typeof logo === "string" ? logo : logo?.url);

export const isPreviewLogo = (logo) => typeof logo === "object" && logo?.preview === true;

const isLogoPaletteEntry = (entry) => typeof entry === "object" && entry?.source?.toLowerCase().includes("logo");

// swap logo colours in palette
export const replaceLogoColors = (palette, colors) => {
  let newIdx = 0;
  return palette.map((entry) => (isLogoPaletteEntry(entry) && newIdx < colors.length ? colors[newIdx++] : entry));
};

export const getFirstLogoColor = (palette = []) => {
  const logoEntry = palette.find(isLogoPaletteEntry);
  if (logoEntry?.hex) return logoEntry.hex;
  const first = palette[0];
  return (typeof first === "string" ? first : first?.hex) || null;
};

// light, dark or null if opaque
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
