import React from 'react';

function ApplicationInfo({ data, updateField, index }) {
  return (
    <div className="mt-14">
      <h1 className="roboto-font text-textPrimary text-start text-2xl font-semibold">Application Information</h1>
      <div className="mt-8 grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Application Type</label>
            <select
              value={data.applicationType || ''}
              onChange={e => updateField(index, 'applicationType', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select Application Type</option>
              <option value="new">New Application</option>
              <option value="renewal">Renewal</option>
              <option value="modification">Modification</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Application Purpose</label>
            <input
              type="text"
              value={data.applicationPurpose || ''}
              onChange={e => updateField(index, 'applicationPurpose', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationInfo;
