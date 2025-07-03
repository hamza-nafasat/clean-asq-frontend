import React, { useState } from 'react';
import verificationImg from '../../assets/images/verificationImg.png';
import Modal from '../shared/small/Modal';
import Button from '../shared/small/Button';
import { PiUserFocusFill } from 'react-icons/pi';
import Modal1 from './verification/Modal1';
import Modal2 from './verification/Modal2';
import Modal3 from './verification/Modal3';
import Modal4 from './verification/Modal4';
import Modal5 from './verification/Modal5';
import { MdVerifiedUser } from 'react-icons/md';
import TextField from '../shared/small/TextField';

function Verification({ name, handleNext, handlePrevious, currentStep, totalSteps, handleSubmit }) {
  const [activeModal, setActiveModal] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const openModal = modalNumber => {
    setActiveModal(modalNumber);
  };

  const closeModal = () => {
    setActiveModal(null);
  };
  const closeModal1 = () => {
    console.log('new');
    setShowInfo(true);
    console.log('new1');
    setActiveModal(null);
    console.log('new2');
  };
  console.log('showInfo', showInfo);

  const nextModal = () => {
    setActiveModal(prev => prev + 1);
  };

  const renderModal = () => {
    switch (activeModal) {
      case 1:
        return <Modal1 modal1Handle={nextModal} />;
      case 2:
        return <Modal2 modal1Handle={nextModal} />;
      case 3:
        return <Modal3 modal1Handle={nextModal} />;
      case 4:
        return <Modal4 modal1Handle={nextModal} />;
      case 5:
        return <Modal5 modal1Handle={closeModal1} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-14 h-full overflow-auto text-center">
      {showInfo === false && (
        <div>
          <h1 className="text-textPrimary text-start text-2xl font-semibold">{name}</h1>
          <p className="text-textPrimary mt-10 text-[18px] font-semibold">We need to Verify your identity</p>
          <div className="mt-11 flex justify-center">
            <img src={verificationImg} alt="Verification Illustration" className="h-auto w-64" />
          </div>
          <div className="mt-8">
            <Button
              onClick={() => openModal(1)}
              label={'Verify ID'}
              cnRight={'text-white'}
              rightIcon={PiUserFocusFill}
            />
          </div>
        </div>
      )}
      {/* /// for next page */}
      {showInfo === true && (
        <div>
          <h1 className="text-textPrimary text-[24px] font-semibold">1-Application Verification</h1>
          <div className="mt-8">
            <h2 className="flex w-full justify-center gap-2 rounded-[4px] bg-[var(--primary)] py-3.5 text-center text-[20px] font-semibold text-white">
              <img src="/src/assets/images/Ð¨Ð°Ñ€_1.png" alt="" /> ID Verification Completed
            </h2>
          </div>
          <div className="mt-3 rounded-sm border border-[#F0F0F0] bg-white p-3">
            <h2 className="text-textPrimary text-[22px] font-medium">Confirm Your Information</h2>
            <p className="text-textPrimary text-base">
              Please review and correct your information if needed before processing.
            </p>
            <div className="mt-4">
              <h3 className="text-textPrimary flex items-center gap-4 text-[18px] font-medium">
                Personal Information{' '}
                <span className="flex items-center gap-1 text-[#34C759]">
                  <MdVerifiedUser />
                  Verified
                </span>
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                <TextField label={'First Name'} />
                <TextField label={'Middle Name'} />
                <TextField label={'Last Name'} />
                <div className="lg:col-span-3">
                  <TextField type={'email'} label={'Email Address'} />
                </div>
              </div>
            </div>
            <div className="mt-5">
              <h3 className="text-textPrimary flex items-center gap-4 text-[18px] font-medium">
                Current Address
                <span className="flex items-center gap-1 text-[#34C759]">
                  <MdVerifiedUser />
                  Verified
                </span>
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <TextField label={'Street Address'} />
                <TextField label={'Apt/Suite/Unit'} />
                <TextField label={'ZAP Code'} />
                <TextField label={'Country'} />
                <TextField label={'City'} />
                <TextField label={'State'} />
              </div>
            </div>
            <div className="mt-5">
              <h2 className="text-textPrimary text-[22px] font-medium">Additional Information</h2>
              <p className="text-textPrimary text-base">
                Please provide the following additional information to complete your profile.
              </p>
            </div>
            <div className="mt-5">
              <h3 className="text-textPrimary text-[18px] font-medium">Personal Information</h3>
              <div className="mt-2">
                <TextField label={'Job Title'} />
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <p className="text-textPrimary text-[14px]">
                Your Signature<span className="text-[#CE2D2D]">*</span>
              </p>
              <p className="text-textPrimary text-[14px]">
                By signing here you attest that you are authorized to bind the contractual agreement.
              </p>
            </div>
          </div>
        </div>
      )}
      {activeModal && <Modal onClose={closeModal}>{renderModal()}</Modal>}

      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button label={'Next'} onClick={handleNext} />
          ) : (
            <Button label={'Submit'} onClick={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Verification;
