import React from 'react';
import TextField from '../shared/small/TextField';
import { FiEye } from 'react-icons/fi';

function BankInfo({ data, updateField, index }) {
  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <h1 className="text-xl font-medium">Account Details</h1>
      <h5 className="text-textSecondary text-base">Provide Account information.</h5>
      <div className="mt-6 flex flex-col gap-4">
        <TextField label={'Routing Number'} />
        <TextField label={'Bank Name'} />
        <TextField label={'Account Holder Name'} />
        <TextField label={'Account Number'} rightIcon={<FiEye />} />
      </div>
    </div>
  );
}

export default BankInfo;
