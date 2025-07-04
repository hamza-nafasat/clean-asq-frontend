import React, { useEffect, useState } from 'react';
import TextField from '../shared/small/TextField';
import Button from '../shared/small/Button';

function CustomSection({
  fields,
  name,
  currentStep,
  totalSteps,
  handleNext,
  handlePrevious,
  handleSubmit,
  formLoading,
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    const formFields = {};
    if (fields?.length) {
      fields?.forEach(field => {
        formFields[field?.label] = '';
      });
      setForm(formFields);
    }
  }, [fields]);
  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <h1 className="text-textPrimary text-xl font-medium">{name}</h1>
      <div className="mt-6 flex flex-col gap-4">
        {fields?.map((field, index) => (
          <TextField
            key={index}
            label={field?.label}
            value={form[field?.label]}
            onChange={e => setForm({ ...form, [field?.label]: e.target.value })}
            type={field?.type}
          />
        ))}
      </div>
      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button label={'Next'} onClick={() => handleNext({ data: form, name })} />
          ) : (
            <Button
              disabled={formLoading}
              className={`${formLoading && 'pinter-events-none cursor-not-allowed opacity-50'}`}
              label={'Submit'}
              onClick={() => handleSubmit({ data: form, name })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomSection;
