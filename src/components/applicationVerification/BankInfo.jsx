import { FIELD_TYPES } from '@/data/constants';
import {
  useGetAllSearchStrategiesQuery,
  useGetBankLookupMutation,
  useUpdateFormSectionMutation,
} from '@/redux/apis/formApis';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import { CheckCircle, X, XCircle } from 'lucide-react';
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
import CustomLoading from '../shared/small/CustomLoading';

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
  const { formData } = useSelector(state => state?.form);

  const [ownersFromLookup, setOwnersFromLookup] = useState([]);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [form, setForm] = useState({});
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const requiredNames = useMemo(() => fields.filter(f => f.required).map(f => f.name), [fields]);
  const [accMatch, setAccMatch] = useState(false);
  const [getBankLookup, { isLoading }] = useGetBankLookupMutation();
  const [error] = useState(null);
  const [bankModal, setBankModal] = useState(null);
  const [ownerSuggesstionsModal, setOwnerSuggesstionsModal] = useState(false);

  const isCreator = user?._id && user?._id === step?.owner && user?.role !== 'guest';

  // add owners for suggestions
  useEffect(() => {
    if (formData) {
      const lookupData = formData?.company_lookup_data;
      const searchField = step?.ownerSuggesstions || ['founders'];
      const founders = [];
      searchField.forEach(field => {
        let data = lookupData?.find(item => item?.name == field)?.result;
        if (Array.isArray(data) && typeof data === 'object') {
          founders.push(...data);
        } else if (typeof data === 'string') {
          founders.push(data);
        } else if (typeof data === 'number') {
          founders.push(data);
        }
      });
      if (founders?.length) {
        const uniqueFounders = founders.filter((item, index) => founders.indexOf(item) === index);
        setOwnersFromLookup(uniqueFounders);
      } else {
        setOwnersFromLookup([]);
      }
    }
  }, [formData, step?.ownerSuggesstions]);

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

  const getLookupRoutingHandler = async routing => {
    try {
      const res = await getBankLookup(routing).unwrap();
      if (res.success && Array.isArray(res?.data?.bankDetailsList) && res?.data?.bankDetailsList?.length > 0) {
        setBankModal(res?.data?.bankDetailsList?.[0]);
      } else {
        setBankModal(null);
        toast.error(
          'we’re unable to verify this routing number, if you are sure it’s correct please continue. Otherwise correct any errors before moving forward.'
        );
      }
    } catch (error) {
      console.log('error while getting bank lookup', error);
      setBankModal(null);
      toast.error(
        'we’re unable to verify this routing number, if you are sure it’s correct please continue. Otherwise correct any errors before moving forward.'
      );
    }
  };

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
    <>
      {ownerSuggesstionsModal && (
        <Modal title="Owners Suggesstions" onClose={() => setOwnerSuggesstionsModal(false)}>
          <OwnerSuggesstionsModal
            selectedSuggesstions={step?.ownerSuggesstions}
            sectionId={step?._id}
            ownerSuggesstionsModal={ownerSuggesstionsModal}
            setOwnerSuggesstionsModal={setOwnerSuggesstionsModal}
          />
        </Modal>
      )}
      <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
        <div className="mb-10 flex items-center justify-between">
          <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
          <div className="flex gap-2">
            <Button onClick={() => saveInProgress({ data: form, name: title })} label={'Save my progress'} />
            {isCreator && (
              <>
                <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
                <Button onClick={() => setOwnerSuggesstionsModal(true)} label={'Owners Suggesstions'} />
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
          <div className="mb-4 flex w-full items-end justify-between gap-3">
            <div
              dangerouslySetInnerHTML={{
                __html: String(step?.ai_formatting || '').replace(/<a(\s+.*?)?>/g, match => {
                  if (match.includes('target=')) return match; // avoid duplicates
                  return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
                }),
              }}
            />
          </div>
        )}

        {fields?.length > 0 &&
          fields.map((field, index) => {
            if (field.name === 'bank_routing_number') {
              return (
                <div key={index}>
                  <div className="mt-4 flex items-center gap-2">
                    <OtherInputType
                      field={field}
                      placeholder={field.placeholder}
                      form={form}
                      setForm={setForm}
                      className="flex-1"
                    />
                    <Button
                      label={isLoading ? 'Entering...' : 'Enter'}
                      className="mt-8"
                      onClick={async () => {
                        if (form[field?.name]) {
                          getLookupRoutingHandler(form?.[field?.name]);
                          // setLookupRouting(form?.[field?.name]);
                          // if (refetch) {
                          //   await refetch();
                          // }
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
              return (
                <div key={index} className="relative mt-4">
                  <OtherInputType
                    field={field}
                    suggestions={ownersFromLookup}
                    placeholder={field.placeholder}
                    form={form}
                    setForm={setForm}
                    className="w-full"
                  />
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
                className={`${(!isAllRequiredFieldsFilled || loadingNext || (!accMatch && !isCreator)) && 'pointer-events-none cursor-not-allowed opacity-20'}`}
                disabled={!isAllRequiredFieldsFilled || loadingNext || (!accMatch && !isCreator)}
                label={
                  !isAllRequiredFieldsFilled || (!accMatch && !isCreator) ? 'Some Required Fields are Missing' : 'Next'
                }
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
          <Modal title={'Bank for your routing number '} isOpen={!!bankModal} onClose={() => setBankModal(null)}>
            {bankModal?.bankName ? (
              <>
                <p className="mb-6 leading-relaxed text-gray-600">
                  That routing number belongs to{' '}
                  <span className="font-semibold text-gray-900">{bankModal.bankName}</span>. Is this the bank you
                  intended to enter?
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
    </>
  );
}

export const OwnerSuggesstionsModal = ({ selectedSuggesstions, setOwnerSuggesstionsModal, sectionId }) => {
  const [selectedOwners, setSelectedOwners] = useState(Array.isArray(selectedSuggesstions) ? selectedSuggesstions : []);
  const { data, isLoading } = useGetAllSearchStrategiesQuery();
  const [suggesstions, setSuggesstions] = useState([]);
  const [updateFormSection, { isLoading: isUpdating }] = useUpdateFormSectionMutation();

  const updateFormSectionHandler = async () => {
    try {
      if (!prompt) return toast.error('Please enter display text and AI formatting');
      const res = await updateFormSection({
        _id: sectionId,
        data: { ownerSuggesstions: selectedOwners },
      }).unwrap();
      if (res.success) {
        toast.success('Section Updated Successfully');
        setOwnerSuggesstionsModal(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to update section');
    }
  };

  const handleSelect = e => {
    const value = e.target.value;
    if (value && !selectedOwners.includes(value)) {
      setSelectedOwners(prev => [...prev, value]);
      setSuggesstions(prev => prev.filter(o => o !== value));
    }
  };

  const removeOwner = owner => {
    setSelectedOwners(prev => prev.filter(o => o !== owner));
    setSuggesstions(prev => [...prev, owner]);
  };

  useEffect(() => {
    if (data?.data && !suggesstions?.length) {
      setSuggesstions(data?.data?.map(item => item?.searchObjectKey) || []);
    }
  }, [data, suggesstions?.length]);

  return isLoading ? (
    <CustomLoading />
  ) : (
    <div className="flex flex-col gap-6 p-6">
      {/* Multi-select */}
      <div>
        <label htmlFor="owners" className="block text-sm font-medium text-gray-700">
          Select Owners
        </label>
        <select
          id="owners"
          onChange={handleSelect}
          className="mt-2 w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose Owner Keys to Suggest</option>
          {suggesstions.map((owner, index) => (
            <option key={`owner-${index}`} value={owner}>
              {owner}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Owners */}
      <div className="flex flex-wrap gap-2">
        {selectedOwners.map(owner => (
          <div key={owner} className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700">
            <span>{owner}</span>
            <button
              type="button"
              onClick={() => removeOwner(owner)}
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={() => setOwnerSuggesstionsModal(false)} label={'Cancel'} />
        <Button
          label={isUpdating ? 'Saving...' : 'Save'}
          onClick={updateFormSectionHandler}
          disabled={selectedOwners.length === 0}
        />
      </div>
    </div>
  );
};

export default BankInfo;
