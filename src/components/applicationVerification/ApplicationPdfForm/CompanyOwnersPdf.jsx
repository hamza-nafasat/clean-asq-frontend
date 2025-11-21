import TextField from '@/components/shared/small/TextField';
import { FIELD_TYPES } from '@/data/constants';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SignatureBox from '../../shared/SignatureBox';
import {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from './shared/DynamicField';
import { EditSectionDisplayTextFromatingModal } from '../../shared/small/EditSectionDisplayTextFromatingModal';
import Modal from '../../shared/small/Modal';

const ssnField = {
  label: 'What is your Social Security Number?',
  name: 'rolling_owner_ssn',
  required: true,
  aiHelp: false,
  isMasked: true,
  type: 'text',
};
const areUAnOwnerField = {
  label: 'Are you a company owner holding 25% or more of the company?',
  name: 'rolling_owner_is_also_owner',
  required: true,
  aiHelp: false,
  type: 'radio',
  options: [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ],
};
const ownerPercentageField = {
  label: 'What is you percentage of ownership?',
  name: 'rolling_owner_percentage',
  required: true,
  aiHelp: false,
  type: 'range',
};

function CompanyOwnersPdf({ name, reduxData, fields, blocks, step, isSignature }) {
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const { formData } = useSelector(state => state?.form);
  const [ownersFromLookup, setOwnersFromLookup] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [otherOwnersStateName, setOtherOwnersStateName] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [form, setForm] = useState({});

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

  useEffect(() => {
    const idMissionData = formData?.idMission;
    const idMissionField = idMissionData?.roleFillingForCompany;
    let baseFields = [...fields];
    if (idMissionField == 'primaryOperatorAndController' || idMissionField == 'both') {
      baseFields = [ssnField, areUAnOwnerField, ...baseFields];
      if (form?.rolling_owner_is_also_owner == 'yes') {
        //  add percentage field after ssn and areUAnOwnerField
        baseFields = [ssnField, areUAnOwnerField, ownerPercentageField, ...fields];
      }
    } else if (idMissionField == 'primaryContact') {
      baseFields = [areUAnOwnerField, ...baseFields];
      if (form?.rolling_owner_is_also_owner == 'yes') {
        baseFields = [areUAnOwnerField, ssnField, ownerPercentageField, ...fields];
      }
    }
    setFormFields(baseFields);
  }, [blocks, fields, form, formData?.idMission]);

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

  // making form states according changing fields
  useEffect(() => {
    if (!formFields?.length) return;
    // 1) Build the “canonical” shape for this form
    const initialForm = {};
    formFields.forEach(field => {
      if (field.type === 'block' && field.name === 'additional_owner' && !otherOwnersStateName) {
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
        // setOtherOwnersStateName('');
      }
    });
    if (isSignature) {
      const isSignatureExistingData = {};
      if (reduxData?.signature?.publicId) isSignatureExistingData.publicId = reduxData?.signature?.publicId;
      if (reduxData?.signature?.secureUrl) isSignatureExistingData.secureUrl = reduxData?.signature?.secureUrl;
      if (reduxData?.signature?.resourceType) isSignatureExistingData.resourceType = reduxData?.signature?.resourceType;
      initialForm.signature = isSignatureExistingData?.publicId
        ? isSignatureExistingData
        : { publicId: '', secureUrl: '', resourceType: '' };
    }

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
  }, [form, formFields, isSignature, otherOwnersStateName, reduxData]);

  // create fields for this section and also for customization
  useEffect(() => {
    if (fields && fields.length > 0) {
      setFormFields([...fields]);
    }
  }, [fields]);

  return (
    <div className="h-full w-full overflow-auto">
      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} />
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
      </div>
      {step?.ai_formatting && (
        <div className="mb-4 flex w-full items-end justify-between gap-3">
          <div
            dangerouslySetInnerHTML={{
              __html: step?.ai_formatting,
            }}
          />
        </div>
      )}
      <div className="mt-5">
        <div className="h-full overflow-auto pb-3">
          <div className="rounded-xl border border-[#F0F0F0] p-4">
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
                                {filteredOwners.map((name, i) => (
                                  <li
                                    key={i}
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
                              type="email"
                              value={email}
                              required
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
                                  { label: 'No', value: 'no' },
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
                                  type="number"
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
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : null}

            <div className="">
              {isSignature && (
                <SignatureBox
                  onSave={signatureUploadHandler}
                  step={step}
                  isPdf={true}
                  oldSignatureUrl={form?.signature?.secureUrl || ''}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyOwnersPdf;
