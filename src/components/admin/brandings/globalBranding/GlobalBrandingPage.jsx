import React from 'react';
import BrandingSource from './BrandingSource';
import ColorPalette from './ColorPalette';
import BrandElementAssignment from './BrandElementAssignment';
import Preview from './Preview';
import { useBranding } from './BrandingContext';
import TextField from '@/components/shared/small/TextField';
import Button from '@/components/shared/small/Button';

const GlobalBrandingPage = () => {
  const {
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
    <div className="mb-6 rounded-[8px] border border-[#F0F0F0] bg-white px-3 md:px-6">
      <h1 className="mt-12 text-lg font-semibold text-gray-500 md:text-2xl">Global Branding</h1>
      <div className="mt-12">
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
        {/* <div>
          <h1 className="bg-accent">main heading</h1>
          <h1 className="bg-backgroundColor"> background colore</h1>

          <input className="border-frameColor text-frameColor border" placeholder="hallo"></input>
        </div> */}
        <input type="color"></input>
        <Preview
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          linkColor={linkColor}
        />

        <div className="mt-6 mb-4 flex justify-between space-x-2 md:space-x-4">
          <button
            className="rounded-md bg-teal-500 px-3 py-2 text-white hover:bg-gray-400 md:px-6 md:py-3"
            onClick={handleCancel}
          >
            skip
          </button>
          <div className="flex gap-2 md:gap-6">
            <Button variant="secondary" label={'Cancel'} onClick={handleCancel} />
            <Button label={'Apply Branding'} onClick={handleApplyBranding} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalBrandingPage;
