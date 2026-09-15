import { BRANDING_FONT_OPTIONS } from "../utils/branding.constants";

const FontPicker = ({ value = "", onChange }) => (
  <div className="space-y-2 rounded-sm border p-1 shadow">
    <select
      value={value}
      aria-label="Font family"
      onChange={(e) => onChange?.(e.target.value)}
      className="focus:ring-primary focus:border-primary mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:outline-none sm:text-sm"
    >
      {BRANDING_FONT_OPTIONS.map((font) => (
        <option key={font.value} value={font.value}>
          {font.label}
        </option>
      ))}
    </select>
  </div>
);

export default FontPicker;
