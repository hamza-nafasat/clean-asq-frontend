import React, { useEffect, useState } from "react";
import { useBranding } from "../../../../hooks/BrandingContext";
import { BiColor } from "react-icons/bi";
import { IoColorPaletteOutline } from "react-icons/io5";
import { MdColorize } from "react-icons/md";
import Button from "@/components/shared/small/Button";

// ─── Helpers ────────────────────────────────────────────────────────────────

const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const randomHex = () => {
  const ch = () =>
    Math.floor(Math.random() * 180 + 38)
      .toString(16)
      .padStart(2, "0");
  return `#${ch()}${ch()}${ch()}`;
};

const isValidHex = (value) => /^#[0-9a-fA-F]{6}$/.test(value);

// ─── Color families ──────────────────────────────────────────────────────────
//
//  0  Black   — near-black range   lightness 0 %–40 %   (default slider=0  → #000000)
//  1  White   — near-white range   lightness 60 %–100 % (default slider=100 → #ffffff)
//  2  Gray    — full neutral        lightness 5 %–95 %   (never pure black/white)
//  3  Red     — lightness 10–90 %  (50 = pure red)
//  4  Yellow  — lightness 10–90 %  (50 = pure yellow)
//  5  Orange  — hue 0°–60°         (50 = ~30° orange)
//  6  Blue    — lightness 10–90 %  (50 = pure blue)
//  7  Purple  — hue 240°–300°      (50 = 270° purple)
//  8  Green   — hue 60°–240°       (50 = ~150° green)
//  9  Custom  — free color picker

const computeSliderColor = (index, sliderValue, customColor) => {
  const v = sliderValue;
  switch (index) {
    case 0:
      return hslToHex(0, 0, v * 0.4); // black → dark-gray (0%–40%)
    case 1:
      return hslToHex(0, 0, 60 + v * 0.4); // light-gray → white (60%–100%)
    case 2:
      return hslToHex(0, 0, 5 + v * 0.9); // gray 5%–95%
    case 3:
      return hslToHex(0, 100, 10 + v * 0.8); // red dark→light
    case 4:
      return hslToHex(60, 100, 10 + v * 0.8); // yellow dark→light
    case 5:
      return hslToHex(v * 0.6, 100, 50); // orange hue 0°→60°
    case 6:
      return hslToHex(240, 100, 10 + v * 0.8); // blue dark→light
    case 7:
      return hslToHex(240 + v * 0.6, 100, 50); // purple hue 240°→300°
    case 8:
      return hslToHex(60 + v * 1.8, 100, 45); // green hue 60°→240°
    case 9:
      return customColor;
    default:
      return "#000000";
  }
};

const COLOR_LABELS = ["Black", "White", "Gray", "Red", "Yellow", "Orange", "Blue", "Purple", "Green", "Custom"];

const SLIDER_ENDS = [
  ["Pure Black", "Dark Gray"],
  ["Light Gray", "Pure White"],
  ["Near Black", "Near White"],
  ["Darker", "Lighter"],
  ["Darker", "Lighter"],
  ["More Red", "More Yellow"],
  ["Darker", "Lighter"],
  ["More Blue", "More Red"],
  ["More Yellow", "More Blue"],
  null, // no slider for custom (custom tab is default)
];

const DEFAULT_SLIDERS = {
  0: 0,
  1: 100,
  2: 50,
  3: 50,
  4: 50,
  5: 50,
  6: 50,
  7: 50,
  8: 50,
};

// ─── Component ───────────────────────────────────────────────────────────────

