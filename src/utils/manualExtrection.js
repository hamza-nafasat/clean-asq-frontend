export function getManualExtractionScript() {
  return `(async () => {
  // ─── Helpers ────────────────────────────────────────────────────────────────

  function toHex(color) {
    if (!color) return null;
    const m = color.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
    if (m) return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('').toUpperCase();
    if (/^#[0-9a-f]{3,8}$/i.test(color)) {
      let h = color.replace(/^#/, '').toUpperCase();
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return '#' + h.slice(0, 6);
    }
    return null;
  }

  function isOpaque(color) {
    if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return false;
    const m = color.match(/rgba\\([^,]+,[^,]+,[^,]+,\\s*([\\d.]+)\\)/);
    return m ? parseFloat(m[1]) > 0.1 : true;
  }

  function getBg(el) {
    if (!el) return null;
    const c = getComputedStyle(el).backgroundColor;
    return isOpaque(c) ? toHex(c) : null;
  }

  function resolveUrl(src) {
    if (!src) return null;
    if (src.startsWith('data:') || src.startsWith('http')) return src;
    try { return new URL(src, location.href).href; } catch { return src; }
  }

  function isInHeader(el) {
    return !!el.closest('header, nav, [class*="header" i], [id*="header" i], [class*="topbar" i], [class*="masthead" i], [class*="navbar" i]');
  }

  // ─── 1. Computed body styles ─────────────────────────────────────────────────

  const cs = getComputedStyle(document.body);
  const dcs = getComputedStyle(document.documentElement);
  const linkEl = document.querySelector('a');
  const computed = {
    backgroundColor: toHex(isOpaque(cs.backgroundColor) ? cs.backgroundColor : null),
    textColor:       toHex(cs.color),
    linkColor:       linkEl ? toHex(getComputedStyle(linkEl).color) : null,
    fontFamily:      cs.fontFamily.replace(/"/g, '').split(',')[0].trim(),
    cssVarPrimary:   toHex(dcs.getPropertyValue('--primary-color').trim()) || null,
    cssVarAccent:    toHex(dcs.getPropertyValue('--accent-color').trim()) || null,
    metaThemeColor:  toHex(document.querySelector('meta[name="theme-color"]')?.content) || null,
  };

  // ─── 2. Viewport ─────────────────────────────────────────────────────────────

  const vw = window.innerWidth || 1200;
  const vh = window.innerHeight || 800;

  // ─── 3. Logo detection ───────────────────────────────────────────────────────

  const logos = [];
  const seen  = new Set();

  function addLogo(obj) {
    if (!obj.src || seen.has(obj.src)) return;
    seen.add(obj.src);
    logos.push(obj);
  }

  // Pass 1: keyword-matched images (logo in alt/src/class/id)
  document.querySelectorAll('img[alt*="logo" i], img[src*="logo" i], img[class*="logo" i], img[id*="logo" i]').forEach(img => {
    const rect = img.getBoundingClientRect();
    const src  = resolveUrl(img.src || img.getAttribute('src'));
    if (!src) return;
    addLogo({
      src,
      width:    img.naturalWidth  || Math.round(rect.width),
      height:   img.naturalHeight || Math.round(rect.height),
      x:        Math.round(rect.left),
      y:        Math.round(rect.top),
      inHeader: isInHeader(img),
    });
  });

  // Pass 2: size-based fallback if pass 1 found nothing
  if (!logos.length) {
    document.querySelectorAll('img').forEach(img => {
      const rect = img.getBoundingClientRect();
      const w    = img.naturalWidth  || Math.round(rect.width);
      const h    = img.naturalHeight || Math.round(rect.height);
      if (w >= 100 && h >= 30) {
        const src = resolveUrl(img.src || img.getAttribute('src'));
        if (src) addLogo({ src, width: w, height: h, x: Math.round(rect.left), y: Math.round(rect.top), inHeader: isInHeader(img) });
      }
    });
  }

  // Pass 3a: OG image meta tag
  const ogSrc = resolveUrl(document.querySelector('meta[property="og:image"]')?.content);
  if (ogSrc) addLogo({ src: ogSrc, width: 0, height: 0, x: 0, y: 0, inHeader: false, isOg: true });

  // Pass 3b: link icons / favicons
  document.querySelectorAll('link[rel*="icon"]').forEach(link => {
    const src = resolveUrl(link.href);
    if (src) addLogo({ src, width: 32, height: 32, x: 0, y: 0, inHeader: false, isFavicon: true });
  });

  // Pass 3c: background-image on elements with "logo" in class/id
  document.querySelectorAll('[class*="logo" i], [id*="logo" i]').forEach(el => {
    const bg = getComputedStyle(el).backgroundImage;
    const m  = bg?.match(/url\\(["']?([^"')]+)["']?\\)/);
    if (m) {
      const src = resolveUrl(m[1]);
      const r   = el.getBoundingClientRect();
      if (src) addLogo({ src, width: el.offsetWidth, height: el.offsetHeight, x: Math.round(r.left), y: Math.round(r.top), inHeader: isInHeader(el) });
    }
  });

  // Pass 3d: inline SVGs with "logo" in class/id → serialize to data URL
  document.querySelectorAll('svg[class*="logo" i], svg[id*="logo" i]').forEach(svg => {
    try {
      const serialized = new XMLSerializer().serializeToString(svg);
      const src        = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(serialized)));
      const r          = svg.getBoundingClientRect();
      addLogo({ src, width: Math.round(r.width), height: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top), inHeader: isInHeader(svg) });
    } catch(e) {}
  });

  // Prioritize: header logos → top-of-page logos → all; sort by pixel area
  const nonUtil     = logos.filter(l => !l.isFavicon && !l.isOg);
  const headerLogos = nonUtil.filter(l => l.inHeader);
  const topLogos    = nonUtil.filter(l => !l.inHeader && (l.y || 0) < vh * 0.35);
  const primary     = headerLogos.length ? headerLogos : topLogos.length ? topLogos : nonUtil;
  primary.sort((a, b) => (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0));
  const favicon    = logos.find(l => l.isFavicon);
  const finalLogos = [...primary.slice(0, 5), ...(favicon ? [favicon] : [])];

  // ─── 4. Raw DOM colors ───────────────────────────────────────────────────────

  const domColors = new Set();
  document.querySelectorAll('*').forEach(el => {
    const s = getComputedStyle(el);
    for (const prop of ['color', 'backgroundColor', 'borderColor', 'borderTopColor']) {
      if (s[prop]?.startsWith('rgb')) {
        const h = toHex(s[prop]);
        if (h && h !== '#000000' && h !== '#FFFFFF') domColors.add(h);
      }
    }
  });
  const rawColors = [...domColors].slice(0, 25);

  // ─── 5. Header / footer backgrounds ─────────────────────────────────────────

  let headerBg = null;
  for (const sel of ['header', '[class*="site-header" i]', '[class*="header" i]', '.masthead', 'nav', '[class*="topbar" i]', '[class*="navbar" i]']) {
    const c = getBg(document.querySelector(sel));
    if (c) { headerBg = c; break; }
  }

  let footerBg = null;
  for (const sel of ['footer', '[class*="site-footer" i]', '[class*="footer" i]', '.mastfoot', '[class*="bottombar" i]']) {
    const c = getBg(document.querySelector(sel));
    if (c) { footerBg = c; break; }
  }

  // ─── 6. Header alignment from logo position ──────────────────────────────────

  let headerAlignment = 'left';
  const firstHLogo = finalLogos.find(l => l.inHeader);
  if (firstHLogo && firstHLogo.x != null && firstHLogo.width) {
    const cx = firstHLogo.x + firstHLogo.width / 2;
    if      (cx > vw * 0.6) headerAlignment = 'right';
    else if (cx > vw * 0.4) headerAlignment = 'center';
  } else {
    const hdrEl = document.querySelector('header, nav, [class*="header" i]');
    if (hdrEl) {
      const jc = getComputedStyle(hdrEl).justifyContent;
      if      (jc === 'center' || jc === 'space-around') headerAlignment = 'center';
      else if (jc === 'flex-end')                        headerAlignment = 'right';
    }
  }

  // ─── 7. Prominent headline ───────────────────────────────────────────────────

  let prominentHeadline = null;
  for (const h1 of document.querySelectorAll('h1')) {
    const text = h1.innerText?.trim();
    if (text && text.length > 5 && text.length < 120 && !isInHeader(h1)) {
      prominentHeadline = text;
      break;
    }
  }

  // ─── 8. Button colors ────────────────────────────────────────────────────────

  const buttons  = [];
  const btnSeen  = new Set();
  document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"], .btn, [class*="button" i]').forEach(btn => {
    const s = getComputedStyle(btn);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.1) return;
    const bg   = toHex(isOpaque(s.backgroundColor) ? s.backgroundColor : null);
    const text = toHex(s.color);
    if (bg && !btnSeen.has(bg)) { btnSeen.add(bg); buttons.push({ bg, text }); }
  });

  // ─── 9. Assemble result ──────────────────────────────────────────────────────

  const result = {
    title:             document.title,
    url:               location.href,
    computed,
    logos:             finalLogos,
    rawColors,
    headerBg,
    footerBg,
    headerAlignment,
    prominentHeadline,
    buttons:           buttons.slice(0, 10),
    favicon:           resolveUrl(document.querySelector('link[rel*="icon"]')?.href) || null,
  };

  // ─── 10. Screenshot via html2canvas ──────────────────────────────────────────

  try {
    // Load html2canvas via fetch + new Function so it works even on sites whose
    // CSP blocks external script tags. fetch() uses CORS (not script-src), and
    // the DevTools console context doesn't restrict new Function() from pasted code.
    const h2c = await (async () => {
      if (window.html2canvas) return window.html2canvas;
      const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

      // Try script tag first (fastest, works without CSP restrictions on most sites)
      try {
        await Promise.race([
          new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = CDN; s.crossOrigin = 'anonymous';
            s.onload = () => res(); s.onerror = rej;
            document.head.appendChild(s);
          }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000)),
        ]);
        if (window.html2canvas) return window.html2canvas;
      } catch {}

      // Fallback: fetch the source, execute via new Function (bypasses script-src CSP)
      const src = await Promise.race([
        fetch(CDN).then(r => { if (!r.ok) throw new Error('fetch failed'); return r.text(); }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('fetch timeout')), 8000)),
      ]);
      // eslint-disable-next-line no-new-func
      new Function(src)();
      if (!window.html2canvas) throw new Error('html2canvas unavailable after eval');
      return window.html2canvas;
    })();

    const canvas = await Promise.race([
      h2c(document.documentElement, {
        useCORS:      true,
        allowTaint:   false,
        scale:        0.5,
        logging:      false,
        imageTimeout: 4000,
      }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 20000)),
    ]);

    result.screenshotBase64 = canvas.toDataURL('image/jpeg', 0.75).replace(/^data:image\\/jpeg;base64,/, '');
    console.log('%c📷 Screenshot captured', 'color:#3b82f6');
  } catch(e) {
    console.warn('[Fintainium] Screenshot skipped:', e.message);
  }

  const sent = !!window.opener;
  if (sent) {
    try {
      window.opener.postMessage(JSON.stringify({ type: 'fintainium-branding-extraction', data: result }), '*');
    } catch(e) {
      console.error('postMessage failed:', e);
    }
  }

  // Copy to clipboard as backup (works in Chrome DevTools context)
  try { copy(result); } catch(e) {}

  if (sent) {
    console.log('%c✅ Branding data sent back to Fintainium automatically! You can close this tab.', 'color:#22c55e;font-weight:bold;font-size:13px');
  } else {
    console.warn('⚠️  No opener window found — Fintainium could not receive the data automatically.\\n\\nThis usually means this tab was opened directly rather than from Fintainium.\\nThe result has been copied to your clipboard — paste it manually in the branding tool.');
    console.log(result);
  }

  return result;
})();`;
}
