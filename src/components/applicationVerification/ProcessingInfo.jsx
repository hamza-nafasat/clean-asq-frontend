import { FIELD_TYPES } from '@/data/constants';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
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
import SignatureBox from '../shared/SignatureBox';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import { toast } from 'react-toastify';

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
  isSignature,
}) {
  const { user } = useSelector(state => state.auth);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [form, setForm] = useState({});
  const [loadingNext, setLoadingNext] = useState(false);
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
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
      }
    } catch (error) {
      console.log('error while uploading signature', error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

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
  }, [fields, isSignature, name, reduxData]);

  // check required fields
  useEffect(() => {
    if (isCreator) {
      setIsAllRequiredFieldsFilled(true);
      return;
    }
    const allFilled = requiredNames.some(name => {
      const val = form[name];
      if (!val) return false;
      let allConditionalComplete = true;
      const conditionalFieldsKeys = Object.keys(form).filter(key => key.includes(`${name}/`));
      conditionalFieldsKeys.some(innerName => {
        const innerVal = form[innerName];
        if (!innerVal) allConditionalComplete = false;
      });
      if (!allConditionalComplete) return false;
      if (val == null) return false;
      if (typeof val === 'string') return val.trim() !== '';
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
        <div className="flex gap-2">
          <Button onClick={() => saveInProgress({ data: form, name: title })} label={'Save in Draft'} />
          {isCreator && (
            <>
              <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
              <Button onClick={() => setUpdateSectionFromatingModal(true)} label={'Update Display Text'} />
            </>
          )}
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
          {currentStep < totalSteps - 1 ? (
            <Button
              className={`${(!isAllRequiredFieldsFilled || loadingNext) && 'pointer-events-none cursor-not-allowed opacity-20'}`}
              disabled={!isAllRequiredFieldsFilled || loadingNext}
              label={isAllRequiredFieldsFilled ? 'Next' : 'Some Required Fields are Missing'}
              onClick={() => handleNext({ data: form, name: title, setLoadingNext })}
            />
          ) : (
            <Button
              disabled={formLoading || loadingNext}
              className={`${formLoading || loadingNext ? 'pinter-events-none cursor-not-allowed opacity-20' : ''}`}
              label={isAllRequiredFieldsFilled ? 'submit' : 'Some Required Fields are Missing'}
              onClick={() => handleSubmit({ data: form, name: title, setLoadingNext })}
            />
          )}
        </div>
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            sectionId={_id}
            fields={fields}
            section={step}
            formRefetch={formRefetch}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default ProcessingInfo;
