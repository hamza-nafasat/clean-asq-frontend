const cl = (v) => Math.min(Math.max(v, 0), 1);
const p = (n) => n.toFixed(1);
const a = (n) => cl(n).toFixed(3);

// vector toward the light source
const toLightX = (deg, d) => -Math.cos((deg * Math.PI) / 180) * d;
const toLightY = (deg, d) => Math.sin((deg * Math.PI) / 180) * d;

export const EFFECT_NAMES = {
  NONE: "none",
  BEVEL: "bevel",
  GLOW: "glow",
  SOFT_SHADOW: "soft-shadow",
  SOFT_EDGES: "soft-edges",
  REFLECTION: "reflection",
};

export const EFFECT_PRESETS = {
  [EFFECT_NAMES.NONE]: {
    label: "None",
    icon: "○",
    boxShadow: () => "",
  },

  [EFFECT_NAMES.BEVEL]: {
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

  [EFFECT_NAMES.GLOW]: {
    label: "Outer Glow",
    icon: "✦",
    boxShadow(i = 1) {
      return [
        `0 0 ${p(18 * i)}px rgba(255,255,255,${a(0.3 * i)})`,
        `0 0 ${p(38 * i)}px rgba(255,255,255,${a(0.12 * i)})`,
      ].join(", ");
    },
  },

  [EFFECT_NAMES.SOFT_SHADOW]: {
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

  [EFFECT_NAMES.SOFT_EDGES]: {
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

  [EFFECT_NAMES.REFLECTION]: {
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

// stored effect value to state
export const parseEffectState = (value) => {
  if (!value || value === "none") return { effects: {}, angle: 135 };
  if (value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      return { effects: parsed.effects ?? {}, angle: parsed.angle ?? 135 };
    } catch {
      // fall through to legacy
    }
  }
  // legacy "name" or "name:intensity"
  const colonIdx = value.indexOf(":");
  const name = colonIdx === -1 ? value : value.slice(0, colonIdx);
  const intensity = colonIdx === -1 ? 1 : parseFloat(value.slice(colonIdx + 1)) || 1;
  if (name === "none" || !EFFECT_PRESETS[name]) return { effects: {}, angle: 135 };
  return { effects: { [name]: intensity }, angle: 135 };
};

// effect state to stored string
export const encodeEffectState = ({ effects, angle }) => {
  if (!effects || Object.keys(effects).length === 0) return "none";
  return JSON.stringify({ effects, angle });
};

// stored effect to css box-shadow
export const effectToBoxShadow = (value) => {
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
};

// material value to gloss gradient
export const materialToGloss = (material, lightAngle = 90) => {
  if (!material || material <= 0) return null;
  const t = material / 100;
  // light angle to css gradient angle
  const cssAngle = (((270 - lightAngle) % 360) + 360) % 360;
  const a1 = Math.min(0.6 * t, 1).toFixed(3);
  const a2 = Math.min(0.08 * t, 1).toFixed(3);
  const a3 = Math.min(0.18 * t, 1).toFixed(3);
  return `linear-gradient(${cssAngle}deg, rgba(255,255,255,${a1}) 0%, rgba(255,255,255,${a2}) 48%, rgba(0,0,0,0) 52%, rgba(0,0,0,${a3}) 100%)`;
};

// readable name for material value
export const materialName = (v) => {
  if (!v || v <= 0) return "Matte";
  if (v <= 20) return "Eggshell";
  if (v <= 40) return "Satin";
  if (v <= 60) return "Semi-gloss";
  if (v <= 80) return "Gloss";
  return "High-gloss";
};

// TODO: replace with parseEffectState
export const parseEffectValue = (value) => {
  const { effects } = parseEffectState(value);
  const entries = Object.entries(effects);
  if (entries.length === 0) return { name: "none", intensity: 1 };
  const [name, intensity] = entries[0];
  return { name, intensity };
};
