import { FIELD_TYPES } from '@/data/constants';
import { useEffect, useMemo, useState } from 'react';
import Button from '../shared/small/Button';
import {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from '../shared/small/DynamicField';
import Modal from '../shared/small/Modal';
import CustomizationFieldsModal from './companyInfo/CustomizationFieldsModal';
import { EditSectionDisplayTextFromatingModal } from '../shared/small/EditSectionDisplayTextFromatingModal';
import { PencilIcon } from 'lucide-react';
import { useSelector } from 'react-redux';

function ProcessingInfo({
  name,
  handleNext,
  handlePrevious,
  currentStep,
  totalSteps,
  handleSubmit,
  formLoading,
  fields,
  reduxData,
  formRefetch,
  _id,
  title,
  saveInProgress,
  step,
}) {
  const { user } = useSelector(state => state.auth);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [form, setForm] = useState({});
  const [loadingNext, setLoadingNext] = useState(false);
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);
  const requiredNames = useMemo(() => fields.filter(f => f.required).map(f => f.name), [fields]);
  console.log('bank information', form);

  useEffect(() => {
    if (fields && fields.length > 0) {
      const initialForm = {};
      fields.forEach(field => {
        initialForm[field.name] = reduxData ? reduxData[field.name] || '' : '';
        if (field?.conditional_fields?.length > 0) {
          field?.conditional_fields?.forEach(cf => {
            const fieldName = `${field.name}/${cf?.name}`;
            console.log('fieldname is ', fieldName);
            initialForm[fieldName] = reduxData ? reduxData[fieldName] || '' : '';
          });
        }
      });
      setForm(initialForm);
    }
  }, [fields, name, reduxData]);

  useEffect(() => {
    const allFilled = requiredNames.every(name => {
      const val = form[name];
      if (val == null) return false;
      if (typeof val === 'string') return val.trim() !== '';
      if (Array.isArray(val))
        return (
          val.length > 0 &&
          val.every(item =>
            typeof item === 'object'
              ? Object.values(item).every(v => v?.toString().trim() !== '')
              : item?.toString().trim() !== ''
          )
        );
      if (typeof val === 'object') return Object.values(val).every(v => v?.toString().trim() !== '');

      return true;
    });
    setIsAllRequiredFieldsFilled(allFilled);
  }, [form, requiredNames]);
  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
        <div className="flex gap-2">
          <Button onClick={() => saveInProgress({ data: form, name: title })} label={'Save in Draft'} />
          {user?._id && user.role !== 'guest' && (
            <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
          )}
          <Button onClick={() => setUpdateSectionFromatingModal(true)} label={'Update Display Text'} />
        </div>
      </div>
      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} />
        </Modal>
      )}
      {step?.ai_formatting && (
        <div className="flex w-full items-end justify-between gap-3">
          <div
            dangerouslySetInnerHTML={{
              __html: step?.ai_formatting,
            }}
          />
        </div>
      )}
      {/* <h5 className="text-textPrimary text-base">Provide average transactions</h5> */}
      {fields?.map((field, index) => {
        if (field.name === 'main_owner_own_25_percent_or_more' || field.type === 'block') return null;
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
      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button
              className={`${(!isAllRequiredFieldsFilled || loadingNext) && 'pointer-events-none cursor-not-allowed opacity-20'}`}
              disabled={!isAllRequiredFieldsFilled || loadingNext}
              label={isAllRequiredFieldsFilled || loadingNext ? 'Next' : 'Some Required Fields are Missing'}
              onClick={() => handleNext({ data: form, name: title, setLoadingNext })}
            />
          ) : (
            <Button
              disabled={formLoading || loadingNext}
              className={`${formLoading || loadingNext ? 'pinter-events-none cursor-not-allowed opacity-20' : ''}`}
              label={'Submit'}
              onClick={() => handleSubmit({ data: form, name: title, setLoadingNext })}
            />
          )}
        </div>
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            isArticleForm
            sectionId={_id}
            fields={fields}
            formRefetch={formRefetch}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default ProcessingInfo;
