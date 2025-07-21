import { useEffect, useState } from 'react';
import Button from '../shared/small/Button';
import {
  SelectInputType,
  CheckboxInputType,
  RangeInputType,
  OtherInputType,
  RadioInputType,
  MultiCheckboxInputType,
} from '../shared/small/DynamicField';
import Modal from '../shared/small/Modal';
import Modal1 from './companyInfo/Modal1';
import Modal2 from './companyInfo/Modal2';
import Modal3 from './companyInfo/Modal3';
import Modal4 from './companyInfo/Modal4';
import Modal5 from './companyInfo/Modal5';
import Modal6 from './companyInfo/Modal6';
import { FIELD_TYPES } from '@/data/constants';
import { toast } from 'react-toastify';

function CompanyInformation({
  formRefetch,
  _id,
  name,
  handleNext,
  handlePrevious,
  currentStep,
  totalSteps,
  handleSubmit,
  reduxData,
  formLoading,
  fields,
}) {
  const [activeModal, setActiveModal] = useState(null);
  const [businessDescription, setBusinessDescription] = useState(false);
  const [businessClassification, setBusinessClassification] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [form, setForm] = useState({});

  console.log('company info', form);

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
    if (fields && fields.length > 0) {
      const initialForm = {};
      fields.forEach(field => {
        initialForm[field.name] = reduxData ? reduxData[field.name] || '' : '';
      });
      setForm(initialForm);
    }
  }, [fields, name, reduxData]);

  const nextHandler = ({ data, name }) => {
    const isValid = Object.values(data).every(value => {
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.every(item => Object.values(item).every(val => val.trim() !== ''));
      return true;
    });
    if (!isValid) return toast.error('Please fill all fields before proceeding next.');
    handleNext({ data: form, name });
  };

  return (
    <div className="mt-14 h-full overflow-auto">
      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">{name}</p>
        <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
      </div>

      {fields?.length > 0 &&
        fields.map((field, index) => {
          if (field.type === FIELD_TYPES.SELECT) {
            return (
              <div key={index} className="mt-4">
                <SelectInputType field={field} form={form} setForm={setForm} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.MULTI_CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <MultiCheckboxInputType field={field} form={form} setForm={setForm} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RADIO) {
            return (
              <div key={index} className="mt-4">
                <RadioInputType field={field} form={form} setForm={setForm} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RANGE) {
            return (
              <div key={index} className="mt-4">
                <RangeInputType field={field} form={form} setForm={setForm} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <CheckboxInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={form}
                  setForm={setForm}
                  className={''}
                />
              </div>
            );
          }
          return (
            <div key={index} className="mt-4">
              <OtherInputType
                field={field}
                placeholder={field.placeholder}
                form={form}
                setForm={setForm}
                className={''}
              />
            </div>
          );
        })}

      {activeModal && <Modal onClose={() => setActiveModal(null)}>{renderModal()}</Modal>}
      {businessDescription && (
        <Modal onClose={() => setBusinessDescription(false)}>
          <Modal4 closeBusinessDescriptionHandel={() => setBusinessDescription(false)} />
        </Modal>
      )}
      {businessClassification && (
        <Modal onClose={() => setBusinessClassification(false)}>
          <Modal5 closeBusinessClassificationHandel={() => setBusinessClassification(false)} />
        </Modal>
      )}
      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button label={'Next'} onClick={() => nextHandler({ data: form, name })} />
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
        <Modal onClose={() => setCustomizeModal(false)}>
          <Modal6 sectionId={_id} fields={fields} formRefetch={formRefetch} onClose={() => setCustomizeModal(false)} />
        </Modal>
      )}
    </div>
  );
}

export default CompanyInformation;
