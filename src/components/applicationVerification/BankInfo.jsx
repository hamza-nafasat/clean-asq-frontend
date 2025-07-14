import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../shared/small/Button';
import DynamicField from '../shared/small/DynamicField';

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
}) {
  const [form, setForm] = useState({});
  console.log('bank information', form);

  useEffect(() => {
    if (fields && fields.length > 0) {
      const initialForm = {};
      fields.forEach(field => {
        initialForm[field.name] = reduxData ? reduxData[field.name] || '' : '';
      });
      setForm(initialForm);
    }
  }, [fields, name, reduxData]);
  const nextHandler = ({ data, name }) => {
    let isValid = Object.values(data).every(value => value.trim() !== '');
    if (!isValid) return toast.error('Please fill all the fields');
    handleNext({ data, name });
  };
  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <h1 className="text-textPrimary text-xl font-medium">{name}</h1>
      <h5 className="text-textPrimary text-base">Provide Account information.</h5>
      {fields?.map((field, i) => (
        <div key={i} className="mt-5">
          <DynamicField
            key={i}
            field={field}
            value={form[field.name] || ''}
            placeholder={field.placeholder}
            onChange={e => setForm(prev => ({ ...prev, [field.name]: e.target.value }))}
            setForm={setForm}
            form={form}
          />
        </div>
      ))}
      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button label={'Next'} onClick={() => nextHandler({ data: form, name })} />
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

export default BankInfo;
