import React, { useState } from 'react';
import verificationImg from '../../assets/images/verificationImg.png';
import Modal from '../shared/small/Modal';
import Button from '../shared/small/Button';
import { PiUserFocusFill } from 'react-icons/pi';
import { PiUserCircleGearFill } from 'react-icons/pi';
import TextField from '../shared/small/TextField';
import Modal1 from './verification/Modal1';
import Modal2 from './verification/Modal2';

function Verification({ data, updateField, index }) {
  const [modal, setModal] = useState(false);
  const [modal2, setModal2] = useState(false);
  const openModal = () => {
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
  };
  const openModal2 = () => {
    setModal2(true);
  };
  const closeModal2 = () => {
    setModal2(false);
  };
  const modal1Handle = () => {
    closeModal();
    openModal2();
  };
  return (
    <div className="mt-14 text-center">
      <h1 className="roboto-font text-textPrimary text-start text-2xl font-semibold">Verification</h1>
      <p className="roboto-font text-textSecondary mt-10 text-[18px] font-semibold">We need to Verify your identity</p>
      <div className="mt-11 flex justify-center">
        <img src={verificationImg} alt="Verification Illustration" className="h-auto w-64" />
      </div>
      <div className="mt-8">
        <Button onClick={openModal} label={'Verify ID'} cnRight={'text-white'} rightIcon={PiUserFocusFill} />
      </div>

      {modal && (
        <Modal onClose={closeModal}>
          <Modal1 modal1Handle={modal1Handle} />
        </Modal>
      )}

      {modal2 && (
        <Modal onClose={closeModal2}>
          <Modal2 modal1Handle={modal1Handle} />
        </Modal>
      )}
    </div>
  );
}

export default Verification;
