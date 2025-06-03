import React from 'react';

function BankInfo({ data, updateField, index }) {
  return (
    <div className="mt-14">
      <h1 className="roboto-font text-dark-gray text-start text-2xl font-semibold">Bank Account Information</h1>
      <div className="mt-8 grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Number</label>
            <input
              type="text"
              value={data.accountNumber || ''}
              onChange={e => updateField(index, 'accountNumber', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
            <input
              type="text"
              value={data.bankName || ''}
              onChange={e => updateField(index, 'bankName', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Branch Name</label>
          <input
            type="text"
            value={data.branchName || ''}
            onChange={e => updateField(index, 'branchName', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}

export default BankInfo;
