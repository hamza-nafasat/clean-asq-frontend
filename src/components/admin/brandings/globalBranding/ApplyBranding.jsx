import Button from '@/components/shared/small/Button';
import Checkbox from '@/components/shared/small/Checkbox';
import { useGetMyAllFormsQuery } from '@/redux/apis/formApis';
import React from 'react';
// import Checkbox from '@/components/shared/Checkbox';

function ApplyBranding({ selectedId, setSelectedId, onHome, setOnHome, brandings }) {
  const { data } = useGetMyAllFormsQuery();

  return (
    <div>
      <div className="text-textPrimary text-base">Select where you want to apply this branding:</div>
      <div className="mt-2 flex flex-col gap-4">
        <div className={`flex w-full flex-col items-start`}>
          <h4 className="text-textPrimary text-base font-medium lg:text-lg">Select Form</h4>
          <select
            required
            value={selectedId}
            className="border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base"
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">{'Choose an option'}</option>
            {Array.isArray(brandings)
              ? brandings?.map((option, index) => (
                  <option key={index} value={option?._id}>
                    {option?.name?.length > 35 ? `${option?.name?.slice(0, 35)}...` : option?.name}
                  </option>
                ))
              : Array.isArray(data?.data)
                ? data?.data?.map((option, index) => (
                    <option key={index} value={option?._id}>
                      {option?.name}
                    </option>
                  ))
                : null}
          </select>
        </div>
        {!brandings && (
          <div>
            <Checkbox label="on Home" onChange={e => setOnHome(e.target.checked)} value={onHome} checked={onHome} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplyBranding;
