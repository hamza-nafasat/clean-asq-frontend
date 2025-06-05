import React, { useState } from 'react';
import TextField from '../shared/small/TextField';
import Button from '../shared/small/Button';
import Modal from '../shared/small/Modal';
import Modal1 from './companyInfo/Modal1';
import Modal2 from './companyInfo/Modal2';
import Modal3 from './companyInfo/Modal3';
import Modal4 from './companyInfo/Modal4';
import Modal5 from './companyInfo/Modal5';
import { Ai } from '@/assets/svgs/icon';

function CompanyInformation({ data, updateField, index }) {
  const [activeModal, setActiveModal] = useState(null);
  const [businessDescription, setBusinessDescription] = useState(false);
  const [businessClassification, setBusinessClassification] = useState(false);
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
  const openModal = modalNumber => {
    setActiveModal(modalNumber);
  };
  const openBusinessDescriptionHandel = () => {
    setBusinessDescription(true);
  };
  const closeBusinessDescriptionHandel = () => {
    setBusinessDescription(false);
  };
  const openBusinessClassificationHandel = () => {
    setBusinessClassification(true);
  };
  const closeBusinessClassificationHandel = () => {
    setBusinessClassification(false);
  };
  const closeModal = () => {
    setActiveModal(null);
  };

  const nextModal = () => {
    setActiveModal(prev => prev + 1);
  };
  const renderModal = () => {
    switch (activeModal) {
      case 1:
        return (
          <Modal1
            modal1Handle={nextModal}
            openBusinessDescriptionHandel={openBusinessDescriptionHandel}
            openBusinessClassificationHandel={openBusinessClassificationHandel}
          />
        );
      case 2:
        return <Modal2 modal1Handle={nextModal} />;
      case 3:
        return <Modal3 modal1Handle={closeModal} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-14 h-full overflow-auto">
      <div className="rounded-lg border border-gray-300 p-6">
        <h2 className="text-xl font-medium">Confirm Your Information</h2>
        <h5 className="text-textSecondary text-base">Please enter your company information</h5>
        <h5 className="text-textSecondary mt-3">Company Website (recommended) or Complete Legal Company Name</h5>
        <div className="flex items-center justify-center gap-4">
          <TextField />
          <Button
            onClick={() => openModal(1)}
            className="h-[45px] flex-none !border-[#A7A7A7] !bg-white !text-[#A7A7A7]"
            label={'Look Up'}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="my-5 flex w-full flex-col items-start">
          <h1 className="text-xl font-medium">Basic Information</h1>
          <div className="mt-6 flex w-full flex-col gap-4">
            <TextField label={'Website URL'} />
            <TextField label={'Legal Company Name'} />
            <TextField label={'DBA Name'} />
          </div>
          <div className="w-full">
            <div className="w-full">
              <div className="mt-6 flex w-full justify-end">
                <Button
                  label={'AI Help'}
                  onClick={openBusinessDescriptionHandel}
                  icon={Ai}
                  className="!border-none !bg-[#F5F5F5] !text-[#1A1A1A] hover:!bg-gray-500"
                />
              </div>
              <TextField label={'Business Description'} />
            </div>
          </div>
          <div className="w-full">
            <div className="w-full">
              <div className="mt-6 flex w-full justify-end">
                <Button
                  label={'AI Help'}
                  onClick={openBusinessClassificationHandel}
                  icon={Ai}
                  className="!border-none !bg-[#F5F5F5] !text-[#1A1A1A] hover:!bg-gray-500"
                />
              </div>
              <TextField label={'Business Classification'} />
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col justify-start">
          <h1 className="text-lg font-medium">Legal Entity Type</h1>
          <div className="border-b-2 py-6">
            <div className="grid grid-cols-2 gap-4 p-0">
              {options.map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2 p-2">
                  <input
                    className="size-5"
                    id={id}
                    type="radio"
                    name="rentReason1"
                    onChange={handleRentReasonChange1}
                  />
                  <label className="text-base" htmlFor={id}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <h1 className="mt-6 text-lg font-medium">Company Ownership Type</h1>
          <div className="border-b-2 py-6">
            <div className="grid grid-cols-3 gap-4">
              {ownerOptions.map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2 p-2">
                  <input
                    className="size-5"
                    id={id}
                    type="radio"
                    name="rentReason1"
                    onChange={handleRentReasonChange1}
                  />
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
          <div className="mt-6">
            <TextField label={'SSN (Social Security Number)'} />
            <h5>Enter your Social Security Number (XXX-XX-XXXX)</h5>
          </div>
          {/* <div className="flex justify-end gap-4">
            <Button label={'Back'} variant="secondary" />
            <Button label={'Next'} onClick={modal1Handle} />
          </div> */}
        </div>
        <div className="flex w-full flex-col gap-4">
          <h1 className="text-lg font-medium">Legal Entity Type</h1>
          <TextField label={'Street Address'} />
          <TextField label={'Apt/Suite/Unit'} />
          <TextField label={'ZIP code'} />
          <TextField label={'Country'} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField label={'City'} />
            <TextField label={'State'} />
          </div>
          <TextField label={'Company Phone'} />
        </div>
      </div>
      {activeModal && <Modal onClose={closeModal}>{renderModal()}</Modal>}
      {businessDescription && (
        <Modal onClose={closeBusinessDescriptionHandel}>
          <Modal4 closeBusinessDescriptionHandel={closeBusinessDescriptionHandel} />
        </Modal>
      )}
      {businessClassification && (
        <Modal onClose={closeBusinessClassificationHandel}>
          <Modal5 closeBusinessClassificationHandel={closeBusinessClassificationHandel} />
        </Modal>
      )}
    </div>
  );
}

export default CompanyInformation;
