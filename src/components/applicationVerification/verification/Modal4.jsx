import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import React from 'react';

function Modal4({ modal1Handle }) {
  return (
    <div>
      <h1 className="text-primary text-4xl font-extrabold">LOGO</h1>
      <div>
        <h3 className="text-xl font-medium">Confirm Your Information</h3>
        <h3 className="text-textSecondary text-base">
          Please review and correct your information if needed before proccing.
        </h3>
      </div>
      <div className="flex flex-col items-start justify-start">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="w-full">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <TextField label={'First Name'} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <TextField label={'Middle Name'} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <TextField label={'last Name'} />
            </div>
          </div>
        </div>
        <div className="w-full">
          <TextField label={'Email Address'} />
        </div>
        <div className="w-full">
          <h3 className="text-lg font-medium">Current Address</h3>
          <div className="w-full">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <TextField label={'Street Address'} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <TextField label={'Apt/Suite/Unit'} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <TextField label={'ZAP Code'} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <TextField label={'Country'} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <TextField label={'City'} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <TextField label={'State'} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Button onClick={modal1Handle} className="!text-base" label={'Continue'} />
      </div>
    </div>
  );
}

export default Modal4;
