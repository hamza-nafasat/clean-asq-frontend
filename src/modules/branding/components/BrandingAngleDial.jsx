import { useCallback, useEffect, useRef } from "react";

const SIZE = 48;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = SIZE / 2 - 5;
const TICKS = [
  { deg: 0, label: "E" },
  { deg: 90, label: "N" },
  { deg: 180, label: "W" },
  { deg: 270, label: "S" },
];

const BrandingAngleDial = ({ angle = 0, onChange }) => {
  const rad = (angle * Math.PI) / 180;
  const tipX = CX + Math.cos(rad) * R;
  const tipY = CY - Math.sin(rad) * R;
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const angleFromPointer = useCallback((clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - CX;
    const y = -(clientY - rect.top - CY);
    return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
  }, []);

  // drag anywhere once started on the dial
  useEffect(() => {
    const onMove = (e) => {
      if (dragging.current) onChange?.(angleFromPointer(e.clientX, e.clientY));
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
          onChange?.(angleFromPointer(e.clientX, e.clientY));
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
        <line x1={CX} y1={CY} x2={tipX} y2={tipY} stroke="var(--primary, #6366f1)" strokeWidth="2" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={2.5} fill="var(--primary, #6366f1)" />
        <circle cx={tipX} cy={tipY} r={3} fill="var(--primary, #6366f1)" />
      </svg>
      <input
        type="number"
        min={0}
        max={359}
        value={angle}
        aria-label="Lighting angle"
        onChange={(e) => onChange?.(((Number(e.target.value) % 360) + 360) % 360)}
        className="w-14 h-7 rounded-md border border-gray-300 bg-[#FAFBFF] px-2 text-xs text-gray-700 outline-none text-center"
      />
      <span className="text-xs text-gray-400">°</span>
    </div>
  );
};

export default BrandingAngleDial;
