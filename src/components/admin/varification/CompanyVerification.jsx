import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import React, { useState } from 'react';
import { IoShieldOutline } from 'react-icons/io5';
import { GoCheckCircle } from 'react-icons/go';
import { GoDatabase } from 'react-icons/go';
import DataTable from 'react-data-table-component';
import { useBranding } from '@/hooks/BrandingContext';
import { getVerificationTableStyles } from '@/data/data';
import { toast } from 'react-toastify';
import { useCompanyLookupMutation, useCompanyVerificationMutation } from '@/redux/apis/formApis';
import CustomLoading from '@/components/shared/small/CustomLoading';

const columns = [
  { name: 'Field', selector: row => row.name, sortable: true },
  { name: 'Result', selector: row => row.result },
  { name: 'Source', selector: row => row.source },
];

function CompanyVerification() {
  const [totalSearchStreatgies, setTotalSearchStreatgies] = useState(0);
  const [successfullyVerifiedStreatgies, setSuccessfullyVerifiedStreatgies] = useState(0);
  const [lookupDataForTable, setLookupDataForTable] = useState([]);
  const [form, setForm] = useState({ name: '', url: '' });
  const [apisRes, setApisRes] = useState({
    companyLookup: {},
    companyVerify: {},
  });
  const [verifyCompany, { isLoading: verifyCompanyLoading }] = useCompanyVerificationMutation();
  const [lookupCompany, { isLoading: lookupCompanyLoading }] = useCompanyLookupMutation();
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getVerificationTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const verifyCompanyAndLookup = async () => {
    if (!form?.name || !form?.url) return toast.error('Please fill all fields');
    try {
      const companyVerifyPromise = verifyCompany({ name: form?.name, url: form?.url }).unwrap();
      const lookupCompanyPromise = lookupCompany({ name: form?.name, url: form?.url }).unwrap();
      const [companyVerifyRes, lookupCompanyRes] = await Promise.all([companyVerifyPromise, lookupCompanyPromise]);
      if (companyVerifyRes?.success && lookupCompanyRes?.success) {
        setApisRes({ companyLookup: lookupCompanyRes?.data, companyVerify: companyVerifyRes?.data });
        // if (lookupCompanyRes?.lookupStatus === 'verified') {
        const lookupDataObj = lookupCompanyRes?.data?.lookupData;
        const totalStrEntries = Object.entries(lookupDataObj);
        const totalStr = totalStrEntries.filter(([key, _]) => key.includes('source'));
        const verifiedStr = totalStrEntries.filter(([key, _]) => !key.includes('source'));

        setTotalSearchStreatgies(totalStr?.length);
        // setAllSearchStreatgies(verifiedStr);
        setSuccessfullyVerifiedStreatgies(verifiedStr?.length);
        let totalLookupData = totalStr?.map(([key, value]) => {
          let nameObj = verifiedStr?.find(([k, v]) => key?.includes(k));
          if (value == 'Not found') return {};
          return {
            source: String(value).split(',')[0],
            name: nameObj?.[0],
            result: nameObj?.[1],
          };
        });
        totalLookupData = totalLookupData.filter(item => item.name !== undefined);
        setLookupDataForTable(totalLookupData);
        toast.success('Company verified successfully');
      }
    } catch (error) {
      console.log('Error verifying company:', error);
      toast.error(error?.data?.message || 'Failed to verify company');
    }
  };

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
          <TextField
            label={'Legal company name *'}
            className="w-full rounded px-2 text-sm"
            value={form.name}
            onChange={
              verifyCompanyLoading || lookupCompanyLoading ? () => {} : e => setForm({ ...form, name: e.target.value })
            }
          />
          <TextField
            label={'Website URL *'}
            className="w-full rounded px-2 text-sm"
            value={form.url}
            onChange={
              verifyCompanyLoading || lookupCompanyLoading ? () => {} : e => setForm({ ...form, url: e.target.value })
            }
          />
          {apisRes?.companyVerify?.confidenceScore &&
            apisRes?.companyVerify?.verificationStatus &&
            apisRes?.companyVerify?.originalCompanyName && (
              <div className="flex w-44 items-center gap-2 rounded-2xl border p-2 py-1">
                <div>
                  <GoCheckCircle className="font-medium text-blue-400" />
                </div>
                <div className="text-textPrimary text-xs">
                  {apisRes?.companyVerify?.originalCompanyName} {apisRes?.companyVerify?.verificationStatus} (
                  {apisRes?.companyVerify?.confidenceScore}%)
                </div>
              </div>
            )}

          <div className="mb-4 flex items-center space-x-2 px-2">
            <input type="checkbox" />
            <label className="text-textPrimary text-sm font-medium">This company has no website</label>
          </div>
          <div className="flex items-center justify-end">
            <Button
              label="Verify Company"
              onClick={verifyCompanyAndLookup}
              disabled={verifyCompanyLoading || lookupCompanyLoading}
              className={` ${(verifyCompanyLoading || lookupCompanyLoading) && 'cursor-not-allowed opacity-20'}`}
            />
          </div>
        </div>
      </div>
      {(verifyCompanyLoading || lookupCompanyLoading) && <CustomLoading />}
      {lookupDataForTable?.length && !(verifyCompanyLoading || lookupCompanyLoading) > 0 && (
        <div className="border-frameColor bg-backgroundColor w-full space-y-4 rounded-md border p-4">
          <div className="flex items-center gap-3">
            <div>
              <GoCheckCircle className="font-medium text-blue-400" />
            </div>
            <div className="text-textPrimary text-xl font-medium">Company Information Collected</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-textPrimary text-sm">
              Collection rate: {apisRes?.companyLookup?.collectionRate}% ({successfullyVerifiedStreatgies}/
              {totalSearchStreatgies} successful)
            </div>
            <div className="border-frameColor rounded-2xl border p-1 text-xs font-medium">
              {totalSearchStreatgies} strategies
            </div>
          </div>
          <div className="p-4">
            <DataTable
              title="Company Verification"
              columns={columns}
              data={lookupDataForTable}
              customStyles={tableStyles}
            />
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
      )}
    </div>
  );
}

export default CompanyVerification;
