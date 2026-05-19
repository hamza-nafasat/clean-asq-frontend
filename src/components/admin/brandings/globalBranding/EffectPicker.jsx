import { EFFECT_OPTIONS, encodeEffectState, materialName, parseEffectState } from "@/lib/effectPresets";
import { useCallback, useEffect, useRef } from "react";
const DIRECTIONAL = new Set(["bevel", "soft-shadow", "soft-edges", "reflection"]);

function AngleDial({ angle, onChange }) {
  const SIZE = 48;
  const CX = SIZE / 2,
    CY = SIZE / 2,
    R = SIZE / 2 - 5;
  const rad = (angle * Math.PI) / 180;
  const tipX = CX + Math.cos(rad) * R;
  const tipY = CY - Math.sin(rad) * R;

  const svgRef = useRef(null);
  const dragging = useRef(false);

  const angleFromPointer = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current.getBoundingClientRect();
      const x = clientX - rect.left - CX;
      const y = -(clientY - rect.top - CY);
      return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
    },
    [CX, CY],
  );

  useEffect(() => {
    const onMove = (e) => {
      if (dragging.current) onChange(angleFromPointer(e.clientX, e.clientY));
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onChange, angleFromPointer]);

  const TICKS = [
    { deg: 0, label: "E" },
    { deg: 90, label: "N" },
    { deg: 180, label: "W" },
    { deg: 270, label: "S" },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Lighting</span>
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        className="cursor-crosshair shrink-0"
        title={`${angle}° — drag to set lighting angle`}
        onMouseDown={(e) => {
          dragging.current = true;
          onChange(angleFromPointer(e.clientX, e.clientY));
        }}
      >
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
        {TICKS.map(({ deg, label }) => {
          const tr = (deg * Math.PI) / 180;
          return (
            <g key={deg}>
              <line
                x1={CX + Math.cos(tr) * (R - 3)}
                y1={CY - Math.sin(tr) * (R - 3)}
                x2={CX + Math.cos(tr) * R}
                y2={CY - Math.sin(tr) * R}
                stroke="#d1d5db"
                strokeWidth="1.5"
              />
              <text
                x={CX + Math.cos(tr) * (R + 6)}
                y={CY - Math.sin(tr) * (R + 6)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="5"
                fill="#9ca3af"
                style={{ userSelect: "none" }}
              >
                {label}
              </text>
            </g>
          );
        })}
        <line
          x1={CX}
          y1={CY}
          x2={tipX}
          y2={tipY}
          stroke="var(--primary, #6366f1)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r={2.5} fill="var(--primary, #6366f1)" />
        <circle cx={tipX} cy={tipY} r={3} fill="var(--primary, #6366f1)" />
      </svg>
      <input
        type="number"
        min={0}
        max={359}
        value={angle}
        onChange={(e) => onChange(((Number(e.target.value) % 360) + 360) % 360)}
        className="w-14 h-7 rounded-md border border-gray-300 bg-[#FAFBFF] px-2 text-xs text-gray-700 outline-none text-center"
      />
      <span className="text-xs text-gray-400">°</span>
    </div>
  );
}

function EffectPicker({ label, value, onChange, material = 0, onMaterialChange }) {
  const { effects, angle } = parseEffectState(value);

  const activeNames = Object.keys(effects);
  const hasAnyEffect = activeNames.length > 0;
  const hasDirectional = activeNames.some((n) => DIRECTIONAL.has(n));
  const showAngleDial = hasDirectional || material > 0;

  const toggleEffect = (name) => {
    if (name === "none") {
      onChange("none");
      return;
    }
    const next = { ...effects };
    if (next[name] !== undefined) delete next[name];
    else next[name] = 1.0;
    onChange(Object.keys(next).length === 0 ? "none" : encodeEffectState({ effects: next, angle }));
  };

  const setIntensity = (name, intensity) => {
    onChange(encodeEffectState({ effects: { ...effects, [name]: intensity }, angle }));
  };

  const setAngle = (newAngle) => {
    onChange(encodeEffectState({ effects, angle: newAngle }));
  };

  const activeOptions = EFFECT_OPTIONS.filter((o) => o.value !== "none" && effects[o.value] !== undefined);

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>}

      {/* Effect toggle buttons */}
      <div className="flex flex-wrap gap-1">
        {EFFECT_OPTIONS.map((opt) => {
          const isActive = opt.value === "none" ? !hasAnyEffect : effects[opt.value] !== undefined;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleEffect(opt.value)}
              title={opt.label}
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

      {/* Per-effect intensity sliders */}
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
                  onChange={(e) => setIntensity(opt.value, parseFloat(e.target.value))}
                  className="flex-1 min-w-20 max-w-[180px]"
                  style={{ accentColor: "var(--primary, #6366f1)" }}
                />
                <span className="text-[10px] text-gray-400 shrink-0">Strong</span>
                <span className="w-7 shrink-0 text-right text-[10px] text-gray-500">{intensity.toFixed(1)}×</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Material / gloss slider */}
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
            onChange={(e) => onMaterialChange(Number(e.target.value))}
            className="flex-1 min-w-20 max-w-[180px]"
            style={{ accentColor: "var(--primary, #6366f1)" }}
          />
          <span className="text-[10px] text-gray-400 shrink-0">Glossy</span>
          <span className="w-16 shrink-0 text-right text-[10px] text-gray-500">{materialName(material)}</span>
        </div>
      )}

      {/* Lighting angle — shown when any directional effect is active, or material > 0 */}
      {showAngleDial && (
        <div className="pl-1 pt-0.5">
          <AngleDial angle={angle} onChange={setAngle} />
        </div>
      )}
    </div>
  );
}

export default EffectPicker;
