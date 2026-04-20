import { useRef } from "react";

export default function ColorPalette({ colorPalette, setColorPalette }) {
  const colorInputRefs = useRef([]);

  const updateColorPalette = (color, index) => {
    const newColorPalette = [...colorPalette];
    newColorPalette[index] = {
      hex: color,
      source: "Manual",
    };
    setColorPalette(newColorPalette);
  };

  return (
    <div className="mt-6 w-full">
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-10 gap-4">
        {colorPalette?.map((color, index) => {
          const hex = typeof color === "string" ? color : color?.hex;
          const source = typeof color === "object" && color?.source ? color.source : null;

          return (
            <div
              key={index}
              className="group relative cursor-pointer flex flex-col items-center gap-2"
              onClick={() => colorInputRefs.current[index]?.click()}
            >
              {/* hidden input */}
              <input
                type="color"
                value={hex}
                ref={(el) => (colorInputRefs.current[index] = el)}
                onChange={(e) => updateColorPalette(e.target.value, index)}
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />

              {/* color box */}
              <div
                className="h-24 w-full rounded-md border shadow-sm relative"
                style={{ backgroundColor: hex, borderColor: "#e0e0e0" }}
              >
                {source && (
                  <div className="absolute bottom-1 left-1/2 z-10 hidden w-max max-w-30 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-center text-xs text-white shadow group-hover:block">
                    {source}
                  </div>
                )}
              </div>

              {/* hex text */}
              <div
                className="text-sm font-medium"
                style={{
                  color: parseInt(hex?.substring(1), 16) > 0xffffff / 2 ? "#000" : "#555",
                }}
              >
                {hex}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
