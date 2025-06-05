import React, { useState } from 'react';
import { MdVerifiedUser } from 'react-icons/md';
import TextField from '../shared/small/TextField';
import Button from '../shared/small/Button';

function PlaceHolder({ data, updateField, index }) {
  const [tab, setTab] = useState('Type Signature');
  return (
    <div>
      <h1 className="text-[24px] font-semibold text-[var(--dark-gray)]">1-Application Verification</h1>
      <div className="mt-8">
        <h2 className="flex w-full justify-center gap-2 rounded-[4px] bg-[var(--primary)] py-3.5 text-center text-[20px] font-semibold text-white">
          <img src="/src/assets/images/Ð¨Ð°Ñ€_1.png" alt="" /> ID Verification Completed
        </h2>
      </div>
      <div className="mt-3 rounded-sm border border-[#F0F0F0] bg-white p-3">
        <h2 className="text-[22px] font-medium text-[#1A1A1A]">Confirm Your Information</h2>
        <p className="text-base text-[var(--light-gray)]">
          Please review and correct your information if needed before proccing.
        </p>
        <div className="mt-4">
          <h3 className="flex items-center gap-4 text-[18px] font-medium text-[#1A1A1A]">
            Personal Information{' '}
            <span className="flex items-center gap-1 text-[#34C759]">
              <MdVerifiedUser />
              Verified
            </span>
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <TextField label={'First Name'} />
            <TextField label={'Middle Name'} />
            <TextField label={'Last Name'} />
            <div className="lg:col-span-3">
              <TextField type={'email'} label={'Email Address'} />
            </div>
          </div>
        </div>
        <div className="mt-5">
          <h3 className="flex items-center gap-4 text-[18px] font-medium text-[#1A1A1A]">
            Current Address
            <span className="flex items-center gap-1 text-[#34C759]">
              <MdVerifiedUser />
              Verified
            </span>
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label={'Street Address'} />
            <TextField label={'Apt/Suite/Unit'} />
            <TextField label={'ZAP Code'} />
            <TextField label={'Country'} />
            <TextField label={'City'} />
            <TextField label={'State'} />
          </div>
        </div>
        <div className="mt-5">
          <h2 className="text-[22px] font-medium text-[#1A1A1A]">Additional Information</h2>
          <p className="text-base text-[var(--light-gray)]">
            Please provide the following additional information to complete your profile.
          </p>
        </div>
        <div className="mt-5">
          <h3 className="text-[18px] font-medium text-[#1A1A1A]">Personal Information</h3>
          <div className="mt-2">
            <TextField label={'Job Title'} />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          <p className="text-[14px] text-[#1A1A1A]">
            Your Signature<span className="text-[#CE2D2D]">*</span>
          </p>
          <p className="text-[14px] text-[#1A1A1A]">
            By signing here you attest that you are authorized to bind the contractual agreement.
          </p>
          <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
            {['Draw Signature', 'Type Signature'].map((item, i) => (
              <Button
                key={i}
                label={item}
                className={`${tab === item ? '' : '!border-transparent !bg-[#F6F6F6] !text-[var(--textLight)] hover:!bg-gray-200'}`}
                onClick={() => setTab(item)}
              />
            ))}
          </div>
          {tab === 'Draw Signature' && <div>Draw</div>}
          {tab === 'Type Signature' && <div>Type</div>}
        </div>
      </div>
    </div>
  );
}

export default PlaceHolder;
