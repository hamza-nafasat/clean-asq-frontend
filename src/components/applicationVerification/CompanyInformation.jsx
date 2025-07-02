import React, { useEffect, useState } from 'react';
import TextField from '../shared/small/TextField';
import Button from '../shared/small/Button';
import Modal from '../shared/small/Modal';
import Modal1 from './companyInfo/Modal1';
import Modal2 from './companyInfo/Modal2';
import Modal3 from './companyInfo/Modal3';
import Modal4 from './companyInfo/Modal4';
import Modal5 from './companyInfo/Modal5';
import { Ai } from '@/assets/svgs/icon';

const options = [
  { label: 'Limited Liability Company (LLC)', id: 'llc' },
  { label: 'Corporation (Inc.)', id: 'inc' },
  { label: 'Limited Partnership (LTD)', id: 'ltd' },
  { label: 'Sole Proprietorship', id: 'Sole-Proprietorship' },
  { label: 'Non-Profit', id: 'Non-Profit' },
];
const ownerOptions = [
  { label: 'Private', id: 'private' },
  { label: 'Public', id: 'Public' },
];

function CompanyInformation() {
  const [activeModal, setActiveModal] = useState(null);
  const [businessDescription, setBusinessDescription] = useState(false);
  const [businessClassification, setBusinessClassification] = useState(false);
  const [showInput1, setShowInput1] = useState(false);
  const [form, setForm] = useState({
    websiteUrl: '',
    legalCompanyName: '',
    dbaName: '',
    businessDescription: '',
    businessClassification: '',
    legalEntityType: '',
    ownerShipType: '',
    ssn: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    companyPhone: '',
    unit: '',
  });

  const renderModal = () => {
    switch (activeModal) {
      case 1:
        return (
          <Modal1
            modal1Handle={() => {
              setActiveModal(prev => prev + 1);
            }}
            openBusinessDescriptionHandel={() => {
              setBusinessDescription(true);
            }}
            openBusinessClassificationHandel={() => {
              setBusinessClassification(true);
            }}
          />
        );
      case 2:
        return (
          <Modal2
            modal1Handle={() => {
              setActiveModal(prev => prev + 1);
            }}
          />
        );
      case 3:
        return (
          <Modal3
            modal1Handle={() => {
              setActiveModal(null);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-14 h-full overflow-auto">
      <div className="rounded-lg border border-gray-300 p-6">
        <h2 className="text-textPrimary text-xl font-medium">Confirm Your Information</h2>
        <h5 className="text-textPrimary text-base">Please enter your company information</h5>
        <h5 className="text-textPrimary mt-3">Company Website (recommended) or Complete Legal Company Name</h5>
        <div className="flex items-center justify-center gap-4">
          <TextField />
          <Button
            onClick={() => {
              setActiveModal(1);
            }}
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
                  onClick={() => {
                    setBusinessDescription(true);
                  }}
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
                  onClick={() => {
                    setBusinessClassification(true);
                  }}
                  icon={Ai}
                  className="!border-none !bg-[#F5F5F5] !text-[#1A1A1A] hover:!bg-gray-500"
                />
              </div>
              <TextField label={'Business Classification'} />
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col justify-start">
          <h1 className="text-textPrimary text-lg font-medium">Legal Entity Type</h1>
          <div className="border-b-2 py-6">
            <div className="grid grid-cols-2 gap-4 p-0">
              {options?.map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2 p-2">
                  <input
                    className="text-textPrimary accent-primary size-5"
                    id={id}
                    onClick={() => setForm({ ...form, legalEntityType: id })}
                    type="radio"
                    name="rentReason1"
                  />
                  <label className="text-textPrimary text-base" htmlFor={id}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <h1 className="text-textPrimary mt-6 text-lg font-medium">Company Ownership Type</h1>
          <div className="border-b-2 py-6">
            <div className="grid grid-cols-3 gap-4">
              {ownerOptions?.map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2 p-2">
                  <input
                    className="accent-primary size-5"
                    id={id}
                    onChange={() => setForm({ ...form, ownershipType: id })}
                    type="radio"
                    name="rentReason1"
                  />
                  <label className="text-textPrimary text-base" htmlFor={id}>
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
            <h5 className="text-textPrimary">Enter your Social Security Number (XXX-XX-XXXX)</h5>
          </div>
          {/* <div className="flex justify-end gap-4">
            <Button label={'Back'} variant="secondary" />
            <Button label={'Next'} onClick={modal1Handle} />
          </div> */}
        </div>
        <div className="flex w-full flex-col gap-4">
          <h1 className="text-textPrimary text-lg font-medium">Legal Entity Type</h1>
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
      {activeModal && (
        <Modal
          onClose={() => {
            setActiveModal(null);
          }}
        >
          {renderModal()}
        </Modal>
      )}
      {businessDescription && (
        <Modal
          onClose={() => {
            setBusinessDescription(false);
          }}
        >
          <Modal4
            closeBusinessDescriptionHandel={() => {
              setBusinessDescription(false);
            }}
          />
        </Modal>
      )}
      {businessClassification && (
        <Modal
          onClose={() => {
            setBusinessClassification(false);
          }}
        >
          <Modal5
            closeBusinessClassificationHandel={() => {
              setBusinessClassification(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default CompanyInformation;