const ColorPalette = ({ colorPalette, suggestedColors = [] }) => {
  const { setPrimaryColor } = useBranding();

  // Which swatch panel is open
  const [activeIndex, setActiveIndex] = useState(null);
  // 'slider' | 'custom'
  const [activeMode, setActiveMode] = useState("slider");

  const [sliderValues, setSliderValues] = useState({ ...DEFAULT_SLIDERS });

  // Per-swatch custom picker color (lazy-initialised when first opening custom mode)
  const [customPickerColors, setCustomPickerColors] = useState({});

  // Raw hex text the user is typing (may be invalid mid-edit)
  const [hexInputValue, setHexInputValue] = useState("");

  // 10th swatch: random base color
  const [randomBase] = useState(randomHex);

  // Single source of truth: the color currently shown in the open panel.
  // Both the slider and the custom picker write here; Apply reads directly from here.
  const [pendingColor, setPendingColor] = useState("#000000");

  const eyedropperSupported = typeof window !== "undefined" && "EyeDropper" in window;

  useEffect(() => {
    if (!suggestedColors?.length) return;
    const updates = {};
    suggestedColors.slice(0, 10).forEach((item, i) => {
      if (item?.hex) updates[i] = item.hex;
    });
    if (Object.keys(updates).length) {
      setCustomPickerColors((prev) => ({ ...prev, ...updates }));
    }
  }, [suggestedColors]);

  const handlePaletteColorClick = (hex) => setPrimaryColor(hex);

  const getSliderColor = (index) => {
    if (customPickerColors[index]) return customPickerColors[index];
    return computeSliderColor(index, sliderValues[index] ?? DEFAULT_SLIDERS[index] ?? 50, randomBase);
  };

  const getCustomColor = (index) =>
    customPickerColors[index] ??
    (index === 9
      ? randomBase
      : computeSliderColor(index, sliderValues[index] ?? DEFAULT_SLIDERS[index] ?? 50, randomBase));

  const openPanel = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
      return;
    }
    const defaultMode = index === 9 ? "custom" : "slider";
    const seed = computeSliderColor(index, sliderValues[index] ?? DEFAULT_SLIDERS[index] ?? 50, randomBase);
    const initialColor = customPickerColors[index] ?? seed;

    setActiveIndex(index);
    setActiveMode(defaultMode);
    setPendingColor(defaultMode === "custom" ? initialColor : getSliderColor(index));
    setCustomPickerColors((prev) => ({ ...prev, [index]: initialColor }));
    setHexInputValue(initialColor);
  };

  const switchMode = (mode) => {
    setActiveMode(mode);
    if (mode === "custom") {
      const current = customPickerColors[activeIndex] ?? getSliderColor(activeIndex);
      setPendingColor(current);
      setHexInputValue(current);
    } else {
      setPendingColor(getSliderColor(activeIndex));
    }
  };

  const handleSliderChange = (index, value) => {
    setSliderValues((prev) => ({ ...prev, [index]: Number(value) }));
    const newColor = computeSliderColor(index, Number(value), randomBase);
    setCustomPickerColors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setPendingColor(newColor);
  };

  const handlePickerChange = (index, value) => {
    setCustomPickerColors((prev) => ({ ...prev, [index]: value }));
    setHexInputValue(value);
    setPendingColor(value);
  };

  const handleHexInput = (index, raw) => {
    setHexInputValue(raw);
    const normalized = raw.startsWith("#") ? raw : `#${raw}`;
    if (isValidHex(normalized)) {
      setCustomPickerColors((prev) => ({ ...prev, [index]: normalized }));
      setPendingColor(normalized);
    }
  };

  const handleEyedropper = async (index) => {
    try {
      const dropper = new EyeDropper();
      const { sRGBHex } = await dropper.open();
      handlePickerChange(index, sRGBHex);
    } catch {
      // user cancelled
    }
  };

  // ── Apply ─────────────────────────────────────────────────────────────────
  const handleApply = () => {
    setPrimaryColor(pendingColor);
    setActiveIndex(null);
  };

  const activeColor = pendingColor;

  return (
    <div className="mt-6 w-full">
      {/* ── Website / Image Color Palette ──────────────────────────────────── */}
      <div className="mb-4 flex items-center gap-1.5 text-[16px] font-medium text-gray-700 md:gap-3 md:text-xl">
        <IoColorPaletteOutline className="text-primary size-6" />
        Website / Image Color Palette
      </div>

      <div className="mt-6 grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-8 xl:grid-cols-10 xl:gap-10">
        {colorPalette?.map((color, index) => {
          const hex = typeof color === "string" ? color : color?.hex;
          const source = typeof color === "object" && color?.source ? color?.source : null;
          return (
            <div
              key={index}
              className="group relative flex w-full cursor-pointer flex-col items-center gap-2"
              onClick={() => handlePaletteColorClick(hex)}
            >
              <div
                className="h-24 w-full rounded-md border shadow-sm"
                style={{ backgroundColor: hex, borderColor: "#e0e0e0" }}
              >
                {source && (
                  <div className="absolute bottom-8 left-1/2 z-10 hidden w-max max-w-40 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-center text-xs text-white shadow group-hover:block">
                    {source}
                  </div>
                )}
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: parseInt(hex?.substring(1), 16) > 0xffffff / 2 ? "#000" : "#555" }}
              >
                {hex}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-primary my-6 border-t-2" />

      {/* ── Custom Color Options ────────────────────────────────────────────── */}
      <div className="mt-6 flex items-center gap-1.5 text-lg font-normal text-gray-500 md:gap-3">
        <BiColor className="text-primary size-6" />
        Custom Color Options
      </div>
      <p className="mt-1 text-sm text-gray-400">
        Click any swatch to open it. Use the <strong>Slider</strong> to stay within the color family, or switch to{" "}
        <strong>Custom</strong> for a free color picker with hex input and eyedropper.
      </p>

      {/* Swatches */}
      <div className="mt-6 grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-8 xl:grid-cols-10 xl:gap-10">
        {COLOR_LABELS.map((label, index) => {
          const color = getSliderColor(index);
          const isActive = activeIndex === index;
          return (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <Button
                type="button"
                title="Click to adjust or apply"
                onClick={() => openPanel(index)}
                className={`h-24 w-full rounded-md border shadow-sm transition-transform hover:scale-105 focus:outline-none ${
                  isActive ? "ring-2 ring-blue-400" : ""
                }`}
                style={{ backgroundColor: color, borderColor: isActive ? "#60a5fa" : "#e0e0e0" }}
              />
              {customPickerColors[index] ? (
                <span className="font-mono text-sm font-medium text-gray-600">{color}</span>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-600">{label}</span>
                  {index > 1 && <span className="font-mono text-sm text-gray-400">{color}</span>}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Adjustment panel ─────────────────────────────────────────────────── */}
      {activeIndex !== null && (
        <div className="mt-4 rounded-xl border p-5">
          {/* Mode tabs */}
          <div className="mb-4 flex gap-1 rounded-lg p-1 w-fit">
            {activeIndex !== 9 && (
              <Button
                variant={`${activeMode == "slider" ? "primary" : "secondary"}`}
                label={"Slider"}
                type="button"
                onClick={() => switchMode("slider")}
              />
            )}

            <Button
              variant={`${activeMode == "custom" ? "primary" : "secondary"}`}
              label={"Custom"}
              type="button"
              onClick={() => switchMode("custom")}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Live color preview */}
            <div
              className="h-16 w-16 shrink-0 rounded-lg border border-gray-300 shadow-inner"
              style={{ backgroundColor: activeColor }}
            />

            {/* ── Slider mode ── */}
            {activeMode === "slider" && activeIndex !== 9 && (
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-xs text-gray-400">
                  <span>{SLIDER_ENDS[activeIndex]?.[0]}</span>
                  <span>{SLIDER_ENDS[activeIndex]?.[1]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderValues[activeIndex] ?? DEFAULT_SLIDERS[activeIndex] ?? 50}
                  onChange={(e) => handleSliderChange(activeIndex, e.target.value)}
                  className="w-full cursor-pointer accent-gray-600"
                />
                <p className="mt-1 text-center font-mono text-xs text-gray-500">{activeColor}</p>
              </div>
            )}

            {/* ── Custom mode ── */}
            {(activeMode === "custom" || activeIndex === 9) && (
              <div className="flex flex-1 flex-col gap-2">
                {/* Color picker + hex input row */}
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={getCustomColor(activeIndex)}
                    onChange={(e) => handlePickerChange(activeIndex, e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-md border border-gray-300 p-0.5"
                    title="Open color picker"
                  />
                  <input
                    type="text"
                    value={hexInputValue}
                    onChange={(e) => handleHexInput(activeIndex, e.target.value)}
                    onBlur={() => {
                      // Normalise on blur
                      const normalised = hexInputValue.startsWith("#") ? hexInputValue : `#${hexInputValue}`;
                      if (isValidHex(normalised)) {
                        handlePickerChange(activeIndex, normalised);
                      } else {
                        setHexInputValue(getCustomColor(activeIndex));
                      }
                    }}
                    placeholder="#000000"
                    maxLength={7}
                    className="w-28 rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                  {eyedropperSupported && (
                    <button
                      type="button"
                      onClick={() => handleEyedropper(activeIndex)}
                      title="Pick color from screen"
                      className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      <MdColorize className="h-4 w-4" />
                      Dropper
                    </button>
                  )}
                </div>
                <p className="font-mono text-xs text-gray-400">{getCustomColor(activeIndex)}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={handleApply}
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-primary my-6 border-t-2" />

      {/* ── Assign Brand Element ──────────────────────────────────────────────── */}
      <div className="mt-12 flex items-center space-x-6">
        <div className="flex items-center gap-3 text-gray-600">
          <BiColor className="text-primary size-6" />
          Assign Brand Element
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
