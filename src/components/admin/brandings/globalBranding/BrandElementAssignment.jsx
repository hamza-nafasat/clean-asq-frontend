import { HexColorPicker } from 'react-colorful';
import FontPicker from './FontPicker';

const ColorInput = ({ label, color, setColor }) => {
  const handleChange = e => {
    setColor(e.target.value);
  };

  return (
    <div className="relative flex flex-col space-y-1">
      <label htmlFor={label.toLowerCase().replace(/\s/g, '-') + '-color'} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          className="size-14 cursor-pointer appearance-none rounded-lg border-none outline-none focus:ring-0"
          value={color}
          onChange={handleChange}
        />
        <div
          type="text"
          // id={label.toLowerCase().replace(/\s/g, '-') + '-color'}
          className="flex h-12 w-28 items-center justify-center rounded-md border px-4 py-2 text-center text-sm shadow-sm"
          // {color}
          // onChange={handleChange}
        >
          {color}
        </div>
      </div>

      {/* {showPicker && (
        <div className="absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2">
          <HexColorPicker color={color} onChange={setColor} />
        </div>
      )} */}
    </div>
  );
};

const BrandElementAssignment = ({
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  accentColor,
  setAccentColor,
  textColor,
  setTextColor,
  linkColor,
  setLinkColor,
  backgroundColor,
  setBackgroundColor,
  frameColor,
  setFrameColor,
  // primaryFont,
  // setPrimaryFont,
  fontFamily,
  setFontFamily,

  buttonTextPrimary,
  setButtonTextPrimary,
  buttonTextSecondary,
  setButtonTextSecondary,
}) => {
  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Assign Brand Element</h2>

      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ColorInput label="Primary Color (Buttons, Headers)" color={primaryColor} setColor={setPrimaryColor} />
        <ColorInput label="Secondary Color (Alternative Buttons)" color={secondaryColor} setColor={setSecondaryColor} />
        <ColorInput label="Accent Color (Highlights, Badges)" color={accentColor} setColor={setAccentColor} />
        <ColorInput label="Text Color" color={textColor} setColor={setTextColor} />
        <ColorInput label="Link Color" color={linkColor} setColor={setLinkColor} />
        <ColorInput label="Background Color" color={backgroundColor} setColor={setBackgroundColor} />
        <ColorInput label="Frame Color (Input Fields, Borders)" color={frameColor} setColor={setFrameColor} />
        <ColorInput label="Button Primary text" color={buttonTextPrimary} setColor={setButtonTextPrimary} />
        <ColorInput label="Button Secondary text" color={buttonTextSecondary} setColor={setButtonTextSecondary} />
      </div>
      <div className="bg-buttonTextPrimary text-buttonText size-8">hallo</div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="primary-font" className="text-sm font-medium text-gray-700">
          Primary Font
        </label>

        <div className="mt-3 flex items-center space-x-2">
          <span className="rounded bg-gray-100 px-4 py-3 text-lg font-semibold">Aa</span>
          <FontPicker value={fontFamily.toLowerCase()} onChange={value => setFontFamily(value)} />
          <button
            type="button"
            className="rounded-sm border px-4 py-[13px] text-sm text-gray-700 shadow-sm"
            onClick={() => setFontFamily('Inter')}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandElementAssignment;
