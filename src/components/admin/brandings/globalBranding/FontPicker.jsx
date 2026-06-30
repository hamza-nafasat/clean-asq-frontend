import React from 'react';

const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'open-sans', label: 'Open Sans' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'lato', label: 'Lato' },
  { value: 'source-sans', label: 'Source Sans Pro' },
  { value: 'nunito', label: 'Nunito' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'merriweather', label: 'Merriweather' },
  { value: 'alex-brush', label: 'Alex Brush' },
  { value: 'raleway', label: 'Raleway' },
  { value: 'ubuntu', label: 'Ubuntu' },
  { value: 'oswald', label: 'Oswald' },
  { value: 'roboto-slab', label: 'Roboto Slab' },
  { value: 'pt-sans', label: 'PT Sans' },
  { value: 'noto-sans', label: 'Noto Sans' },
  { value: 'work-sans', label: 'Work Sans' },
  { value: 'quicksand', label: 'Quicksand' },
  { value: 'rubik', label: 'Rubik' },
  { value: 'mulish', label: 'Mulish' },
  { value: 'josefin-sans', label: 'Josefin Sans' },
  { value: 'dm-sans', label: 'DM Sans' },
  { value: 'manrope', label: 'Manrope' },
  { value: 'plus-jakarta-sans', label: 'Plus Jakarta Sans' },
  { value: 'figtree', label: 'Figtree' },
  { value: 'space-grotesk', label: 'Space Grotesk' },
  { value: 'sora', label: 'Sora' },
  { value: 'general-sans', label: 'General Sans' },
  { value: 'cabinet-grotesk', label: 'Cabinet Grotesk' },
  { value: 'clash-display', label: 'Clash Display' },
  { value: 'clash-grotesk', label: 'Clash Grotesk' },
  { value: 'satoshi', label: 'Satoshi' },
  { value: 'switzer', label: 'Switzer' },
  { value: 'chillax', label: 'Chillax' },
  { value: 'ranade', label: 'Ranade' },
  { value: 'zodiak', label: 'Zodiak' },
  { value: 'gambarino', label: 'Gambarino' },
  { value: 'sentient', label: 'Sentient' },
  { value: 'author', label: 'Author' },
  { value: 'panchang', label: 'Panchang' },
  { value: 'melodrama', label: 'Melodrama' },
  { value: 'boska', label: 'Boska' },
];

const FontPicker = ({ value, onChange }) => {
  return (
    <div className="space-y-2 rounded-sm border p-1 shadow">
      {/* <label className="block text-sm font-medium text-gray-700">
        Global Font Family
      </label> */}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="focus:ring-primary focus:border-primary mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:outline-none sm:text-sm"
      >
        {FONT_OPTIONS.map(font => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>
      {/* <p className="mt-1 text-sm text-gray-500">The selected font will be applied globally to your application.</p> */}
    </div>
  );
};

export default FontPicker;
