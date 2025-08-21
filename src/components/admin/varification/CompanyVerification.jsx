import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import React, { useState } from 'react';
import { IoShieldOutline } from 'react-icons/io5';
import { GoCheckCircle } from 'react-icons/go';
import { GoDatabase } from 'react-icons/go';
import DataTable from 'react-data-table-component';
import { useBranding } from '@/hooks/BrandingContext';
import { getTableStyles, getVerificationTableStyles } from '@/data/data';

function CompanyVerification() {
  const [verify, setVerify] = useState(false);
  console.log('verify', verify);

  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getVerificationTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const columns = [
    { name: 'Field', selector: row => row.field, sortable: true },
    { name: 'Result', selector: row => row.result },
    { name: 'Source', selector: row => row.source },
  ];

  const data = [
    { field: 'Company Name', result: 'OpenAI Ltd.', source: 'Database' },
    { field: 'Status', result: 'Verified', source: 'API' },
  ];
  return (
    <div className="flex flex-col space-y-8">
      <div className="border-frameColor bg-backgroundColor w-full rounded-md border p-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div>
              <IoShieldOutline className="font-medium text-blue-400" />
            </div>
            <div className="text-textPrimary text-xl font-medium">Company Verification</div>
          </div>
          <div className="text-textPrimary text-xs">Verify that a company name and website URL belong together</div>
        </div>
        <div className="flex flex-col space-y-4">
          <TextField label={'Legal company name *'} className="w-full rounded px-2 text-sm" />
          <TextField label={'Website URL *'} className="w-full rounded px-2 text-sm" />
          {verify && (
            <div className="flex w-44 items-center gap-2 rounded-2xl border p-2 py-1">
              <div>
                <GoCheckCircle className="font-medium text-blue-400" />
              </div>
              <div className="text-textPrimary text-xs">Google Verified (95%)</div>
            </div>
          )}

          <div className="mb-4 flex items-center space-x-2 px-2">
            <input type="checkbox" />
            <label className="text-textPrimary text-sm font-medium">This company has no website</label>
          </div>
          <div className="flex items-center justify-end">
            <Button label="Verify Company" onClick={() => setVerify(prev => !prev)} />
          </div>
        </div>
      </div>
      {verify && (
        <div className="border-frameColor bg-backgroundColor flex w-full items-center justify-between rounded-md border p-4">
          <div className="flex items-center gap-2">
            <div>
              <GoCheckCircle className="font-medium text-blue-400" />
            </div>
            <div className="text-textPrimary text-xl font-medium">Company Verification</div>
          </div>
          <div>
            <Button label={'Start Over'} />
          </div>
        </div>
      )}
      <div className="border-frameColor bg-backgroundColor w-full space-y-4 rounded-md border p-4">
        <div className="flex items-center gap-3">
          <div>
            <GoCheckCircle className="font-medium text-blue-400" />
          </div>
          <div className="text-textPrimary text-xl font-medium">Company Information Collected</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-textPrimary text-sm">Collection rate: 95% (1/2 successful)</div>
          <div className="border-frameColor rounded-2xl border p-1 text-xs font-medium">2 strategies</div>
        </div>
        <div className="p-4">
          <DataTable title="Company Verification" columns={columns} data={data} customStyles={tableStyles} />
        </div>
        <div className="border"></div>
        <div className="flex items-center justify-between">
          <div className="text-textPrimary flex items-center gap-3">
            <div>
              <GoDatabase />
            </div>
            <div className="text-xs">Complete traceability: 2 search strategies attempted with full results</div>
          </div>
          <div>
            <div>
              <Button label={'Start Over'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyVerification;
