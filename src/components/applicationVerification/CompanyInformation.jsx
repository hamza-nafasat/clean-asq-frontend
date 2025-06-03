import React from 'react';

function CompanyInformation({ data, updateField, index }) {
  return (
    <div className="mt-14">
      <h1 className="roboto-font text-textPrimary text-start text-2xl font-semibold">Company Information</h1>
      <div className="mt-8 grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              value={data.companyName || ''}
              onChange={e => updateField(index, 'companyName', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Registration Number</label>
            <input
              type="text"
              value={data.registrationNumber || ''}
              onChange={e => updateField(index, 'registrationNumber', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Address</label>
          <textarea
            value={data.businessAddress || ''}
            onChange={e => updateField(index, 'businessAddress', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            rows="3"
          />
        </div>
      </div>
    </div>
  );
}

export default CompanyInformation;
