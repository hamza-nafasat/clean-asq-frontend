import Button from '@/components/shared/small/Button';
import React from 'react';

function ApplyBranding() {
  return (
    <div>
      <div className="text-textPrimary text-base">Select where you want to apply this branding:</div>
      <div className="mt-2 flex flex-col gap-4">
        <div>
          <label className="text-textPrimary flex items-center text-sm">
            <input type="checkbox" className="text-textPrimary accent-primary mr-2" /> Remember me
          </label>
        </div>
        <div>
          <label className="text-textPrimary flex items-center text-sm">
            <input type="checkbox" className="text-textPrimary accent-primary mr-2" /> Remember me
          </label>
        </div>
        <div>
          <label className="text-textPrimary flex items-center text-sm">
            <input type="checkbox" className="text-textPrimary accent-primary mr-2" /> Remember me
          </label>
        </div>
      </div>
      <div className="mt-7">
        <Button label={'select All'} className="!text-textPrimary !border-secondary !bg-white" />
      </div>
    </div>
  );
}

export default ApplyBranding;
