import React from 'react';
import verify from '../../../assets/images/verify.png';
import TextField from '@/components/shared/small/TextField';
import Button from '@/components/shared/small/Button';

function Modal2() {
  return (
    <div className="m-3 flex flex-col items-center justify-center">
      <div>
        <img src={verify} alt="verify" className="h-[141px] w-[124px]" />
      </div>
      <div className="mt-6">
        <h1 className="text-textPrimary mt-2 text-xl font-medium">Business Email</h1>
        <h1 className="text-textSecondary text-base">Please provide your work email address.</h1>
      </div>
      <div className="flex w-full gap-4">
        <div className="flex w-full items-center">
          <TextField label={'Working Email Address'} type="email" />
        </div>
        <div className="flex items-end">
          <Button className="h-[48px] w-[140px]" label={'Submit'} />
        </div>
      </div>
    </div>
  );
}

export default Modal2;
