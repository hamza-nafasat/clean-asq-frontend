import Button from '@/components/shared/small/Button';
import Checkbox from '@/components/shared/small/Checkbox';
import React from 'react';
// import Checkbox from '@/components/shared/Checkbox';

function ApplyBranding() {
  return (
    <div>
      <div className="text-textPrimary text-base">Select where you want to apply this branding:</div>
      <div className="mt-2 flex flex-col gap-4">
        <div>
          <Checkbox label="Remember me" />
        </div>
        <div>
          <Checkbox label="Remember me" />
        </div>
        <div>
          <Checkbox label="Remember me" />
        </div>
      </div>
      <div className="mt-7">
        <Button label={'select All'} className="!text-textPrimary !border-secondary !bg-white" />
      </div>
    </div>
  );
}

export default ApplyBranding;
