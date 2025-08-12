import Button from '@/components/shared/small/Button';
import Checkbox from '@/components/shared/small/Checkbox';
import { useGetMyAllFormsQuery } from '@/redux/apis/formApis';
import React from 'react';
// import Checkbox from '@/components/shared/Checkbox';

function ApplyBranding({ selectedId, setSelectedId }) {
  const [onForm, setOnForm] = React.useState(false);
  const [onHome, setOnHome] = React.useState(false);
  const [onBoth, setOnBoth] = React.useState(false);

  const { data } = useGetMyAllFormsQuery();

  const selectAllHandler = () => {
    setOnForm(true);
    setOnHome(true);
    setOnBoth(true);
  };

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
            {data?.data?.map((option, index) => (
              <option key={index} value={option?._id}>
                {option?.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Checkbox label="On Form" onChange={e => setOnForm(e.target.checked)} value={onForm} checked={onForm} />
        </div>
        <div>
          <Checkbox label="on Home" onChange={e => setOnHome(e.target.checked)} value={onHome} checked={onHome} />
        </div>
        <div>
          <Checkbox label="On Both" onChange={e => setOnBoth(e.target.checked)} value={onBoth} checked={onBoth} />
        </div>
      </div>
      <div className="mt-7">
        <Button
          label={'select All'}
          onClick={selectAllHandler}
          className="!text-textPrimary !border-secondary !bg-white"
        />
      </div>
    </div>
  );
}

export default ApplyBranding;
