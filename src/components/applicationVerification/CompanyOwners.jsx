import React, { useState } from 'react';
import OwnerInformation from './verification/OwnerInformation';
import OwnerViewInfo from './verification/OwnerViewInfo';

function CompanyOwners({ data, updateField, index }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div className="h-full overflow-auto">
      <h3 className="text-textPrimary text-[24px] font-semibold">3-Company Owners</h3>
      <div className="mt-5">
        {showInfo === false && <OwnerInformation showInfo={showInfo} setShowInfo={setShowInfo} />}
        {showInfo === true && <OwnerViewInfo />}
      </div>
    </div>
  );
}

export default CompanyOwners;
