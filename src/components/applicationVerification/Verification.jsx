import React, { useState } from 'react';
import verificationImg from '../../assets/images/verificationImg.png';
import Modal from '../shared/small/Modal';
import Button from '../shared/small/Button';
import { PiUserFocusFill } from 'react-icons/pi';
import { PiUserCircleGearFill } from 'react-icons/pi';
import TextField from '../shared/small/TextField';

function Verification({ data, updateField, index }) {
  const [firstModal, setFirstModal] = useState(false);
  const openModal = () => {
    setFirstModal(true);
  };

  const closeModal = () => {
    setFirstModal(false);
  };
  return (
    <div className="mt-14 text-center">
      <h1 className="roboto-font text-dark-gray text-start text-2xl font-semibold">Verification</h1>
      <p className="roboto-font text-medium-gray mt-10 text-[18px] font-semibold">We need to Verify your identity</p>
      <div className="mt-11 flex justify-center">
        <img src={verificationImg} alt="Verification Illustration" className="h-auto w-64" />
      </div>
      <div className="mt-8">
        <Button onClick={openModal} label={'Verify ID'} cnRight={'text-white'} rightIcon={PiUserFocusFill} />
      </div>
      <TextField label={'hallo'} />

      {firstModal && (
        <Modal onClose={closeModal}>
          <TextField label={'hallo'} />
        </Modal>
      )}
    </div>
  );
}

export default Verification;
