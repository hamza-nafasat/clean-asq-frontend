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
import { FIELD_TYPES } from '@/data/constants';
import CustomizationFieldsModal from './companyInfo/CustomizationFieldsModal';
import Modal from '../shared/small/Modal';
import { useSelector } from 'react-redux';
import { EditSectionDisplayTextFromatingModal } from '../shared/small/EditSectionDisplayTextFromatingModal';
import { PencilIcon } from 'lucide-react';
import { useGetBankLookupQuery } from '@/redux/apis/wiseApi';

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
  const { data, refetch, isFetching } = useGetBankLookupQuery(lookupRouting, {
    skip: !lookupRouting,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fields && fields.length > 0) {
      const initialForm = {};
      fields.forEach(field => {
        initialForm[field.name] = reduxData ? reduxData[field.name] || '' : '';
      });
      setForm(initialForm);
    }
  }, [fields, name, reduxData]);
  useEffect(() => {
    if (data) {
      if (Array.isArray(data.bankDetailsList) && data.bankDetailsList.length === 0) {
        setError('No bank found for this routing number');
      } else {
        setError(null);
      }
    }
  }, [data]);

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

  useEffect(() => {
    if (data?.bankDetailsList?.length > 0) {
      const bankName = data.bankDetailsList[0].bankName;
      if (bankName) {
        const confirmed = window.confirm(`We found: ${bankName}. Do you want to autofill?`);
        if (confirmed) {
          setForm(prev => ({ ...prev, bank_name: bankName }));
        }
      }
      setLookupRouting(null);
    }
  }, [data]);

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
              <>
                <div key={index} className="mt-4 flex items-end gap-2">
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
                      if (form[field.name]) {
                        setLookupRouting(form[field.name]);
                        refetch();
                      }
                    }}
                  />
                </div>
                {error && <p className="text-red-500">{error}</p>}
              </>
            );
          }

          if (field.name === 'confirm_bank_account_number') {
            return (
              <div key={index} className="mt-4">
                <OtherInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={form}
                  setForm={setForm}
                  className={''}
                  isConfirmField
                />
                <p className="text-xs text-gray-500">Please type your account number manually (no copy/paste).</p>
              </div>
            );
          }

          if (field.name === 'bank_account_holder_name') {
            return (
              <div className="flex items-end gap-2">
                <div key={index} className="mt-4 flex-1">
                  <OtherInputType
                    field={field}
                    placeholder={field.placeholder}
                    form={form}
                    setForm={setForm}
                    className={''}
                  />
                </div>
                <Button
                  label={`Fill with ${idMissionData.name}`}
                  onClick={() => setForm(prev => ({ ...prev, [field.name]: idMissionData.name }))}
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

      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={() => handleNext({ data: form, name: title, setLoadingNext })}
              className={`${(!isAllRequiredFieldsFilled || loadingNext) && 'pointer-events-none cursor-not-allowed opacity-20'}`}
              disabled={!isAllRequiredFieldsFilled || loadingNext}
              label={isAllRequiredFieldsFilled ? 'Next' : 'Some Required Fields are Missing'}
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
            formRefetch={formRefetch}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default BankInfo;
