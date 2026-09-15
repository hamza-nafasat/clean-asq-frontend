export async function detectLogo(blobUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = blobUrl;
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      try {
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let r = 0,
          g = 0,
          b = 0,
          count = 0,
          hasTransparency = false;

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
          resolve(null); // full image, not a logo
          return;
        }

        const avg = count > 0 ? (r + g + b) / (3 * count) : 0;
        resolve(avg > 200); // true = light, false = dark
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject('Failed to load image');
  });
}
