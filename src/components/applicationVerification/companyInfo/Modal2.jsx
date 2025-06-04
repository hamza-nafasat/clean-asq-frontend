import TextField from '@/components/shared/small/TextField';
import React, { useState } from 'react';

function Modal2({ modal1Handle }) {
  const [showInput1, setShowInput1] = useState(false);
  const options = [
    { label: 'Limited Liability Company (LLC)', id: 'llc' },
    { label: 'Corporation (Inc.)', id: 'inc' },
    { label: 'Limited Partnership (LTD)', id: 'ltd' },
    { label: 'Sole Proprietorship', id: 'Sole-Proprietorship' },
    { label: 'Non-Profit', id: 'Non-Profit' },
    // { label: 'Custom', id: 'Custom' },
  ];
  const ownerOptions = [
    { label: 'Private', id: 'private' },

    { label: 'Public', id: 'Public' },
  ];
  const handleRentReasonChange1 = e => {
    setShowInput1(e.target.id === 'Public');
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-primary text-4xl font-extrabold">LOGO</h1>
        <h2 className="text-xl font-medium">Confirm Your Information</h2>
        <h5 className="text-textSecondary text-base">Please enter your company information</h5>
      </div>
      <div className="flex w-full flex-col justify-start">
        <h1 className="text-lg font-medium">Legal Entity Type</h1>
        <div className="border-b-2 py-6">
          <div className="grid grid-cols-2 gap-4">
            {options.map(({ id, label }) => (
              <div key={id} className="flex items-center gap-2 p-2">
                <input className="size-5" id={id} type="radio" name="rentReason1" onChange={handleRentReasonChange1} />
                <label className="text-base" htmlFor={id}>
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>
        <h1 className="text-lg font-medium">Company Ownership Type</h1>
        <div className="border-b-2 py-6">
          <div className="grid grid-cols-3 gap-4">
            {ownerOptions.map(({ id, label }) => (
              <div key={id} className="flex items-center gap-2 p-2">
                <input className="size-5" id={id} type="radio" name="rentReason1" onChange={handleRentReasonChange1} />
                <label className="text-base" htmlFor={id}>
                  {label}
                </label>
              </div>
            ))}
            {showInput1 && (
              <div>
                <div className="mt-1">
                  <TextField type="text" placeholder="AAPL (NASDAQ)" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal2;
