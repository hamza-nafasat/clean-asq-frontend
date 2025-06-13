import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

const ColorInput = ({ label, color, setColor }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = e => {
    setColor(e.target.value);
  };

  return (
    <div className="relative flex flex-col space-y-1">
      <label htmlFor={label.toLowerCase().replace(/\s/g, '-') + '-color'} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <div
          className="h-13 w-13 cursor-pointer rounded"
          style={{ backgroundColor: color }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <input
          type="text"
          id={label.toLowerCase().replace(/\s/g, '-') + '-color'}
          className="w-28 rounded-md border px-4 py-2 text-center text-sm shadow-sm"
          value={color}
          onChange={handleChange}
        />
        <button
          type="button"
          className="flex items-center gap-3 rounded-[4px] border px-2.5 py-2 text-sm text-gray-700 shadow-sm"
          onClick={() => setShowPicker(!showPicker)}
        >
          <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M9.23815 0.540268C9.86995 -0.0915475 10.8944 -0.0915475 11.5261 0.540268C12.1579 1.17208 12.1579 2.19645 11.5261 2.82826L10.5623 3.79211L10.9992 4.22901C11.1944 4.42426 11.1944 4.74086 10.9992 4.93611L9.94525 5.99001C9.8515 6.08381 9.7243 6.13646 9.5917 6.13646C9.4591 6.13646 9.3319 6.08381 9.23815 5.99001L9.03115 5.78301L4.16155 9.76726C3.6353 10.1978 2.86843 10.1596 2.38764 9.67876C1.90685 9.19796 1.86861 8.43111 2.29917 7.90486L6.2834 3.03526L6.0764 2.82826C5.8811 2.633 5.8811 2.31641 6.0764 2.12115L7.1303 1.06723C7.22405 0.973462 7.35125 0.920783 7.48385 0.920783C7.61645 0.920783 7.74365 0.973462 7.8374 1.06723L8.2743 1.50412L9.23815 0.540268ZM6.994 3.74589L5.5749 5.48036L7.26755 5.93391L8.3205 5.07241L6.994 3.74589Z"
              fill="#1A1A1A"
            />
            <path
              d="M2.02968 10.3985C2.13435 10.516 2.27373 10.6847 2.41375 10.8911C2.68514 11.2911 3 11.8923 3 12.5664C3 13.3949 2.32842 14.0664 1.5 14.0664C0.671575 14.0664 0 13.3949 0 12.5664C0 11.8923 0.314855 11.2911 0.586245 10.8911C0.72627 10.6847 0.86565 10.516 0.970325 10.3985C1.11423 10.2368 1.26373 10.0671 1.49855 10.0664H1.5H1.50145C1.73167 10.0671 1.88822 10.2396 2.02968 10.3985Z"
              fill="#1A1A1A"
            />
          </svg>
          Pick Color
        </button>
      </div>

      {showPicker && (
        <div className="absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2">
          <HexColorPicker color={color} onChange={setColor} />
        </div>
      )}
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
  primaryFont,
  setPrimaryFont,
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
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="primary-font" className="text-sm font-medium text-gray-700">
          Primary Font
        </label>

        <div className="flex items-center space-x-2 mt-3">
          <span className="rounded bg-gray-100 px-4 py-3 text-lg font-semibold">Aa</span>
          <input
            type="text"
            id="primary-font"
            className="w-40 rounded-md border px-4 py-2 text-sm shadow-sm"
            value={primaryFont}
            onChange={e => setPrimaryFont(e.target.value)}
          />
          <button type="button" className="text-sm text-gray-700 border px-4 py-2 rounded-sm shadow-sm" onClick={() => setPrimaryFont('Inter')}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandElementAssignment;
