import React from 'react';

function Documents({ data, updateField, index }) {
  return (
    <div className="mt-14">
      <h1 className="roboto-font text-dark-gray text-start text-2xl font-semibold">Documents & Agreements</h1>
      <div className="mt-8 grid gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Required Documents</label>
            <input
              type="file"
              multiple
              onChange={e => updateField(index, 'documents', Array.from(e.target.files))}
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.agreementAccepted || false}
                onChange={e => updateField(index, 'agreementAccepted', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">I accept the terms and conditions</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documents;
