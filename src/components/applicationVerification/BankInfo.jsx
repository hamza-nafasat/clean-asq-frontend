import React, { useState } from 'react';
import TextField from '../shared/small/TextField';
import { FiEye } from 'react-icons/fi';
import Button from '../shared/small/Button';

function BankInfo({ name, handleNext, handlePrevious, currentStep, totalSteps, handleSubmit }) {
  const [form, setForm] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
  });
  console.log('bank information', form);
  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <h1 className="text-textPrimary text-xl font-medium">{name}</h1>
      <h5 className="text-textPrimary text-base">Provide Account information.</h5>
      <div className="mt-6 flex flex-col gap-4">
        <TextField
          label={'Routing Number'}
          value={form.routingNumber}
          onChange={e => setForm({ ...form, routingNumber: e.target.value })}
        />
        <TextField
          label={'Bank Name'}
          value={form.bankName}
          onChange={e => setForm({ ...form, bankName: e.target.value })}
        />
        <TextField
          label={'Account Holder Name'}
          value={form.accountHolderName}
          onChange={e => setForm({ ...form, accountHolderName: e.target.value })}
        />
        <TextField
          label={'Account Number'}
          rightIcon={<FiEye />}
          value={form.accountNumber}
          onChange={e => setForm({ ...form, accountNumber: e.target.value })}
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

export default BankInfo;
