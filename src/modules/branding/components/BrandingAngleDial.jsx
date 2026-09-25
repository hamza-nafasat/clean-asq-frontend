import { useRef } from "react";

const SIZE = 48;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = SIZE / 2 - 5;
const MAX_ANGLE = 359;
const TICKS = [
  { deg: 0, label: "E" },
  { deg: 90, label: "N" },
  { deg: 180, label: "W" },
  { deg: 270, label: "S" },
];
const KEY_STEPS = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };

const wrapAngle = (value) => ((value % 360) + 360) % 360;

const BrandingAngleDial = ({ angle = 0, onChange }) => {
  const rad = (angle * Math.PI) / 180;
  const tipX = CX + Math.cos(rad) * R;
  const tipY = CY - Math.sin(rad) * R;
  const isDragging = useRef(false);

  const angleFromPointer = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - CX;
    const y = -(e.clientY - rect.top - CY);
    return Math.round(wrapAngle((Math.atan2(y, x) * 180) / Math.PI));
  };

  const handlePointerDown = (e) => {
    isDragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange?.(angleFromPointer(e));
  };

  const handlePointerMove = (e) => {
    if (isDragging.current) onChange?.(angleFromPointer(e));
  };

  const handleKeyDown = (e) => {
    const step = KEY_STEPS[e.key];
    if (!step) return;
    e.preventDefault();
    onChange?.(wrapAngle(angle + step * (e.shiftKey ? 15 : 1)));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium tracking-wide whitespace-nowrap text-gray-500 uppercase">Lighting</span>
      <svg
        width={SIZE}
        height={SIZE}
        role="slider"
        tabIndex={0}
        aria-label="Lighting angle dial"
        aria-valuemin={0}
        aria-valuemax={MAX_ANGLE}
        aria-valuenow={angle}
        className="shrink-0 cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          isDragging.current = false;
        }}
        onKeyDown={handleKeyDown}
      >
        <title>{`${angle}° — drag to set lighting angle`}</title>
        <circle cx={CX} cy={CY} r={R} fill="none" className="stroke-gray-200" strokeWidth="1.5" />
        {TICKS.map(({ deg, label }) => {
          const tr = (deg * Math.PI) / 180;
          return (
            <g key={deg}>
              <line
                x1={CX + Math.cos(tr) * (R - 3)}
                y1={CY - Math.sin(tr) * (R - 3)}
                x2={CX + Math.cos(tr) * R}
                y2={CY - Math.sin(tr) * R}
                className="stroke-gray-300"
                strokeWidth="1.5"
              />
              <text
                x={CX + Math.cos(tr) * (R + 6)}
                y={CY - Math.sin(tr) * (R + 6)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="5"
                className="fill-gray-400 select-none"
              >
                {label}
              </text>
            </g>
          );
        })}
        <line x1={CX} y1={CY} x2={tipX} y2={tipY} className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={2.5} className="fill-primary" />
        <circle cx={tipX} cy={tipY} r={3} className="fill-primary" />
      </svg>
      <input
        type="number"
        min={0}
        max={MAX_ANGLE}
        value={angle}
        aria-label="Lighting angle"
        onChange={(e) => onChange?.(wrapAngle(Number(e.target.value)))}
        className="bg-fieldBackground h-7 w-14 rounded-md border border-gray-300 px-2 text-center text-xs text-gray-700 outline-none"
      />
      <span className="text-xs text-gray-400">°</span>
    </div>
  );
};

export default BrandingAngleDial;
