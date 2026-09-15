import BrandingAngleDial from "./BrandingAngleDial";
import { BRANDING_DIRECTIONAL_EFFECTS, BRANDING_EFFECT_NONE } from "../utils/branding.constants";
import { EFFECT_OPTIONS, encodeEffectState, materialName, parseEffectState } from "@/utils/effectPresets";

const EffectPicker = ({ label = "", value, onChange, material = 0, onMaterialChange }) => {
  const { effects, angle } = parseEffectState(value);
  const activeNames = Object.keys(effects);
  const hasAnyEffect = activeNames.length > 0;
  const showAngleDial = activeNames.some((n) => BRANDING_DIRECTIONAL_EFFECTS.has(n)) || material > 0;
  const activeOptions = EFFECT_OPTIONS.filter(
    (o) => o.value !== BRANDING_EFFECT_NONE && effects[o.value] !== undefined,
  );

  const toggleEffect = (name) => {
    if (name === BRANDING_EFFECT_NONE) {
      onChange?.(BRANDING_EFFECT_NONE);
      return;
    }
    const next = { ...effects };
    if (next[name] !== undefined) delete next[name];
    else next[name] = 1.0;
    onChange?.(Object.keys(next).length === 0 ? BRANDING_EFFECT_NONE : encodeEffectState({ effects: next, angle }));
  };

  const setIntensity = (name, intensity) =>
    onChange?.(encodeEffectState({ effects: { ...effects, [name]: intensity }, angle }));

  const setAngle = (newAngle) => onChange?.(encodeEffectState({ effects, angle: newAngle }));

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>}

      {/* Effect toggles */}
      <div className="flex flex-wrap gap-1">
        {EFFECT_OPTIONS.map((opt) => {
          const isActive = opt.value === BRANDING_EFFECT_NONE ? !hasAnyEffect : effects[opt.value] !== undefined;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleEffect(opt.value)}
              title={opt.label}
              aria-pressed={isActive}
              className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
                isActive
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700"
              }`}
            >
              <span className="text-sm leading-none">{opt.icon}</span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Intensity sliders */}
      {activeOptions.length > 0 && (
        <div className="flex flex-col gap-1 pl-1 pt-0.5">
          {activeOptions.map((opt) => {
            const intensity = effects[opt.value] ?? 1;
            return (
              <div key={opt.value} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-xs text-gray-500">
                  {opt.icon} {opt.label}
                </span>
                <span className="text-[10px] text-gray-400 shrink-0">Subtle</span>
                <input
                  type="range"
                  min={0.2}
                  max={4}
                  step={0.1}
                  value={intensity}
                  aria-label={`${opt.label} intensity`}
                  onChange={(e) => setIntensity(opt.value, parseFloat(e.target.value))}
                  className="flex-1 min-w-20 max-w-45"
                  style={{ accentColor: "var(--primary, #6366f1)" }}
                />
                <span className="text-[10px] text-gray-400 shrink-0">Strong</span>
                <span className="w-7 shrink-0 text-right text-[10px] text-gray-500">{intensity.toFixed(1)}×</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Material */}
      {onMaterialChange && (
        <div className="flex items-center gap-2 pl-1 pt-0.5">
          <span className="w-24 shrink-0 text-xs text-gray-500">🎨 Material</span>
          <span className="text-[10px] text-gray-400 shrink-0">Matte</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={material}
            aria-label="Material"
            onChange={(e) => onMaterialChange(Number(e.target.value))}
            className="flex-1 min-w-20 max-w-45"
            style={{ accentColor: "var(--primary, #6366f1)" }}
          />
          <span className="text-[10px] text-gray-400 shrink-0">Glossy</span>
          <span className="w-16 shrink-0 text-right text-[10px] text-gray-500">{materialName(material)}</span>
        </div>
      )}

      {showAngleDial && (
        <div className="pl-1 pt-0.5">
          <BrandingAngleDial angle={angle} onChange={setAngle} />
        </div>
      )}
    </div>
  );
};

export default EffectPicker;
