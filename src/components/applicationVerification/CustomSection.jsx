import { FIELD_TYPES } from '@/data/constants';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SignatureBox from '../shared/SignatureBox';
import Button from '../shared/small/Button';
import {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from '../shared/small/DynamicField';
import { EditSectionDisplayTextFromatingModal } from '../shared/small/EditSectionDisplayTextFromatingModal';
import Modal from '../shared/small/Modal';
import CustomizationFieldsModal from './companyInfo/CustomizationFieldsModal';

function CustomSection({
  sectionKey,
  fields,
  name,
  currentStep,
  totalSteps,
  handleNext,
  handlePrevious,
  handleSubmit,
  formRefetch,
  _id,
  saveInProgress,
  step,
  reduxData,
  isSignature,
}) {
  const { user } = useSelector(state => state.auth);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [form, setForm] = useState({});
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);
  const requiredNames = useMemo(() => fields.filter(f => f.required).map(f => f.name), [fields]);
  const isCreator = user?._id && user?._id === step?.owner && user?.role !== 'guest';

  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error('Please select a file');
      if (file) {
        const oldSign = form?.['signature'];
        if (oldSign?.publicId) {
          const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
          if (!result) return toast.error('File Not Deleted Please Try Again');
        }
        const res = await uploadImageOnCloudinary(file);
        if (!res.publicId || !res.secureUrl || !res.resourceType) {
          return toast.error('File Not Uploaded Please Try Again');
        }
        setForm(prev => ({ ...prev, signature: res }));
        toast.success('Signature uploaded successfully');
      }
    } catch (error) {
      console.log('error while uploading signature', error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  useEffect(() => {
    const formFields = {};
    if (fields?.length) {
      fields?.forEach(field => {
        formFields[field?.name] = reduxData?.[field?.name] || '';
      });
      setForm(formFields);
    }
    if (isSignature) {
      const isSignatureExistingData = {};
      if (reduxData?.signature?.publicId) isSignatureExistingData.publicId = reduxData?.signature?.publicId;
      if (reduxData?.signature?.secureUrl) isSignatureExistingData.secureUrl = reduxData?.signature?.secureUrl;
      if (reduxData?.signature?.resourceType) isSignatureExistingData.resourceType = reduxData?.signature?.resourceType;
      setForm(prev => ({
        ...prev,
        ['signature']: isSignatureExistingData?.publicId
          ? isSignatureExistingData
          : { publicId: '', secureUrl: '', resourceType: '' },
      }));
    }
  }, [fields, isSignature, reduxData]);

  useEffect(() => {
    if (isCreator) {
      setIsAllRequiredFieldsFilled(true);
      return;
    }
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

    let isSignatureDone = true;
    if (isSignature) {
      let dataOfSign = form?.['signature'];
      if (!dataOfSign?.publicId || !dataOfSign?.secureUrl || !dataOfSign?.resourceType) {
        isSignatureDone = false;
      }
    }
    setIsAllRequiredFieldsFilled(allFilled && isSignatureDone);
  }, [form, isCreator, isSignature, requiredNames]);
  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
        <div className="flex gap-2"></div>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={() => saveInProgress({ data: form, name: sectionKey })} label={'Save my progress'} />
        {isCreator && (
          <>
            <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
            <Button onClick={() => setUpdateSectionFromatingModal(true)} label={'Update Display Text'} />
          </>
        )}
      </div>

      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} setModal={setUpdateSectionFromatingModal} />
        </Modal>
      )}
      {step?.ai_formatting && (
        <div className="flex w-full items-end justify-between gap-3">
          <div
            className="mt-2 mb-4 w-full"
            dangerouslySetInnerHTML={{
              __html: String(step?.ai_formatting || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      <div className="mt-6 flex flex-col gap-4">
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
      </div>
      <div className="mt-4">
        {isSignature && (
          <SignatureBox
            step={step}
            onSave={signatureUploadHandler}
            oldSignatureUrl={form?.signature?.secureUrl || ''}
          />
        )}
      </div>

      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 2 ? (
            <Button
              disabled={!isAllRequiredFieldsFilled}
              label={!isAllRequiredFieldsFilled ? 'Some required fields are missing' : 'Next'}
              onClick={() => handleNext({ data: form, name: sectionKey, setLoadingNext })}
            />
          ) : (
            <Button
              disabled={!isAllRequiredFieldsFilled || loadingNext}
              className={`${!isAllRequiredFieldsFilled || loadingNext ? 'pointer-events-none cursor-not-allowed opacity-20' : 'opacity-100'}`}
              label={!isAllRequiredFieldsFilled ? 'Some required fields are missing' : 'Submit'}
              onClick={() => handleSubmit({ data: form, name: sectionKey, setLoadingNext })}
            />
          )}
        </div>
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            sectionId={_id}
            fields={fields}
            formRefetch={formRefetch}
            onClose={() => setCustomizeModal(false)}
            section={step}
          />
        </Modal>
      )}
    </div>
  );
}

export default CustomSection;
