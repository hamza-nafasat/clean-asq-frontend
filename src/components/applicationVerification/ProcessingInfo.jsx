import React from 'react';

function ProcessingInfo({ data, updateField, index }) {
  return (
    <div className="mt-14">
      <h1 className="roboto-font text-textPrimary text-start text-2xl font-semibold">Processing Information</h1>
      <div className="mt-8 grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Processing Type</label>
            <select
              value={data.processingType || ''}
              onChange={e => updateField(index, 'processingType', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select Processing Type</option>
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expected Processing Time</label>
            <input
              type="text"
              value={data.processingTime || ''}
              onChange={e => updateField(index, 'processingTime', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessingInfo;
