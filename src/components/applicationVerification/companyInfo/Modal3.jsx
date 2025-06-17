import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import React from 'react';

function Modal3({ modal1Handle }) {
  return (
    <div className="m-2 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-primary text-4xl font-extrabold">LOGO</h1>
        <h2 className="text-textPrimary text-xl font-medium">Confirm Your Information</h2>
        <h5 className="text-textPrimary text-base">Please enter your company information</h5>
      </div>
      <div className="flex w-full flex-col gap-4">
        <h1 className="text-textPrimary text-lg font-medium">Legal Entity Type</h1>
        <TextField label={'Street Address'} />
        <TextField label={'Apt/Suite/Unit'} />
        <TextField label={'ZIP code'} />
        <TextField label={'Country'} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField label={'City'} />
          <TextField label={'State'} />
        </div>
        <TextField label={'Company Phone'} />
      </div>
      <div className="mt-6 flex w-full justify-end gap-4">
        <Button label={'Back'} variant="secondary" />
        <Button label={'Next'} onClick={modal1Handle} />
      </div>
    </div>
  );
}

export default Modal3;
