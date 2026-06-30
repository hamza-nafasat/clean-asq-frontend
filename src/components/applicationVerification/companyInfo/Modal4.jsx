import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import React from 'react';

function Modal4({ modal1Handle, closeBusinessDescriptionHandel }) {
  return (
    <div>
      <h1 className="text-textPrimary text-base font-medium">Business Description Suggestions</h1>
      <h1 className="text-textPrimary text-base">
        Select a business description that best describe your company, or enter a custom prompt below to generate new
        options.
      </h1>
      <div className="mt-6 w-full">
        <h6 className="text-textPrimary">Custom Prompt (optional)</h6>
        <div className="flex gap-4">
          <TextField />
          <Button label={'Generate'} />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-lg border px-4 py-2 focus:ring-1 focus:ring-[#5570F1]">
          <div>
            <h2 className="text-textPrimary text-base font-semibold">
              Technology specializes in crafting bespoke web solutions, integrating lot and smart automation to elevate
              industrial digital experiences.
            </h2>
          </div>
          <div>
            <h5 className="text-textPrimary text-base">
              Focuses on the integration of web solutions with IoT and automation for industrial clients.
            </h5>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border px-4 py-2 focus:ring-1 focus:ring-[#5570F1]">
          <div>
            <h2 className="text-textPrimary text-base font-semibold">
              Technology specializes in crafting bespoke web solutions, integrating lot and smart automation to elevate
              industrial digital experiences.
            </h2>
          </div>
          <div>
            <h5 className="text-textPrimary text-base">
              Focuses on the integration of web solutions with IoT and automation for industrial clients.
            </h5>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border px-4 py-2 focus:ring-1 focus:ring-[#5570F1]">
          <div>
            <h2 className="text-textPrimary text-base font-semibold">
              Technology specializes in crafting bespoke web solutions, integrating lot and smart automation to elevate
              industrial digital experiences.
            </h2>
          </div>
          <div>
            <h5 className="text-textPrimary text-base">
              Focuses on the integration of web solutions with IoT and automation for industrial clients.
            </h5>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          onClick={closeBusinessDescriptionHandel}
          label={'Cancel'}
          className="!bg-textLight !border-none hover:!bg-gray-400"
        />
      </div>
    </div>
  );
}

export default Modal4;
