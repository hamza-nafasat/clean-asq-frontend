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

function Verification() {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = modalNumber => {
    setActiveModal(modalNumber);
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
        return <Modal1 modal1Handle={nextModal} />;
      case 2:
        return <Modal2 modal1Handle={nextModal} />;
      case 3:
        return <Modal3 modal1Handle={nextModal} />;
      case 4:
        return <Modal4 modal1Handle={nextModal} />;
      case 5:
        return <Modal5 modal1Handle={closeModal} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-14 text-center">
      <h1 className="roboto-font text-textPrimary text-start text-2xl font-semibold">Verification</h1>
      <p className="roboto-font text-textSecondary mt-10 text-[18px] font-semibold">We need to Verify your identity</p>
      <div className="mt-11 flex justify-center">
        <img src={verificationImg} alt="Verification Illustration" className="h-auto w-64" />
      </div>
      <div className="mt-8">
        <Button onClick={() => openModal(1)} label={'Verify ID'} cnRight={'text-white'} rightIcon={PiUserFocusFill} />
      </div>

      {activeModal && <Modal onClose={closeModal}>{renderModal()}</Modal>}
    </div>
  );
}

export default Verification;
