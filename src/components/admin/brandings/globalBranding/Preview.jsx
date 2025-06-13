import React from 'react';

const Preview = ({ primaryColor, secondaryColor, accentColor, linkColor }) => {
  return (
    <div className="mb-6 p-6 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Preview</h2>
      <p className="text-gray-700 mb-4">
        This is how your form will appear with the selected branding. <span className="underline" style={{ color: linkColor }}>Link will use the link color.</span>
      </p>
      <div className="flex space-x-4">
        <button
          className="px-6 py-3 rounded-md text-white font-semibold"
          style={{ backgroundColor: primaryColor }}
        >
          Primary Button
        </button>
        <button
          className="px-6 py-3 rounded-md text-white font-semibold"
          style={{ backgroundColor: secondaryColor }}
        >
          Secondary Button
        </button>
        <button
          className="px-6 py-3 rounded-md text-white font-semibold"
          style={{ backgroundColor: accentColor }}
        >
          Accent Button
        </button>
      </div>
    </div>
  );
};

export default Preview; 