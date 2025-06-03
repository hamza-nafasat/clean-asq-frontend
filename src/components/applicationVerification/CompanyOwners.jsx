import React from 'react';

function CompanyOwners({ data, updateField, index }) {
  return (
    <div className="mt-14">
      <h1 className="roboto-font text-textPrimary text-start text-2xl font-semibold">Company Owners</h1>
      <div className="mt-8 space-y-6">
        {data.owners?.map((owner, ownerIndex) => (
          <div key={ownerIndex} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Owner Name</label>
              <input
                type="text"
                value={owner.name || ''}
                onChange={e => {
                  const newOwners = [...(data.owners || [])];
                  newOwners[ownerIndex] = { ...newOwners[ownerIndex], name: e.target.value };
                  updateField(index, 'owners', newOwners);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ownership Percentage</label>
              <input
                type="number"
                value={owner.percentage || ''}
                onChange={e => {
                  const newOwners = [...(data.owners || [])];
                  newOwners[ownerIndex] = { ...newOwners[ownerIndex], percentage: e.target.value };
                  updateField(index, 'owners', newOwners);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        ))}
        <button
          onClick={() => {
            const newOwners = [...(data.owners || []), { name: '', percentage: '' }];
            updateField(index, 'owners', newOwners);
          }}
          className="rounded bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          + Add Another Owner
        </button>
      </div>
    </div>
  );
}

export default CompanyOwners;
