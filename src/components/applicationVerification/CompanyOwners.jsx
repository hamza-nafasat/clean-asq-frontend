import React, { useState } from 'react';
import Button from '../shared/small/Button';
import TextField from '../shared/small/TextField';
import { GoPlus } from 'react-icons/go';
// import RangeInput from './verification/RangeInput';
import Modal from '../shared/Modal';
import Star from '@/assets/svgs/UserApplicationForm/Star';

function CompanyOwners({ data, updateField, index }) {
  const [addOwner, setAddOwner] = useState(false);
  const [ownership, setOwnership] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="h-[340px] overflow-auto">
      <h3 className="text-[24px] font-semibold text-[var(--textPrimary)]">3-Company Owners</h3>
      <div className="mt-5 rounded-[8px] border border-[#F0F0F0] p-4">
        <div className="flex justify-between border-b border-[#E8E8E8] pb-3">
          <div>
            <h2 className="text-[22px] font-medium text-[var(--textPrimary)]">Beneficial Owner Information</h2>
            <p className="text-[var(--textLight)]">Provide information about the beneficial owner.</p>
          </div>
          <div>
            <Button
              icon={Star}
              className={
                '!rounded-[4px] !border-none !bg-[#F5F5F5] !text-[var(--textPrimary)] !shadow-md hover:!bg-gray-300'
              }
              label={'AI Help'}
            />
          </div>
        </div>
        <div className="mt-5 border-b border-[#E8E8E8] pb-3">
          <p className="text-[14px] text-[#1A1A1A]">Do you own 25% or more of the company?</p>
          <div className="mt-1.5 flex items-center gap-8">
            <div className="flex items-center gap-1">
              <input
                id="yes"
                onChange={() => {
                  setOwnership(true);
                }}
                type="radio"
                name="own"
              />
              <label className="text-[17px] font-medium" htmlFor="yes">
                Yes
              </label>
            </div>
            <div className="flex items-center gap-1">
              <input
                onChange={() => {
                  setOwnership(false);
                }}
                type="radio"
                id="no"
                name="own"
              />
              <label className="text-[17px] font-medium" htmlFor="no">
                No
              </label>
            </div>
          </div>
        </div>
        {ownership && (
          <div className="mt-3">
            <div className="flex flex-col gap-9">
              <p className="text-[14px] text-[#1A1A1A]">What is your ownership percentage?</p>
              <div className="">"RangeInput "</div>
            </div>
            <div className="mt-8">
              <TextField label={'Please provide your social security number'} />
            </div>
          </div>
          // <div>
          //   <div className="mt-2 flex flex-col gap-2">
          //     <p className="text-[14px] text-[#1A1A1A]">What is your ownership percentage?</p>
          //     <div className="flex justify-center">
          //       <div class="relative mb-6 w-[70%]">
          //         <label for="large-range" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          //           Large range
          //         </label>
          //         <input
          //           id="large-range"
          //           type="range"
          //           value="50"
          //           class="range-lg h-3 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
          //         />
          //       </div>
          //     </div>
          //   </div>
          //   <div className="mt-2">
          //     <TextField label={'Please provide your social security number'} />
          //   </div>
          // </div>
        )}
        <div className="mt-5 border-b border-[#E8E8E8] pb-3">
          <p className="text-[14px] text-[#1A1A1A]">Are there additional owners that own 25% or greater?</p>
          <div className="mt-1.5 flex items-center gap-8">
            <div className="flex items-center gap-1">
              <input
                id="owner-yes"
                onChange={() => {
                  setAddOwner(true);
                }}
                type="radio"
                name="owners"
              />
              <label className="text-[17px] font-medium" htmlFor="owner-yes">
                Yes
              </label>
            </div>
            <div className="flex items-center gap-1">
              <input
                onChange={() => {
                  setAddOwner(false);
                }}
                type="radio"
                id="owner-no"
                name="owners"
              />
              <label className="text-[17px] font-medium" htmlFor="owner-no">
                No
              </label>
            </div>
          </div>
        </div>
        {addOwner && (
          <div className="flex flex-col gap-3">
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="grid w-full grid-cols-2 gap-6">
                <TextField label={'Owner Name'} />
                <TextField label={'Email Address'} />
              </div>
              <div className="relative top-4">
                <Button
                  onClick={() => setAddOwner(false)}
                  className={
                    '!rounded-[4px] !border !border-[#A7A7A7] !bg-transparent !py-2.75 !text-[#878787] hover:!bg-gray-200'
                  }
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
                  '!rounded-[4px] !border !border-[#D5D8DD] !bg-[#F5F5F5] !font-medium !text-[var(--textPrimary)] hover:!bg-gray-200'
                }
                label={'Add Owner'}
              />
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <Modal
          saveButtonText={'Yes, Proceed'}
          onClose={() => {
            setIsModalOpen(false);
          }}
          title="Confirmation"
        >
          <p className="text-[var(--textLight)]">An email will be sent to following Co-Owners</p>
          <div className="mt-5 grid grid-cols-2 gap-5">
            <div>
              <h2 className="font-medium text-[var(--textPrimary)]">Co-Owner Name</h2>
              <span className="text-[var(--textLight)]">John Doe</span>
            </div>
            <div>
              <h2 className="font-medium text-[var(--textPrimary)]">Email</h2>
              <span className="text-[var(--textLight)]">xyz@mail.com</span>
            </div>
            <div>
              <h2 className="font-medium text-[var(--textPrimary)]">Co-Owner Name</h2>
              <span className="text-[var(--textLight)]">John Doe</span>
            </div>
            <div>
              <h2 className="font-medium text-[var(--textPrimary)]">Email</h2>
              <span className="text-[var(--textLight)]">xyz@mail.com</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CompanyOwners;
