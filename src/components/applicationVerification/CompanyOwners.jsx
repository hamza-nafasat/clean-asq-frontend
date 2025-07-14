import Star from '@/assets/svgs/UserApplicationForm/Star';
import TextField from '@/components/shared/small/TextField';
import { useEffect, useState } from 'react';
import { GoPlus } from 'react-icons/go';
import Button from '../shared/small/Button';
import DynamicField from '../shared/small/DynamicField';
import { toast } from 'react-toastify';

function CompanyOwners({
  name,
  handleNext,
  handlePrevious,
  currentStep,
  totalSteps,
  handleSubmit,
  formLoading,
  fields,
  reduxData,
}) {
  const [otherOwnersStateName, setOtherOwnersStateName] = useState('');
  const [form, setForm] = useState({});

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
    if (fields && fields.length > 0) {
      const initialForm = {};
      fields.forEach(field => {
        if (field.type === 'block' && field.name === 'additional_owner') {
          setOtherOwnersStateName(field.name);
          const initialState = { name: '', email: '', ssn: '', percentage: '' };
          initialForm[field.name] = reduxData ? reduxData[field.name] || [initialState] : [initialState];
        } else {
          initialForm[field.name] = reduxData ? reduxData[field.name] || '' : '';
        }
      });
      setForm(initialForm);
    }
  }, [fields, name, reduxData]);

  return (
    <div className="h-full overflow-auto">
      <h3 className="text-textPrimary text-[24px] font-semibold">{name}</h3>
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

            {fields?.map((field, i) => {
              if (field.name === 'main_owner_own_25_percent_or_more' || field.type === 'block') return null;
              return (
                <div key={i} className="mt-5">
                  <DynamicField
                    field={field}
                    value={form[field.name] || ''}
                    placeholder={field.placeholder}
                    onChange={e => setForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                    setForm={setForm}
                    form={form}
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
            <Button label="Next" onClick={() => nextHandler({ data: form, name })} />
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
    </div>
  );
}

export default CompanyOwners;
