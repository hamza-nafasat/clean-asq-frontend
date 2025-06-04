import Button from '@/components/shared/small/Button';
import React from 'react';

function Modal5({ modal1Handle, closeBusinessClassificationHandel }) {
  return (
    <div>
      <h1 className="text-base font-medium">Business Classification</h1>
      <h1 className="text-textSecondary text-base">
        Select a business classification that best describe your company.
      </h1>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-lg border px-4 py-2 focus:ring-1 focus:ring-[#5570F1]">
          <div>
            <h2 className="text-base font-semibold">
              Technology specializes in crafting bespoke web solutions, integrating lot and smart automation to elevate
              industrial digital experiences.
            </h2>
          </div>
          <div>
            <h5 className="text-textSecondary text-base">
              Focuses on the integration of web solutions with IoT and automation for industrial clients.
            </h5>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border px-4 py-2 focus:ring-1 focus:ring-[#5570F1]">
          <div>
            <h2 className="text-base font-semibold">
              Technology specializes in crafting bespoke web solutions, integrating lot and smart automation to elevate
              industrial digital experiences.
            </h2>
          </div>
          <div>
            <h5 className="text-textSecondary text-base">
              Focuses on the integration of web solutions with IoT and automation for industrial clients.
            </h5>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border px-4 py-2 focus:ring-1 focus:ring-[#5570F1]">
          <div>
            <h2 className="text-base font-semibold">
              Technology specializes in crafting bespoke web solutions, integrating lot and smart automation to elevate
              industrial digital experiences.
            </h2>
          </div>
          <div>
            <h5 className="text-textSecondary text-base">
              Focuses on the integration of web solutions with IoT and automation for industrial clients.
            </h5>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          onClick={closeBusinessClassificationHandel}
          label={'Cancel'}
          className="!bg-textLight !border-none hover:!bg-gray-400"
        />
      </div>
    </div>
  );
}

export default Modal5;
