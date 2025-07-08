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
import Modal6 from './companyInfo/Modal6';

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

function CompanyInformation({
  name,
  handleNext,
  handlePrevious,
  currentStep,
  totalSteps,
  handleSubmit,
  reduxData,
  formLoading,
}) {
  const [activeModal, setActiveModal] = useState(null);
  const [businessDescription, setBusinessDescription] = useState(false);
  const [businessClassification, setBusinessClassification] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);

  const [form, setForm] = useState({
    websiteUrl: '',
    legalCompanyName: '',
    dbaName: '',
    businessDescription: '',
    businessClassification: '',
    legalEntityType: '',
    ownershipType: '',
    ssn: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    companyPhone: '',
    unit: '',
  });
  console.log('form ', form);
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

  useEffect(() => {
    if (reduxData) {
      console.log('reduxData ', reduxData);
      const obj = {
        websiteUrl: reduxData?.websiteUrl ?? '',
        legalCompanyName: reduxData?.legalCompanyName ?? '',
        dbaName: reduxData?.dbaName ?? '',
        businessDescription: reduxData?.businessDescription ?? '',
        businessClassification: reduxData?.businessClassification ?? '',
        legalEntityType: reduxData?.legalEntityType ?? '',
        ownershipType: reduxData?.ownershipType ?? '',
        ssn: reduxData?.ssn ?? '',
        streetAddress: reduxData?.streetAddress ?? '',
        city: reduxData?.city ?? '',
        state: reduxData?.state ?? '',
        zipCode: reduxData?.zipCode ?? '',
        country: reduxData?.country ?? '',
        companyPhone: reduxData?.companyPhone ?? '',
        unit: reduxData?.unit ?? '',
      };
      setForm(obj);
    }
  }, [reduxData]);

  return (
    <div className="mt-14 h-full overflow-auto">
      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">2-Company Information</p>
        <Button
          variant="secondary"
          onClick={() => {
            setCustomizeModal(true);
          }}
          label={'Customize'}
        />
      </div>
      <div className="rounded-lg border border-gray-300 p-6">
        <h2 className="text-textPrimary text-xl font-medium">{name}</h2>
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
            <TextField
              label={'Website URL'}
              value={form.websiteUrl}
              onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
            />
            <TextField
              label={'Legal Company Name'}
              value={form.legalCompanyName}
              onChange={e => setForm({ ...form, legalCompanyName: e.target.value })}
            />
            <TextField
              label={'DBA Name'}
              value={form.dbaName}
              onChange={e => setForm({ ...form, dbaName: e.target.value })}
            />
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
              <TextField
                label={'Business Description'}
                value={form.businessDescription}
                onChange={e => setForm({ ...form, businessDescription: e.target.value })}
              />
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
              <TextField
                label={'Business Classification'}
                value={form.businessClassification}
                onChange={e => setForm({ ...form, businessClassification: e.target.value })}
              />
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
                    id={form.legalEntityType}
                    value={form.legalEntityType}
                    onClick={() => setForm({ ...form, legalEntityType: id })}
                    type="radio"
                    name="rentReason1"
                  />
                  <label className="text-textPrimary text-base" htmlFor={form.legalEntityType}>
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
                    value={form.ownershipType}
                    onClick={() => setForm({ ...form, ownershipType: id })}
                    type="radio"
                    name="rentReason2"
                  />
                  <label className="text-textPrimary text-base" htmlFor={id}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <TextField
              label={'SSN (Social Security Number)'}
              value={form.ssn}
              onChange={e => setForm({ ...form, ssn: e.target.value })}
            />
            <h5 className="text-textPrimary">Enter your Social Security Number (XXX-XX-XXXX)</h5>
          </div>
        </div>
        <div className="flex w-full flex-col gap-4">
          <h1 className="text-textPrimary text-lg font-medium">Legal Entity Type</h1>
          <TextField
            label={'Street Address'}
            value={form.streetAddress}
            onChange={e => setForm({ ...form, streetAddress: e.target.value })}
          />
          <TextField
            label={'Apt/Suite/Unit'}
            value={form.unit}
            onChange={e => setForm({ ...form, unit: e.target.value })}
          />
          <TextField
            label={'ZIP code'}
            value={form.zipCode}
            onChange={e => setForm({ ...form, zipCode: e.target.value })}
          />
          <TextField
            label={'Country'}
            value={form.country}
            onChange={e => setForm({ ...form, country: e.target.value })}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField label={'City'} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <TextField label={'State'} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
          </div>
          <TextField
            label={'Company Phone'}
            value={form.companyPhone}
            onChange={e => setForm({ ...form, companyPhone: e.target.value })}
          />
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
      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button label={'Next'} onClick={() => handleNext({ data: form, name })} />
          ) : (
            <Button
              disabled={formLoading}
              className={`${formLoading && 'pinter-events-none cursor-not-allowed opacity-50'}`}
              label={'Submit'}
              onClick={() => handleSubmit({ data: form, name })}
            />
          )}
        </div>
      </div>
      {customizeModal && (
        <Modal
          onClose={() => {
            setCustomizeModal(false);
          }}
        >
          <Modal6 />
        </Modal>
      )}
    </div>
  );
}

export default CompanyInformation;
