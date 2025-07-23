import Star from '@/assets/svgs/UserApplicationForm/Star';
import TextField from '@/components/shared/small/TextField';
import { useEffect, useMemo, useState } from 'react';
import { GoPlus } from 'react-icons/go';
import Button from '../shared/small/Button';
import {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from '../shared/small/DynamicField';
import { toast } from 'react-toastify';
import Modal from '../shared/small/Modal';
import CustomizationFieldsModal from './companyInfo/CustomizationFieldsModal';
import { FIELD_TYPES } from '@/data/constants';

function CompanyOwners({
  _id,
  formRefetch,
  name,
  handleNext,
  handlePrevious,
  currentStep,
  totalSteps,
  handleSubmit,
  formLoading,
  reduxData,
  fields,
  blocks,
}) {
  const [fieldForCustomization, setFieldForCustomization] = useState({});
  const [otherOwnersStateName, setOtherOwnersStateName] = useState('');
  const [customizeModal, setCustomizeModal] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [form, setForm] = useState({});
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);

  const requiredNames = useMemo(() => formFields.filter(f => f.required).map(f => f.name), [formFields]);

  console.log('company owners', form);

  const handleChangeOnOtherOwnersData = (e, index) => {
    const updatedOwners = [...(form[otherOwnersStateName] || [])];
    updatedOwners[index] = {
      ...updatedOwners[index],
      [e.target.name]: e.target.value,
    };
    setForm(prev => ({ ...prev, [otherOwnersStateName]: updatedOwners }));
  };

  const handleRemoveOtherOwnersData = index => {
    const updatedOwners = [...(form[otherOwnersStateName] || [])];
    updatedOwners.splice(index, 1);
    setForm(prev => ({ ...prev, [otherOwnersStateName]: updatedOwners }));
  };

  const handleAddOwner = () => {
    setForm(prev => ({
      ...prev,
      [otherOwnersStateName]: [...(prev[otherOwnersStateName] || []), { name: '', email: '', ssn: '', percentage: '' }],
    }));
  };

  const nextHandler = ({ data, name }) => {
    let isValid = Object.values(data).every(value => {
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.every(item => Object.values(item).every(val => val.trim() !== ''));
    });
    if (isValid)
      isValid = data?.[otherOwnersStateName]?.every(owner => Object.values(owner).every(value => value.trim() !== ''));
    if (!isValid) return toast.error('Please fill all the fields');
    handleNext({ data, name });
  };

  useEffect(() => {
    const isApplicantOwner = 'applicant_is_main_owner';
    const isApplicantNotOwner = 'applicant_is_not_main_owner';
    if (form?.[isApplicantOwner] === 'yes') {
      const blockFields = blocks.find(block => block?.name === isApplicantOwner)?.fields ?? [];
      const newFields = [fields[0], ...blockFields, ...fields.slice(1)];
      setFormFields(newFields);
    } else if (form?.[isApplicantOwner] === 'no') {
      const blockFields = blocks.find(block => block?.name === isApplicantNotOwner)?.fields ?? [];
      const newFields = [fields[0], ...blockFields, ...fields.slice(1)];
      setFormFields(newFields);
    }
  }, [blocks, fields, form]);

  // making form states according changing fields
  // --------------------------------------------

  useEffect(() => {
    if (!formFields?.length) return;
    // 1) Build the “canonical” shape for this form
    const initialForm = {};
    formFields.forEach(field => {
      if (field.type === 'block' && field.name === 'additional_owner') {
        setOtherOwnersStateName(field.name);
        const initialState = { name: '', email: '', ssn: '', percentage: '' };
        initialForm[field.name] = reduxData?.[field.name] ?? [initialState];
      } else {
        initialForm[field.name] = reduxData?.[field.name] ?? '';
      }
    });
    // 2) Figure out what to add…
    const toAdd = Object.fromEntries(Object.entries(initialForm).filter(([key]) => !(key in form)));
    // 3) …and what to remove
    const toRemoveKeys = Object.keys(form).filter(key => !(key in initialForm));
    // 4) If there’s nothing to do, bail out
    if (Object.keys(toAdd).length === 0 && toRemoveKeys.length === 0) return;
    // 5) Apply both additions and deletions in one go
    setForm(prev => {
      // Start with everything that *should* stay
      const cleaned = Object.fromEntries(Object.entries(prev).filter(([key]) => !toRemoveKeys.includes(key)));
      // Then merge in any brand-new keys
      return { ...cleaned, ...toAdd };
    });
  }, [form, formFields, reduxData]);

  // create fields for this section and also for customization
  // ---------------------------------------------------------
  useEffect(() => {
    if (fields && fields.length > 0) {
      setFormFields([...fields]);
      const allPossibleFieldsOfThisSection = [...fields];
      blocks.forEach(block => {
        allPossibleFieldsOfThisSection.push(...block.fields);
      });
      setFieldForCustomization(allPossibleFieldsOfThisSection);
    }
  }, [blocks, fields]);

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
      return true;
    });
    setIsAllRequiredFieldsFilled(allFilled);
  }, [form, requiredNames]);

  return (
    <div className="h-full overflow-auto">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
        <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
      </div>
      <div className="mt-5">
        <div className="h-full overflow-auto pb-3">
          <div className="rounded-[8px] border border-[#F0F0F0] p-4">
            <div className="flex flex-col justify-between gap-2 border-b border-[#E8E8E8] pb-3 sm:flex-row sm:gap-0">
              <div>
                <h2 className="text-textPrimary text-[22px] font-medium">Beneficial Owner Information</h2>
                <p className="text-textPrimary">Provide information about the beneficial owner.</p>
              </div>
              <div className="flex justify-end">
                <Button
                  icon={Star}
                  className="!text-textPrimary !h-fit !rounded-[4px] !border-none !bg-[#F5F5F5] !shadow-md hover:!bg-gray-300"
                  label="AI Help"
                />
              </div>
            </div>

            {formFields?.map((field, index) => {
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
            {form?.additional_owners_own_25_percent_or_more == 'yes' ? (
              <div className="flex flex-col gap-3">
                {form?.[otherOwnersStateName]?.map(({ name, email, ssn, percentage }, index) => (
                  <div
                    key={index}
                    className="mt-3 flex min-w-full flex-col items-center justify-between gap-4 md:flex-row"
                  >
                    <div className="wrap flex w-full min-w-[400px] gap-3">
                      <TextField
                        label="Owner Name"
                        name="name"
                        value={name}
                        onChange={e => handleChangeOnOtherOwnersData(e, index)}
                      />
                      <TextField
                        name="email"
                        label="Email Address"
                        value={email}
                        onChange={e => handleChangeOnOtherOwnersData(e, index)}
                      />
                      <TextField
                        name="ssn"
                        label="Social Security Number"
                        value={ssn}
                        onChange={e => handleChangeOnOtherOwnersData(e, index)}
                      />
                      <TextField
                        name="percentage"
                        label="Ownership Percentage?"
                        value={percentage}
                        onChange={e => handleChangeOnOtherOwnersData(e, index)}
                      />
                    </div>
                    <div className="top-3 flex justify-end md:relative">
                      <Button
                        onClick={() => handleRemoveOtherOwnersData(index)}
                        className="!py-2.5"
                        variant="secondary"
                        label="Remove"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex w-full justify-end">
                  <Button
                    onClick={handleAddOwner}
                    icon={GoPlus}
                    className="!text-textPrimary !rounded-[4px] !border !border-[#D5D8DD] !bg-[#F5F5F5] !font-medium hover:!bg-gray-200"
                    label="Add Owner"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label="Previous" onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={() => nextHandler({ data: form, name })}
              className={`${!isAllRequiredFieldsFilled && 'pointer-events-none cursor-not-allowed opacity-50'}`}
              disabled={!isAllRequiredFieldsFilled}
              label={isAllRequiredFieldsFilled ? 'Next' : 'Some Required Fields are Missing'}
            />
          ) : (
            <Button
              disabled={formLoading}
              className={formLoading ? 'pointer-events-none cursor-not-allowed opacity-50' : ''}
              label="Submit"
              onClick={() => handleSubmit({ data: form, name })}
            />
          )}
        </div>
      </div>

      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            sectionId={_id}
            fields={fields}
            blocks={blocks}
            formRefetch={formRefetch}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default CompanyOwners;
