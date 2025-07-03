import Star from '@/assets/svgs/UserApplicationForm/Star';
import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import React, { useState } from 'react';
import { GoPlus } from 'react-icons/go';
import PercentageSlider from '../companyOwner/PercentageSlider';

function OwnerInformation({ form, setForm, setShowInfo }) {
  const [addOwner, setAddOwner] = useState(false);
  const [ownership, setOwnership] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddOwnerPercentage = percentage => {
    setForm({
      ...form,
      yourPercentage: percentage,
    });
  };
  const handleOtherOwnerPercentage = percentage => {
    setForm({
      ...form,
      otherOwnerPercentage: percentage,
    });
  };
  return (
    <>
      <div className="h-full overflow-auto pb-3">
        <div className="rounded-[8px] border border-[#F0F0F0] p-4">
          <div className="flex flex-col justify-between gap-2 border-b border-[#E8E8E8] pb-3 sm:flex-row sm:gap-0">
            <div>
              <h2 className="text-textPrimary text-[22px] font-medium">Beneficial Owner Information</h2>
              <p className="text-textPrimary">Provide information about the beneficial owner.</p>
            </div>
            <div className="flex justify-end">
              <Button
                icon={Star}
                className={
                  '!text-textPrimary !h-fit !rounded-[4px] !border-none !bg-[#F5F5F5] !shadow-md hover:!bg-gray-300'
                }
                label={'AI Help'}
              />
            </div>
          </div>
          <div className="mt-5 border-b border-[#E8E8E8] pb-3">
            <p className="text-textPrimary text-[14px]">Do you own 25% or more of the company?</p>
            <div className="mt-1.5 flex items-center gap-8">
              <div className="flex items-center gap-1">
                <input
                  id="yes"
                  onChange={() => {
                    setForm({ ...form, mainOwnerOwn25OrMore: 'yes' });
                  }}
                  type="radio"
                  name="beneficial"
                />
                <label className="text-textPrimary text-[17px] font-medium" htmlFor="yes">
                  Yes
                </label>
              </div>
              <div className="flex items-center gap-1">
                <input
                  onChange={() => {
                    setForm({ ...form, mainOwnerOwn25OrMore: 'no' });
                  }}
                  type="radio"
                  id="no"
                  name="beneficial"
                />
                <label className="text-textPrimary text-[17px] font-medium" htmlFor="no">
                  No
                </label>
              </div>
            </div>
          </div>
          {form.mainOwnerOwn25OrMore === 'yes' && (
            <div className="mt-3">
              <div className="flex flex-col gap-9">
                <p className="text-textPrimary text-[14px]">What is your beneficialOwnership percentage?</p>
                <PercentageSlider
                  percentage={form.yourPercentage}
                  handleAddOwnerPercentage={handleAddOwnerPercentage}
                />
              </div>
              <div className="mt-8">
                <TextField
                  label={'Please provide your social security number'}
                  value={form.yourSsn}
                  onChange={e => setForm({ ...form, yourSsn: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="mt-5 border-b border-[#E8E8E8] pb-3">
            <p className="text-textPrimary text-[14px]">Are there additional owners that own 25% or greater?</p>
            <div className="mt-1.5 flex items-center gap-8">
              <div className="flex items-center gap-1">
                <input
                  id="owner-yes"
                  onChange={() => {
                    setForm({ ...form, otherOwnersOwn25OrMore: 'yes' });
                    setAddOwner(true);
                  }}
                  type="radio"
                  name="owners"
                />
                <label className="text-textPrimary text-[17px] font-medium" htmlFor="owner-yes">
                  Yes
                </label>
              </div>
              <div className="flex items-center gap-1">
                <input
                  onChange={() => {
                    setForm({ ...form, otherOwnersOwn25OrMore: 'no' });
                  }}
                  type="radio"
                  id="owner-no"
                  name="owners"
                />
                <label className="text-textPrimary text-[17px] font-medium" htmlFor="owner-no">
                  No
                </label>
              </div>
            </div>
          </div>
          {addOwner && (
            <div className="flex flex-col gap-3">
              <div className="mt-3 flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="grid w-full gap-6 sm:grid-cols-2">
                  <TextField label={'Owner Name'} />
                  <TextField label={'Email Address'} />
                </div>
                <div className="top-3 flex w-full justify-end md:relative">
                  <Button
                    onClick={() => setAddOwner(false)}
                    className={'!py-2.5'}
                    variant="secondary"
                    label={'Remove'}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  icon={GoPlus}
                  className={
                    '!text-textPrimary !rounded-[4px] !border !border-[#D5D8DD] !bg-[#F5F5F5] !font-medium hover:!bg-gray-200'
                  }
                  label={'Add Owner'}
                />
              </div>
            </div>
          )}
        </div>
        <div className="mt-5 rounded-[8px] border border-[#F0F0F0] p-4">
          <div className="flex flex-col justify-between gap-2 border-b border-[#E8E8E8] pb-3 sm:flex-row sm:gap-0">
            <div>
              <h2 className="text-textPrimary text-[22px] font-medium">Beneficial Owner Information</h2>
              <p className="text-textPrimary">Provide information about the beneficial owner.</p>
            </div>
            <div className="flex justify-end">
              <Button
                icon={Star}
                className={
                  '!text-textPrimary !h-fit !rounded-[4px] !border-none !bg-[#F5F5F5] !shadow-md hover:!bg-gray-300'
                }
                label={'AI Help'}
              />
            </div>
          </div>
          <div className="mt-5 border-b border-[#E8E8E8] pb-3">
            <p className="text-textPrimary text-[14px]">Do you own 25% or more of the company?</p>
            <div className="mt-1.5 flex items-center gap-8">
              <div className="flex items-center gap-1">
                <input
                  id="ownerYes"
                  onChange={() => {
                    setOwnership(true);
                  }}
                  type="radio"
                  name="owner"
                />
                <label className="text-textPrimary text-[17px] font-medium" htmlFor="ownerYes">
                  Yes
                </label>
              </div>
              <div className="flex items-center gap-1">
                <input
                  onChange={() => {
                    setOwnership(false);
                  }}
                  type="radio"
                  id="ownerNo"
                  name="owner"
                />
                <label className="text-textPrimary text-[17px] font-medium" htmlFor="ownerNo">
                  No
                </label>
              </div>
            </div>
          </div>
          {ownership && (
            <div className="mt-3">
              <div className="flex flex-col gap-9">
                <p className="text-textPrimary text-[14px]">What is your beneficialOwnership percentage?</p>
                <div className="">
                  <PercentageSlider
                    percentage={form.otherOwnerPercentage}
                    handleAddOwnerPercentage={handleOtherOwnerPercentage}
                  />
                </div>
              </div>
              <div className="mt-8">
                <TextField
                  label={'Please provide your social security number'}
                  value={form.otherSsn}
                  onChange={e => setForm({ ...form, otherSsn: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            onClick={() => {
              setShowInfo(true);
            }}
            label={'Submit'}
          />
        </div>
      </div>

      {isModalOpen && (
        <Modal
          saveButtonText={'Yes, Proceed'}
          onClose={() => {
            setIsModalOpen(false);
          }}
          title="Confirmation"
        >
          <p className="text-textPrimary">An email will be sent to following Co-Owners</p>
          <div className="mt-5 grid grid-cols-2 gap-5">
            <div>
              <h2 className="text-textPrimary font-medium">Co-Owner Name</h2>
              <span className="text-textPrimary">John Doe</span>
            </div>
            <div>
              <h2 className="text-textPrimary font-medium">Email</h2>
              <span className="text-textPrimary">xyz@mail.com</span>
            </div>
            <div>
              <h2 className="text-textPrimary font-medium">Co-Owner Name</h2>
              <span className="text-textPrimary">John Doe</span>
            </div>
            <div>
              <h2 className="text-textPrimary font-medium">Email</h2>
              <span className="text-textPrimary">xyz@mail.com</span>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default OwnerInformation;
