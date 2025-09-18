import Star from '@/assets/svgs/UserApplicationForm/Star';
import TextField from '@/components/shared/small/TextField';
import { FIELD_TYPES } from '@/data/constants';
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
import Modal from '../shared/small/Modal';
import CustomizationOwnerFieldsModal from './companyInfo/CustomizationOwnerFieldsModal';
import { useSelector } from 'react-redux';
import { EditSectionDisplayTextFromatingModal } from '../shared/small/EditSectionDisplayTextFromatingModal';
import { PencilIcon } from 'lucide-react';

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
  title,
  saveInProgress,
  step,
}) {
  const { user } = useSelector(state => state.auth);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const { lookupData } = useSelector(state => state?.company);
  const [ownersFromLookup, setOwnersFromLookup] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [loadingNext, setLoadingNext] = useState(false);
  const [otherOwnersStateName, setOtherOwnersStateName] = useState('');
  const [customizeModal, setCustomizeModal] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [form, setForm] = useState({});
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [submitButtonText, setSubmitButtonText] = useState('Some Required Fields are Missing');

  const requiredNames = useMemo(() => formFields.filter(f => f.required).map(f => f.name), [formFields]);

  console.log('company owners', form);
  // console.log('company owners', ownersFromLookup);
  // console.log('filtered owners', filteredOwners);

  // console.log('company owners', form);

  const handleChangeOnOtherOwnersData = (e, index, isFilter = false) => {
    if (e.target.name == 'name') {
      if (e.target.value) {
        setFilteredOwners(ownersFromLookup.filter(owner => owner.toLowerCase().includes(e.target.value.toLowerCase())));
      } else {
        setFilteredOwners([]);
      }
    }
    const updatedOwners = [...(form[otherOwnersStateName] || [])];
    updatedOwners[index] = {
      ...updatedOwners[index],
      [e.target.name]: e.target.value,
    };
    setForm(prev => ({ ...prev, [otherOwnersStateName]: updatedOwners }));
    if (isFilter) setFilteredOwners([]);
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

  useEffect(() => {
    const isApplicantOwner = 'applicant_is_primary_operator_or_owner_with_more_then_25percentage';

    let baseFields;
    if (form?.[isApplicantOwner] === 'yes') {
      const blockFields = blocks.find(block => block?.name === isApplicantOwner)?.fields ?? [];
      baseFields = [fields[0], ...blockFields, ...fields.slice(1)];
    } else if (form?.[isApplicantOwner] === 'no') {
      baseFields = [fields[0], ...fields.slice(1)];
    } else {
      baseFields = [...fields];
    }

    const percentage = Number(form?.applicant_percentage);
    const isApplicantPrimaryOperator = form?.applicant_is_also_primary_operator;
    console.log('isApplicantPrimaryOperator', isApplicantPrimaryOperator);
    const hasOperatorField = baseFields.some(f => f.name === 'applicant_is_owner_and_operator');

    // if value is les than 25 then add job title
    if (percentage >= 25 && percentage !== 0 && !hasOperatorField) {
      baseFields = baseFields.filter(f => f.name !== 'applicant_job_title');
      const newField = {
        label: 'Are you also a primary operator',
        name: 'applicant_is_also_primary_operator',
        required: true,
        aiHelp: false,
        type: 'radio',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
      };
      baseFields.splice(baseFields?.length - 2, 0, newField);
    }

    // if value is les than 25 then add applicant is also primary operator
    if (percentage < 25) {
      baseFields = baseFields.filter(f => f.name !== 'applicant_is_also_primary_operator');
    }

    // if applicant is not primary operator then change the label
    if (isApplicantPrimaryOperator === 'yes' || isApplicantPrimaryOperator === 'no') {
      // add new field or remove according to primary operator
      if (isApplicantPrimaryOperator == 'yes') {
        const newField = {
          label: 'What is your job title in the company?',
          name: 'applicant_job_title',
          required: true,
          aiHelp: false,
          type: 'text',
        };
        baseFields.splice(baseFields?.length - 2, 0, newField);
      } else {
        baseFields = baseFields.filter(f => f.name !== 'applicant_job_title');
      }
      // change label of next field according to primary operator
      const label =
        isApplicantPrimaryOperator === 'yes'
          ? 'Are there any additional primary operators and/or owners (25% or more)?:'
          : 'Are there any primary operators and/or owners (25% or more)? We need at least one primary operator.';
      // Find the last radio field
      const lastRadioFieldIndex = [...baseFields]
        .map((f, i) => ({ ...f, _index: i }))
        .reverse()
        .find(f => f.type === 'radio')?._index;
      if (typeof lastRadioFieldIndex === 'number') {
        const updatedField = {
          ...baseFields[lastRadioFieldIndex],
          label,
        };
        // Replace the field with updated label
        baseFields = [
          ...baseFields.slice(0, lastRadioFieldIndex),
          updatedField,
          ...baseFields.slice(lastRadioFieldIndex + 1),
        ];
      }
    }
    setFormFields(baseFields);
  }, [blocks, fields, form]);

  // add owners for suggestions
  useEffect(() => {
    const founders = Array.isArray(lookupData) && lookupData?.filter(item => item?.name == 'founders');
    if (founders?.length) {
      setOwnersFromLookup(founders[0]?.result);
    } else {
      setOwnersFromLookup([]);
    }
  }, [lookupData]);

  // making form states according changing fields
  // --------------------------------------------
  useEffect(() => {
    if (!formFields?.length) return;
    // 1) Build the “canonical” shape for this form
    const initialForm = {};
    formFields.forEach(field => {
      if (field.type === 'block' && field.name === 'additional_owner') {
        setOtherOwnersStateName(field.name);
        const initialState = {
          name: '',
          email: '',
          role: '',
          job_title: '',
          have_detail: '',
          phone: '',
          ssn: '',
          address: '',
          percentage: '',
          date_of_birth: '',
          driver_license_issuer: '',
          driver_license_issuer_state: '',
          driver_licence_number: '',
        };
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
    }
  }, [fields]);

  // check if all required fields are filled
  // --------------------------------------
  useEffect(() => {
    // Check if all required fields are filled
    const allFilled = requiredNames.every(name => {
      const val = form[name];
      if (val == null) return false;
      if (typeof val === 'string') return val.trim() !== '';
      if (Array.isArray(val)) {
        return (
          val.length > 0 &&
          val.every(item =>
            typeof item === 'object'
              ? Object.values(item).some(v => v?.toString().trim() !== '')
              : item?.toString().trim() !== ''
          )
        );
      }
      if (typeof val === 'object') return Object.values(val).some(v => v?.toString().trim() !== '');
      return true;
    });

    // Logic for primary operator
    let isOperatorExist = false;
    if (form?.applicant_is_also_primary_operator === 'yes') {
      isOperatorExist = true;
    } else if (!form?.applicant_is_also_primary_operator || form?.applicant_is_also_primary_operator === 'no') {
      // Check additional_owner for at least one non-empty object
      isOperatorExist =
        Array.isArray(form?.additional_owner) &&
        form.additional_owner.some(item => Object.values(item).some(v => v?.toString().trim() !== ''));
    }
    if (!isOperatorExist) setSubmitButtonText('At least one primary operator required');
    if (!allFilled) setSubmitButtonText('Some Required Fields are Missing');
    // remove field with name additional_owners_own_25_percent_or_more and save in new veriable so we can add back if value is smaller the 74
    if (form?.applicant_percentage > 75) {
      setFormFields(prev => [...prev.filter(f => f.name !== 'additional_owners_own_25_percent_or_more')]);
    }
    const isAllChecksTrue = allFilled && isOperatorExist;
    setIsAllRequiredFieldsFilled(isAllChecksTrue);
    // console.log('isOperatorExist:', isOperatorExist, 'allFilled:', allFilled, 'Final Check:', isAllChecksTrue);
  }, [form, requiredNames]);

  return (
    <div className="h-full w-full overflow-auto">
      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} />
        </Modal>
      )}

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
      {step?.ai_formatting && (
        <div className="flex w-full items-end justify-between gap-3">
          <div
            dangerouslySetInnerHTML={{
              __html: step?.ai_formatting,
            }}
          />
        </div>
      )}
      <div className="mt-5">
        <div className="h-full overflow-auto pb-3">
          <div className="rounded-[8px] border border-[#F0F0F0] p-4">
            <div className="flex flex-col justify-between gap-2 border-b border-[#E8E8E8] pb-3 sm:flex-row sm:gap-0">
              <div>
                <h2 className="text-textPrimary text-[22px] font-medium">Beneficial Owner Information</h2>
                <p className="text-textPrimary">Provide information about the beneficial owner.</p>
              </div>
              {/* <div className="flex justify-end">
                <Button
                  icon={Star}
                  className="!text-textPrimary !h-fit !rounded-[4px] !border-none !bg-[#F5F5F5] !shadow-md hover:!bg-gray-300"
                  label="AI Help"
                />
              </div> */}
            </div>

            {formFields?.map(field => {
              if (field.name === 'main_owner_own_25_percent_or_more' || field.type === 'block') return null;
              if (field.type === FIELD_TYPES.SELECT) {
                return (
                  <div key={field?.name} className="mt-4">
                    <SelectInputType field={field} form={form} setForm={setForm} className={''} />
                  </div>
                );
              }
              if (field.type === FIELD_TYPES.MULTI_CHECKBOX) {
                return (
                  <div key={field?.name} className="mt-4">
                    <MultiCheckboxInputType field={field} form={form} setForm={setForm} className={''} />
                  </div>
                );
              }
              if (field.type === FIELD_TYPES.RADIO) {
                return (
                  <div key={field?.name} className="mt-4">
                    <RadioInputType field={field} form={form} setForm={setForm} className={''} />
                  </div>
                );
              }
              if (field.type === FIELD_TYPES.RANGE) {
                return (
                  <div key={field?.name} className="mt-4">
                    <RangeInputType field={field} form={form} setForm={setForm} className={''} />
                  </div>
                );
              }
              if (field.type === FIELD_TYPES.CHECKBOX) {
                return (
                  <div key={field?.name} className="mt-4">
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
                <div key={field?.name} className="mt-4">
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
                {form?.[otherOwnersStateName]?.map(
                  (
                    {
                      name,
                      email,
                      ssn,
                      role,
                      job_title,
                      have_detail,
                      address,
                      phone,
                      percentage,
                      date_of_birth,
                      driver_license_issuer_state,
                      driver_licence_number,
                    },
                    index
                  ) => {
                    return (
                      <div
                        key={index}
                        className="mt-3 flex min-w-full flex-col items-center justify-between gap-4 border-2 border-[#066969] p-4 md:flex-row"
                      >
                        <div className="wrap flex w-full min-w-[400px] flex-col gap-3">
                          <div className="relative flex w-full gap-4">
                            <TextField
                              label="Owner or primary operator name"
                              name="name"
                              value={name}
                              onChange={e => handleChangeOnOtherOwnersData(e, index)}
                            />
                            {filteredOwners?.length > 0 && (
                              <ul className="absolute top-20 mt-1 w-full max-w-[400px] rounded border bg-white shadow">
                                {filteredOwners.map(name => (
                                  <li
                                    key={index}
                                    onClick={() =>
                                      handleChangeOnOtherOwnersData(
                                        { target: { name: 'name', value: name } },
                                        index,
                                        true
                                      )
                                    }
                                    className="cursor-pointer px-2 py-1 hover:bg-gray-200"
                                  >
                                    {name}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <TextField
                              name="email"
                              label="Email Address"
                              value={email}
                              onChange={e => handleChangeOnOtherOwnersData(e, index)}
                            />
                          </div>
                          <div className="flex w-full gap-4">
                            <RadioInputType
                              field={{
                                label: 'Role',
                                name: 'role',
                                options: [
                                  { label: 'Primary Operator', value: 'primary_operator' },
                                  { label: 'Beneficial Owner', value: 'beneficial_owner' },
                                  { label: 'both', value: 'both' },
                                ],
                                required: true,
                              }}
                              form={{ role }}
                              onChange={e => handleChangeOnOtherOwnersData(e, index)}
                            />
                            <RadioInputType
                              field={{
                                label: 'Do you have full information for this person?',
                                name: 'have_detail',
                                options: [
                                  { label: 'NO', value: 'no' },
                                  { label: 'Yes', value: 'yes' },
                                ],
                                required: true,
                              }}
                              form={{ have_detail }}
                              onChange={e => handleChangeOnOtherOwnersData(e, index)}
                            />
                          </div>

                          {(role === 'primary_operator' || role === 'both') && (
                            <div className="flex w-full gap-4">
                              <TextField
                                name="job_title"
                                label="Job Title"
                                value={job_title}
                                onChange={e => handleChangeOnOtherOwnersData(e, index)}
                              />
                            </div>
                          )}

                          {have_detail == 'yes' && (
                            <div className="flex w-full flex-col gap-4">
                              <div className="flex flex-wrap gap-4">
                                <TextField
                                  name="phone"
                                  label="Phone Number"
                                  value={phone}
                                  onChange={e => handleChangeOnOtherOwnersData(e, index)}
                                  className={'max-w-[30%] min-w-[400px]'}
                                />
                                <TextField
                                  name="ssn"
                                  label="Social Security Number"
                                  value={ssn}
                                  isMasked={true}
                                  onChange={e => handleChangeOnOtherOwnersData(e, index)}
                                  className={'max-w-[30%] min-w-[400px]'}
                                />
                                <TextField
                                  name="address"
                                  label="Address"
                                  value={address}
                                  onChange={e => handleChangeOnOtherOwnersData(e, index)}
                                  className={'max-w-[30%] min-w-[400px]'}
                                />
                                <TextField
                                  name="percentage"
                                  label="Ownership Percentage"
                                  value={percentage}
                                  onChange={e => handleChangeOnOtherOwnersData(e, index)}
                                  className={'max-w-[30%] min-w-[400px]'}
                                />
                                <TextField
                                  name="date_of_birth"
                                  label="Date of Birth"
                                  value={date_of_birth}
                                  onChange={e => handleChangeOnOtherOwnersData(e, index)}
                                  className={'max-w-[30%] min-w-[400px]'}
                                />

                                <TextField
                                  name="driver_license_issuer_state"
                                  label="driver’s license issuer (state)"
                                  value={driver_license_issuer_state}
                                  onChange={e => handleChangeOnOtherOwnersData(e, index)}
                                  className={'max-w-[30%] min-w-[400px]'}
                                />
                                <TextField
                                  name="driver_licence_number"
                                  label="Driver’s License Number"
                                  value={driver_licence_number}
                                  onChange={e => handleChangeOnOtherOwnersData(e, index)}
                                  className={'max-w-[30%] min-w-[400px]'}
                                />
                              </div>
                            </div>
                          )}
                          <Button
                            onClick={() => handleRemoveOtherOwnersData(index)}
                            className="!py-2.5"
                            variant="secondary"
                            label="Remove"
                          />
                        </div>
                      </div>
                    );
                  }
                )}
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

      <form className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label="Previous" onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={() => handleNext({ data: form, name: title, setLoadingNext })}
              className={`${(!isAllRequiredFieldsFilled || loadingNext) && 'pointer-events-none cursor-not-allowed opacity-50'}`}
              disabled={!isAllRequiredFieldsFilled}
              label={isAllRequiredFieldsFilled ? 'Next' : submitButtonText}
            />
          ) : (
            <Button
              disabled={formLoading || loadingNext}
              className={formLoading || loadingNext ? 'pointer-events-none cursor-not-allowed opacity-50' : ''}
              label="Submit"
              onClick={() => handleSubmit({ data: form, name: title, setLoadingNext })}
            />
          )}
        </div>
      </form>

      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationOwnerFieldsModal
            sectionId={_id}
            fields={fields?.filter(f => f.type !== 'block')}
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
