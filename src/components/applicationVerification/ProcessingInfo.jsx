import React from 'react';
import TextField from '../shared/small/TextField';
import { FiSearch, FiEye } from 'react-icons/fi';
function ProcessingInfo({ data, updateField, index }) {
  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <h1 className="text-xl font-medium">Average Transaction</h1>
      <h5 className="text-textSecondary text-base">Provide average trancation</h5>
      <div className="mt-6 flex flex-col gap-4">
        <TextField label={'Monthly Amount ($)'} />
        <TextField label={'Processing Value ($)'} />
        <TextField label={'Business Category'} />
      </div>
    </div>
  );
}

export default ProcessingInfo;
