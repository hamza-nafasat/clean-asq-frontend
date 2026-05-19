const cl = (v) => Math.min(Math.max(v, 0), 1);
const p = (n) => n.toFixed(1);
const a = (n) => cl(n).toFixed(3);

// Vector pointing toward the light source in CSS coords
const toLightX = (deg, d) => -Math.cos((deg * Math.PI) / 180) * d;
const toLightY = (deg, d) => Math.sin((deg * Math.PI) / 180) * d;

export const EFFECT_PRESETS = {
  none: {
    label: "None",
    icon: "○",
    boxShadow: () => "",
  },

  bevel: {
    label: "Bevel",
    icon: "⬡",
    boxShadow(i = 1, deg = 135) {
      const d = 3 * i,
        bl = p(8 * i);
      const hx = p(toLightX(deg, d)),
        hy = p(toLightY(deg, d));
      const sx = p(-toLightX(deg, d)),
        sy = p(-toLightY(deg, d));
      return [
        `inset ${hx}px ${hy}px ${bl}px rgba(255,255,255,${a(0.25 * i)})`,
        `inset ${sx}px ${sy}px ${bl}px rgba(0,0,0,${a(0.25 * i)})`,
      ].join(", ");
    },
  },

  glow: {
    label: "Outer Glow",
    icon: "✦",
    // Omnidirectional — angle has no effect
    boxShadow(i = 1) {
      return [
        `0 0 ${p(18 * i)}px rgba(255,255,255,${a(0.3 * i)})`,
        `0 0 ${p(38 * i)}px rgba(255,255,255,${a(0.12 * i)})`,
      ].join(", ");
    },
  },

  "soft-shadow": {
    label: "Soft Shadow",
    icon: "▣",
    boxShadow(i = 1, deg = 135) {
      const d = 6 * i;
      const ox = p(toLightX(deg, d)),
        oy = p(toLightY(deg, d));
      const ox2 = p(toLightX(deg, d / 3)),
        oy2 = p(toLightY(deg, d / 3));
      return [
        `${ox}px ${oy}px ${p(24 * i)}px rgba(0,0,0,${a(0.28 * i)})`,
        `${ox2}px ${oy2}px ${p(6 * i)}px rgba(0,0,0,${a(0.14 * i)})`,
      ].join(", ");
    },
  },

  "soft-edges": {
    label: "Soft Edges",
    icon: "▢",
    boxShadow(i = 1, deg = 90) {
      const d = 8 * i;
      return [
        `0 0 0 ${p(i)}px rgba(255,255,255,${a(0.12 * i)})`,
        `${p(toLightX(deg, d))}px ${p(toLightY(deg, d))}px ${p(32 * i)}px rgba(0,0,0,${a(0.2 * i)})`,
      ].join(", ");
    },
  },

  reflection: {
    label: "Reflection",
    icon: "◈",
    boxShadow(i = 1, deg = 90) {
      const d = 2 * i;
      const hx = p(toLightX(deg, d)),
        hy = p(toLightY(deg, d));
      const dx = p(-toLightX(deg, d * 0.5)),
        dy = p(-toLightY(deg, d * 0.5));
      const shx = p(toLightX(deg, 4 * i)),
        shy = p(toLightY(deg, 4 * i));
      return [
        `inset ${hx}px ${hy}px 0px rgba(255,255,255,${a(0.35 * i)})`,
        `inset ${dx}px ${dy}px 0px rgba(0,0,0,${a(0.15 * i)})`,
        `${shx}px ${shy}px ${p(12 * i)}px rgba(0,0,0,${a(0.15 * i)})`,
      ].join(", ");
    },
  },
};

export const EFFECT_OPTIONS = Object.entries(EFFECT_PRESETS).map(([value, { label, icon }]) => ({
  value,
  label,
  icon,
}));

// ── Serialization ─────────────────────────────────────────────────────────────

/** Parse any stored effect value → { effects: { name: intensity }, angle: number } */
export function parseEffectState(value) {
  if (!value || value === "none") return { effects: {}, angle: 135 };
  if (value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      return { effects: parsed.effects ?? {}, angle: parsed.angle ?? 135 };
    } catch {
      /* fall through to legacy */
    }
  }
  // Legacy: "effectName" or "effectName:intensity"
  const colonIdx = value.indexOf(":");
  const name = colonIdx === -1 ? value : value.slice(0, colonIdx);
  const intensity = colonIdx === -1 ? 1 : parseFloat(value.slice(colonIdx + 1)) || 1;
  if (name === "none" || !EFFECT_PRESETS[name]) return { effects: {}, angle: 135 };
  return { effects: { [name]: intensity }, angle: 135 };
}

/** Serialize effect state → stored string */
export function encodeEffectState({ effects, angle }) {
  if (!effects || Object.keys(effects).length === 0) return "none";
  return JSON.stringify({ effects, angle });
}

/** Convert any stored effect value to a CSS box-shadow string. */
export function effectToBoxShadow(value) {
  const { effects, angle } = parseEffectState(value);
  const parts = [];
  for (const [name, intensity] of Object.entries(effects)) {
    const preset = EFFECT_PRESETS[name];
    if (preset && intensity > 0) {
      const shadow = preset.boxShadow(intensity, angle);
      if (shadow) parts.push(shadow);
    }
  }
  return parts.join(", ");
}

// ── Material / gloss ─────────────────────────────────────────────────────────

/**
 * Convert a material value (0 = matte, 100 = high-gloss) into a CSS gradient
 * that can be layered on top of a base background to simulate paint finish.
 *
 * lightAngle uses the same convention as effect angles (0=right, 90=top, 135=top-left).
 * Returns null when material is 0 so callers can skip adding an empty layer.
 */
export function materialToGloss(material, lightAngle = 90) {
  if (!material || material <= 0) return null;
  const t = material / 100;
  // Convert "where light comes from" angle to CSS gradient direction angle.
  // CSS 0deg = bottom→top, 180deg = top→bottom.
  // Light from top (90°) → gloss highlight at top → gradient top→bottom = 180deg.
  const cssAngle = (((270 - lightAngle) % 360) + 360) % 360;
  const a1 = Math.min(0.6 * t, 1).toFixed(3); // top highlight
  const a2 = Math.min(0.08 * t, 1).toFixed(3); // fade
  const a3 = Math.min(0.18 * t, 1).toFixed(3); // bottom shadow
  return `linear-gradient(${cssAngle}deg, rgba(255,255,255,${a1}) 0%, rgba(255,255,255,${a2}) 48%, rgba(0,0,0,0) 52%, rgba(0,0,0,${a3}) 100%)`;
}

/** Human-readable material name for a 0–100 value. */
export function materialName(v) {
  if (!v || v <= 0) return "Matte";
  if (v <= 20) return "Eggshell";
  if (v <= 40) return "Satin";
  if (v <= 60) return "Semi-gloss";
  if (v <= 80) return "Gloss";
  return "High-gloss";
}

/** @deprecated Use parseEffectState. Kept for backward compat. */
export function parseEffectValue(value) {
  const { effects } = parseEffectState(value);
  const entries = Object.entries(effects);
  if (entries.length === 0) return { name: "none", intensity: 1 };
  const [name, intensity] = entries[0];
  return { name, intensity };
}
