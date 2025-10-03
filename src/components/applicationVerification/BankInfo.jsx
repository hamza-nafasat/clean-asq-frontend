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
import { CheckCircle, XCircle } from 'lucide-react';
import { FIELD_TYPES } from '@/data/constants';
import CustomizationFieldsModal from './companyInfo/CustomizationFieldsModal';
import Modal from '../shared/small/Modal';
import { useSelector } from 'react-redux';
import { EditSectionDisplayTextFromatingModal } from '../shared/small/EditSectionDisplayTextFromatingModal';
import { PencilIcon } from 'lucide-react';
import SignatureBox from '../shared/SignatureBox';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import { toast } from 'react-toastify';
import { useGetBankLookupQuery } from '@/redux/apis/formApis';

function BankInfo({
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
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const { idMissionData } = useSelector(state => state.auth);
  const requiredNames = useMemo(() => fields.filter(f => f.required).map(f => f.name), [fields]);
  const [lookupRouting, setLookupRouting] = useState(null);
  const [accMatch, setAccMatch] = useState(false);
  const { data, refetch, isFetching } = useGetBankLookupQuery(lookupRouting, {
    skip: !lookupRouting,
  });
  const [error] = useState(null);
  const [bankModal, setBankModal] = useState(null);

  const signatureUploadHandler = async file => {
    if (!file) return toast.error('Please select a file');

    if (file) {
      const oldSign = form?.['signature'];
      if (oldSign?.publicId) {
        console.log('i am running');
        const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
        if (!result) return toast.error('File Not Deleted Please Try Again');
      }
      const res = await uploadImageOnCloudinary(file);
      if (!res.publicId || !res.secureUrl || !res.resourceType) {
        return toast.error('File Not Uploaded Please Try Again');
      }
      setForm(prev => ({ ...prev, signature: res }));
    }
  };

  useEffect(() => {
    if (data?.data) {
      const result = data?.data;
      if (Array.isArray(result.bankDetailsList) && result.bankDetailsList.length > 0) {
        setBankModal(result.bankDetailsList?.[0]);
      } else {
        setBankModal({});
      }
    }
  }, [data]);

  useEffect(() => {
    const isMatch =
      form.bank_account_number &&
      form.confirm_bank_account_number &&
      form.bank_account_number === form.confirm_bank_account_number;

    setAccMatch(isMatch);
  }, [form.bank_account_number, form.confirm_bank_account_number]);

  useEffect(() => {
    if (fields && fields.length > 0) {
      const initialForm = {};
      fields.forEach(field => {
        initialForm[field.name] = reduxData ? reduxData[field.name] || '' : '';
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

  // check all required fields filled
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

    let isSignatureDone = true;
    if (isSignature) {
      let dataOfSign = form?.['signature'];
      if (!dataOfSign?.publicId || !dataOfSign?.secureUrl || !dataOfSign?.resourceType) {
        isSignatureDone = false;
      }
    }
    setIsAllRequiredFieldsFilled(allFilled && isSignatureDone);
  }, [form, isSignature, requiredNames]);

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

      {fields?.length > 0 &&
        fields.map((field, index) => {
          if (field.name === 'bank_routing_number') {
            return (
              <div key={index}>
                <div className="mt-4 flex items-end gap-2">
                  <OtherInputType
                    field={field}
                    placeholder={field.placeholder}
                    form={form}
                    setForm={setForm}
                    className="flex-1"
                  />
                  <Button
                    label={isFetching ? 'Checking...' : 'Check'}
                    onClick={() => {
                      if (form[field?.name]) {
                        setLookupRouting(form?.[field?.name]);
                        if (refetch) refetch();
                      }
                    }}
                  />
                </div>
                {error && <p className="text-red-500">{error}</p>}
              </div>
            );
          }

          if (field.name === 'confirm_bank_account_number') {
            const isMatch = form.bank_account_number && form[field.name] === form.bank_account_number;
            return (
              <div key={index} className="relative mt-4">
                <OtherInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={form}
                  setForm={setForm}
                  className="w-full pr-10"
                  isConfirmField
                />
                <div className="mt-2 flex items-center gap-2">
                  {form[field.name] && (
                    <span className="">
                      {isMatch ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </span>
                  )}
                  <p className="text-xs text-gray-500">Please type your account number manually (no copy/paste).</p>
                </div>
              </div>
            );
          }

          if (field.name === 'bank_account_holder_name') {
            const suggestedName = idMissionData?.name || '';
            const typedName = form[field.name] || '';
            const shouldShowSuggestion =
              suggestedName &&
              typedName.length > 0 &&
              suggestedName.toLowerCase().includes(typedName.toLowerCase()) &&
              suggestedName !== typedName;

            return (
              <div key={index} className="relative mt-4">
                <OtherInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={form}
                  setForm={setForm}
                  className="w-full"
                />
                {shouldShowSuggestion && (
                  <div
                    className="absolute top-full left-0 mt-1 w-full cursor-pointer rounded-md border bg-white p-2 text-sm shadow hover:bg-gray-100"
                    onClick={() => {
                      setForm(prev => ({ ...prev, [field.name]: suggestedName }));
                    }}
                  >
                    Use "{suggestedName}"
                  </div>
                )}
              </div>
            );
          }

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

      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={() => handleNext({ data: form, name: title, setLoadingNext })}
              className={`${(!isAllRequiredFieldsFilled || loadingNext || !accMatch) && 'pointer-events-none cursor-not-allowed opacity-20'}`}
              disabled={!isAllRequiredFieldsFilled || loadingNext || !accMatch}
              label={!isAllRequiredFieldsFilled || !accMatch ? 'Some Required Fields are Missing' : 'Next'}
            />
          ) : (
            <Button
              disabled={formLoading || !loadingNext}
              className={`${(formLoading || !loadingNext) && 'pinter-events-none cursor-not-allowed opacity-20'}`}
              label={'Submit'}
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
      {bankModal && (
        <Modal title={'Bank for your routing number '} isOpen={true} onClose={() => setBankModal(null)}>
          {bankModal.bankName ? (
            <>
              <p className="mb-6 leading-relaxed text-gray-600">
                That routing number belongs to <span className="font-semibold text-gray-900">{bankModal.bankName}</span>
                . Is this the bank you intended to enter?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  label="No"
                  onClick={() => setBankModal(null)}
                  className="rounded-lg px-4 py-2"
                />
                <Button
                  label="Yes"
                  onClick={() => {
                    setForm(prev => ({ ...prev, bank_name: bankModal.bankName }));
                    setBankModal(null);
                  }}
                  className="rounded-lg px-4 py-2"
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-3 text-xl font-semibold text-red-600">
                We could not identify a bank with this routing number. Please double-check the number or try again.
              </h2>
              <div className="flex justify-end">
                <Button label="Close" onClick={() => setBankModal(null)} className="rounded-lg px-4 py-2" />
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

export default BankInfo;
