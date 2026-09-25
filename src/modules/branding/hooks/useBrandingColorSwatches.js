import { useState } from "react";
import { BRANDING_COLOR_MODES, BRANDING_CUSTOM_SWATCH_INDEX, BRANDING_DEFAULT_SLIDERS } from "../utils/branding.constants";
import { computeSliderColor, isValidHex, randomHex } from "../utils/branding.color.utils";

const MAX_SUGGESTED_SWATCHES = 10;
const DEFAULT_SLIDER_VALUE = 50;

const toSuggestedColors = (suggestedColors) =>
  Object.fromEntries(
    suggestedColors
      .slice(0, MAX_SUGGESTED_SWATCHES)
      .map((item, index) => [index, item?.hex])
      .filter(([, hex]) => hex),
  );

const withoutKeys = (object, keys) => Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));

// swatch colours and adjust panel
const useBrandingColorSwatches = ({ suggestedColors, onApply }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeMode, setActiveMode] = useState(BRANDING_COLOR_MODES.SLIDER);
  const [sliderValues, setSliderValues] = useState({ ...BRANDING_DEFAULT_SLIDERS });
  const [edits, setEdits] = useState({});
  const [hexInputValue, setHexInputValue] = useState("");
  const [randomBase] = useState(randomHex);
  const [pendingColor, setPendingColor] = useState("#000000");
  const [seenSuggestions, setSeenSuggestions] = useState(suggestedColors);

  const suggested = toSuggestedColors(suggestedColors);

  // new suggestions replace earlier edits
  if (seenSuggestions !== suggestedColors) {
    setSeenSuggestions(suggestedColors);
    setEdits((prev) => withoutKeys(prev, Object.keys(suggested)));
  }

  const getPickedColor = (index) => (index in edits ? edits[index] : suggested[index]) || undefined;
  const setPickedColor = (index, color) => setEdits((prev) => ({ ...prev, [index]: color }));

  const getSliderValue = (index) => sliderValues[index] ?? BRANDING_DEFAULT_SLIDERS[index] ?? DEFAULT_SLIDER_VALUE;
  const getFormulaColor = (index) => computeSliderColor(index, getSliderValue(index), randomBase);
  const getSliderColor = (index) => getPickedColor(index) || getFormulaColor(index);
  const getCustomColor = (index) =>
    getPickedColor(index) ?? (index === BRANDING_CUSTOM_SWATCH_INDEX ? randomBase : getFormulaColor(index));

  const openPanel = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
      return;
    }
    const defaultMode = index === BRANDING_CUSTOM_SWATCH_INDEX ? BRANDING_COLOR_MODES.CUSTOM : BRANDING_COLOR_MODES.SLIDER;
    const initialColor = getPickedColor(index) ?? getFormulaColor(index);
    setActiveIndex(index);
    setActiveMode(defaultMode);
    setPendingColor(defaultMode === BRANDING_COLOR_MODES.CUSTOM ? initialColor : getSliderColor(index));
    setPickedColor(index, initialColor);
    setHexInputValue(initialColor);
  };

  const switchMode = (mode) => {
    setActiveMode(mode);
    const current = getSliderColor(activeIndex);
    setPendingColor(current);
    if (mode === BRANDING_COLOR_MODES.CUSTOM) setHexInputValue(current);
  };

  const handleSliderChange = (value) => {
    setSliderValues((prev) => ({ ...prev, [activeIndex]: Number(value) }));
    // slider clears the picked colour
    setPickedColor(activeIndex, null);
    setPendingColor(computeSliderColor(activeIndex, Number(value), randomBase));
  };

  const handlePickerChange = (value) => {
    setPickedColor(activeIndex, value);
    setHexInputValue(value);
    setPendingColor(value);
  };

  const handleHexInput = (raw) => {
    setHexInputValue(raw);
    const normalized = raw.startsWith("#") ? raw : `#${raw}`;
    if (!isValidHex(normalized)) return;
    setPickedColor(activeIndex, normalized);
    setPendingColor(normalized);
  };

  const handleApply = () => {
    onApply?.(pendingColor);
    setActiveIndex(null);
  };

  return {
    activeIndex,
    activeMode,
    pendingColor,
    hexInputValue,
    getPickedColor,
    getSliderValue,
    getSliderColor,
    getCustomColor,
    openPanel,
    switchMode,
    handleSliderChange,
    handlePickerChange,
    handleHexInput,
    resetHexInput: () => setHexInputValue(getCustomColor(activeIndex)),
    handleApply,
    closePanel: () => setActiveIndex(null),
  };
};

export default useBrandingColorSwatches;
