import { FONT_OPTIONS } from "@/constants";

const BrandingFontPicker = ({ id, value = "", onChange }) => (
  <div className="space-y-2 rounded-sm border p-1 shadow">
    <select
      id={id}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="focus:ring-primary focus:border-primary mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:outline-none sm:text-sm"
    >
      {FONT_OPTIONS.map((font) => (
        <option key={font.value} value={font.value}>
          {font.value}
        </option>
      ))}
    </select>
  </div>
);

export default BrandingFontPicker;
