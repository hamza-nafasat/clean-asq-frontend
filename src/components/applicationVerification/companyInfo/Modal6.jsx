import TextField from '@/components/shared/small/TextField';
import React, { useState } from 'react';

function Modal6() {
  const [showInput, setShowInput] = useState(false);
  return (
    <>
      <p className="text-textPrimary text-center text-2xl font-medium">Customization</p>
      <p className="text-center text-base font-normal">Customize your section for applicants</p>
      <div className="flex flex-col gap-4 border-b border-dashed border-[#818181] pb-2">
        <h2 className="text-textPrimary text-[18px] font-medium">Basic Information</h2>
        <div className="flex flex-col gap-3">
          <TextField cn={''} label={'Website URL Title ( Replace with )'} />
          <div className="flex flex-col gap-1 rounded-md bg-[#E9ECF8E5] p-3">
            <h3 className="text-textPrimary text-[14px] font-normal">Add Place Holder</h3>
            <input
              className="text-textSecondary rounded-lg border-none text-base font-normal focus:outline-0"
              placeholder="Enter your Website URL .e.g,"
            />
          </div>
          <div className="flex gap-5">
            <div className="flex gap-2">
              <input
                type="radio"
                id="add-web-description"
                name="web-description"
                onChange={() => {
                  setShowInput(!showInput);
                }}
              />
              <label htmlFor="add-web-description">Add description</label>
            </div>
            <div className="flex gap-2">
              <input
                type="radio"
                id="web-n/a"
                name="web-description"
                onChange={() => {
                  setShowInput(false);
                }}
              />
              <label htmlFor="web-n/a">N/A</label>
            </div>
          </div>
          {showInput && <TextField placeholder="Enter description" />}
          <p className="text-textPrimary text-[14px] font-medium">ADD AI Option</p>
          <div className="flex gap-5">
            <div className="flex gap-2">
              <input type="radio" id="web-yes" name="web-ai" />
              <label htmlFor="web-yes">Yes</label>
            </div>
            <div className="flex gap-2">
              <input type="radio" id="web-no" name="web-ai" />
              <label htmlFor="web-no">No</label>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <TextField label={'Business Name Title ( Replace with )'} />
          <div className="flex flex-col gap-1 bg-[#E9ECF8E5] p-4">
            <h3 className="text-textPrimary text-[14px] font-normal">Add Place Holder</h3>
            <input
              className="text-textSecondary rounded-lg border-none text-base font-normal focus:outline-0"
              placeholder="Enter your Website URL .e.g,"
            />
          </div>
          <div className="flex gap-5">
            <div className="flex gap-2">
              <input
                type="radio"
                id="add-business-description"
                name="business-description"
                onChange={() => {
                  setShowInput(!showInput);
                }}
              />
              <label htmlFor="add-business-description">Add description</label>
            </div>
            <div className="flex gap-2">
              <input
                type="radio"
                id="business-n/a"
                name="business-description"
                onChange={() => {
                  setShowInput(false);
                }}
              />
              <label htmlFor="business-n/a">N/A</label>
            </div>
          </div>
          {showInput && <TextField placeholder="Enter description" />}
          <p className="text-textPrimary text-[14px] font-medium">ADD AI Option</p>
          <div className="flex gap-5">
            <div className="flex gap-2">
              <input type="radio" id="business-yes" name="business-ai" />
              <label htmlFor="business-yes">Yes</label>
            </div>
            <div className="flex gap-2">
              <input type="radio" id="business-no" name="business-ai" />
              <label htmlFor="business-no">No</label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal6;
