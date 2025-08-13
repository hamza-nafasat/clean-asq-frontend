import React from 'react';
import { useBranding } from '../../../../hooks/BrandingContext';
import { HiOutlineSparkles } from 'react-icons/hi';
import TextField from '@/components/shared/small/TextField';
import { BiColor } from 'react-icons/bi';
import { IoColorPaletteOutline } from 'react-icons/io5';

const ColorPalette = ({ colorPalette }) => {
  const {
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setTextColor,
    setLinkColor,
    setBackgroundColor,
    setFrameColor,
  } = useBranding();

  const neutralColors = [
    '#FFFFFF',
    '#F8F9FA',
    '#E9ECEF',
    '#DEE2E8',
    '#CED4DA',
    '#ADB5BD',
    '#6C757D',
    '#495057',
    '#343A40',
    '#212529',
  ];

  const handleNeutralColorClick = color => {
    setPrimaryColor(color);
  };

  return (
    <div className="mt-6 w-full">
      <div className="mb-4 flex items-center gap-1.5 text-[16px] font-medium text-gray-700 md:gap-3 md:text-xl">
        <IoColorPaletteOutline className="text-primary size-6" />
        Website / Image Color Palette
      </div>
      <div className="flex w-full flex-col justify-between gap-4">
        <div className="mt-6 grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-8 xl:grid-cols-10 xl:gap-10">
          {colorPalette?.map((color, index) => (
            <div
              key={index}
              className="flex w-full cursor-pointer flex-col items-center gap-2"
              onClick={() => handleNeutralColorClick(color)}
            >
              {/* Color box */}
              <div
                className="h-24 w-full rounded-md border shadow-sm"
                style={{ backgroundColor: color, borderColor: '#e0e0e0' }}
              ></div>

              {/* Color code below */}
              <div
                className="text-sm font-medium"
                style={{
                  color: parseInt(color.substring(1), 16) > 0xffffff / 2 ? '#000' : '#555',
                }}
              >
                {color}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-primary my-6 border-t-2"></div>

      <div className="mt-6 flex items-center gap-1.5 text-lg font-normal text-gray-500 md:gap-3">
        <BiColor className="text-primary size-6" />
        Neutral Color Options
      </div>
      <div className="mt-6 grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-8 xl:grid-cols-10 xl:gap-10">
        {neutralColors.map((color, index) => (
          <div
            key={index}
            className="flex w-full cursor-pointer flex-col items-center gap-2"
            onClick={() => handleNeutralColorClick(color)}
          >
            {/* Color box */}
            <div
              className="h-24 w-full rounded-md border shadow-sm"
              style={{ backgroundColor: color, borderColor: '#e0e0e0' }}
            ></div>

            {/* Color code below */}
            <div
              className="text-sm font-medium"
              style={{
                color: parseInt(color.substring(1), 16) > 0xffffff / 2 ? '#000' : '#555',
              }}
            >
              {color}
            </div>
          </div>
        ))}
      </div>
      <div className="border-primary my-6 border-t-2"></div>

      {/* Assign Brand Element section */}
      <div className="mt-12 flex items-center space-x-6">
        <div className="flex items-center gap-3 text-gray-600">
          <BiColor className="text-primary size-6" />
          Assign Brand Element
        </div>
        <button className="flex items-center gap-2 rounded-sm bg-[#F5F5F5] px-3 py-2 text-gray-700">
          <HiOutlineSparkles /> AI Help
        </button>
      </div>
    </div>
  );
};

export default ColorPalette;
