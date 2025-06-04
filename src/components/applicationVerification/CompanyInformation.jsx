import React, { useState } from 'react';
import TextField from '../shared/small/TextField';
import Button from '../shared/small/Button';
import Modal from '../shared/small/Modal';
import Modal1 from './companyInfo/Modal1';
import Modal2 from './companyInfo/Modal2';
import Modal3 from './companyInfo/Modal3';
import Modal4 from './companyInfo/Modal4';
import Modal5 from './companyInfo/Modal5';

function CompanyInformation({ data, updateField, index }) {
  const [activeModal, setActiveModal] = useState(null);
  const [businessDescription, setBusinessDescription] = useState(false);
  const [businessClassification, setBusinessClassification] = useState(false);

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
        return <Modal3 modal1Handle={nextModal} />;

      default:
        return null;
    }
  };

  return (
    <div className="mt-14">
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
