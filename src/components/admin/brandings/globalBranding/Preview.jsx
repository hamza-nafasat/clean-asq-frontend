import React from 'react';

const Preview = ({ primaryColor, secondaryColor, accentColor, linkColor }) => {
  return (
    <div className="mt-6 rounded-[8px] border border-[#F0F0F0] p-3 shadow-sm md:p-6">
      <h2 className="text-textPrimary text-[18px] font-medium">Preview</h2>
      <div className="mt-5 rounded-md border p-3 md:p-6">
        <p className="text-textPrimary mb-2 text-[22px] font-medium">Company Name</p>

        <div className="">
          <label className="mr-2 text-[14px] font-normal text-gray-500 uppercase">URL:</label>
          <input
            type="text"
            value="https://company.apply-secure.com"
            editable
            className="rounded border border-[#A7A7A7] bg-white px-3 py-1 text-sm text-gray-700"
          />
        </div>

        <p className="font-inter mt-6 text-[16px] font-normal text-gray-700">
          This is how your form will appear with the selected branding.{' '}
          <a href="#" className="underline" style={{ color: linkColor }}>
            Link will use the link color.
          </a>
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            className="rounded px-3 py-2 text-sm font-normal text-white md:px-5 md:py-4"
            style={{ backgroundColor: primaryColor }}
          >
            Primary Button
          </button>
          <button
            className="rounded px-3 py-2 text-sm font-normal text-white md:px-5 md:py-4"
            style={{ backgroundColor: secondaryColor }}
          >
            Secondary Button
          </button>
          <button
            className="rounded px-3 py-2 text-sm font-normal text-white md:px-5 md:py-4"
            style={{ backgroundColor: accentColor }}
          >
            Accent Button
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preview;
