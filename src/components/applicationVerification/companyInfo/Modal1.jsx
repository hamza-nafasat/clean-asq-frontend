import { Ai } from '@/assets/svgs/icon';
import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import React from 'react';

function Modal1({ modal1Handle, openBusinessDescriptionHandel, openBusinessClassificationHandel }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-primary text-4xl font-extrabold">LOGO</h1>
        <h2 className="text-textPrimary text-xl font-medium">Confirm Your Information</h2>
        <h5 className="text-textPrimary text-base">Please enter your company information</h5>
      </div>
      <div className="my-5 flex w-full flex-col items-start">
        <h1 className="text-textPrimary text-xl font-medium">Basic Information</h1>
        <div className="mt-6 flex w-full flex-col gap-4">
          <TextField label={'Website URL'} />
          <TextField label={'Legal Company Name'} />
          <TextField label={'DBA Name'} />
        </div>
        <div className="w-full">
          <div className="w-full">
            <div className="mt-6 flex w-full justify-end">
              <Button
                label={'AI Help'}
                onClick={openBusinessDescriptionHandel}
                icon={Ai}
                className="!border-none !bg-[#F5F5F5] !text-[#1A1A1A] hover:!bg-gray-500"
              />
            </div>
            <TextField label={'Business Description'} />
          </div>
        </div>
        <div className="w-full">
          <div className="w-full">
            <div className="mt-6 flex w-full justify-end">
              <Button
                label={'AI Help'}
                onClick={openBusinessClassificationHandel}
                icon={Ai}
                className="!border-none !bg-[#F5F5F5] !text-[#1A1A1A] hover:!bg-gray-500"
              />
            </div>
            <TextField label={'Business Classification'} />
          </div>
        </div>
      </div>
      <Button onClick={modal1Handle} label={'Next'} />
    </div>
  );
}

export default Modal1;
