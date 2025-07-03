import React, { useState } from 'react';
import TextField from '../shared/small/TextField';
import Button from '../shared/small/Button';

function ProcessingInfo({ name, handleNext, handlePrevious, currentStep, totalSteps, handleSubmit }) {
  const [form, setForm] = useState({
    monthlyAmount: '',
    processingValue: '',
    businessCategory: '',
  });
  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <h1 className="text-textPrimary text-xl font-medium">{name}</h1>
      <h5 className="text-textPrimary text-base">Provide average transactions</h5>
      <div className="mt-6 flex flex-col gap-4">
        <TextField
          label={'Monthly Amount ($)'}
          value={form.monthlyAmount}
          onChange={e => setForm({ ...form, monthlyAmount: e.target.value })}
        />
        <TextField
          label={'Processing Value ($)'}
          value={form.processingValue}
          onChange={e => setForm({ ...form, processingValue: e.target.value })}
        />
        <TextField
          label={'Business Category'}
          value={form.businessCategory}
          onChange={e => setForm({ ...form, businessCategory: e.target.value })}
        />
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

export default ProcessingInfo;
