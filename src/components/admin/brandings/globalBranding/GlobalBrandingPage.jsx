import React from 'react';
import BrandingSource from './BrandingSource';
import ColorPalette from './ColorPalette';
import BrandElementAssignment from './BrandElementAssignment';
import Preview from './Preview';
import { useBranding } from './BrandingContext';

const GlobalBrandingPage = () => {
  const {
    primaryColor, setPrimaryColor,
    secondaryColor, setSecondaryColor,
    accentColor, setAccentColor,
    textColor, setTextColor,
    linkColor, setLinkColor,
    backgroundColor, setBackgroundColor,
    frameColor, setFrameColor,
    primaryFont, setPrimaryFont,
  } = useBranding();

  const handleApplyBranding = () => {
    // In a real application, you might send this data to a backend or apply it globally
    console.log('Branding changes applied and saved to local storage.');
    alert('Branding Applied!');
  };

  const handleCancel = () => {
    // In a real application, you might revert to previous state or clear form
    console.log('Branding changes cancelled.');
    alert('Branding Cancelled!');
  };

  return (
    <div className="border border-[#F0F0F0] rounded-[8px] bg-white px-6 mb-6 ">
      <h1 className="text-2xl font-semibold text-gray-500 mt-12">Global Branding</h1>
      <div className=" mt-12">
        <BrandingSource />
        <ColorPalette />
        <BrandElementAssignment
          primaryColor={primaryColor}
          setPrimaryColor={setPrimaryColor}
          secondaryColor={secondaryColor}
          setSecondaryColor={setSecondaryColor}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          textColor={textColor}
          setTextColor={setTextColor}
          linkColor={linkColor}
          setLinkColor={setLinkColor}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          frameColor={frameColor}
          setFrameColor={setFrameColor}
          primaryFont={primaryFont}
          setPrimaryFont={setPrimaryFont}
        />
        <Preview
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          linkColor={linkColor}
        />

        <div className="flex justify-end space-x-4 mt-6">
          <button
            className="px-6 py-3 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="px-6 py-3 rounded-md bg-teal-500 text-white hover:bg-teal-600"
            onClick={handleApplyBranding}
          >
            Apply Branding
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalBrandingPage; 