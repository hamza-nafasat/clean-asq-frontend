import TextField from '@/components/shared/small/TextField';
import React from 'react';
import { MdVerifiedUser } from 'react-icons/md';

function OwnerViewInfo() {
  return (
    <>
      <div>
        <h3 className="text-textPrimary flex items-center gap-4 font-medium sm:text-[18px]">
          Beneficial Owner Information
          <span className="flex items-center gap-1 text-[#34C759]">
            <MdVerifiedUser />
            Verified
          </span>
        </h3>
        <div className="mt-3 grid gap-6 sm:grid-cols-2">
          <TextField label={'Name (Me)'} />
          <TextField label={'Email Address'} />
          <TextField label={'Social Security Number'} />
          <TextField label={'Your Ownership Percentage?'} />
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-textPrimary flex items-center gap-4 font-medium sm:text-[18px]">
          Other Owner Information
          <span className="flex items-center gap-1 text-[#34C759]">
            <MdVerifiedUser />
            Verified
          </span>
        </h3>
        <div className="mt-3 grid gap-6 sm:grid-cols-2">
          <TextField label={'Name'} />
          <TextField label={'Email Address'} />
          <TextField label={'Social Security Number'} />
          <TextField label={'Your Ownership Percentage?'} />
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-textPrimary flex items-center gap-4 font-medium sm:text-[18px]">
          Other Owner Information
          <span className="flex items-center gap-1 text-[#FF3B30]">
            <MdVerifiedUser />
            Unverified
          </span>
        </h3>
        <div className="mt-3 grid gap-6 sm:grid-cols-2">
          <TextField label={'Name'} />
          <TextField label={'Email Address'} />
          <TextField label={'Social Security Number'} />
          <TextField label={'Your Ownership Percentage?'} />
        </div>
      </div>
    </>
  );
}

export default OwnerViewInfo;
