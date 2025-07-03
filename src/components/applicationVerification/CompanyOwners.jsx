import React, { useState } from 'react';
import OwnerInformation from './companyOwner/OwnerInformation';
import OwnerViewInfo from './companyOwner/OwnerViewInfo';
import Button from '../shared/small/Button';

function CompanyOwners({ name, handleNext, handlePrevious, currentStep, totalSteps, handleSubmit }) {
  const [showInfo, setShowInfo] = useState(false);
  const [form, setForm] = useState({
    mainOwnerOwn25OrMore: '',
    yourPercentage: 100,
    yourSsn: '',
    otherOwnersOwn25OrMore: '',
    otherOwnerPercentage: 100,
    otherOwnerSsn: '',
  });

  return (
    <div className="h-full overflow-auto">
      <h3 className="text-textPrimary text-[24px] font-semibold">{name}</h3>
      <div className="mt-5">
        {showInfo === false && (
          <OwnerInformation form={form} setForm={setForm} showInfo={showInfo} setShowInfo={setShowInfo} />
        )}
        {showInfo === true && <OwnerViewInfo />}
      </div>
      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button label={'Next'} onClick={() => handleNext({ data: form, name })} />
          ) : (
            <Button label={'Submit'} onClick={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyOwners;
