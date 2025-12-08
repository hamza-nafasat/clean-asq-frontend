import DropdownCheckbox from '@/components/shared/DropdownCheckbox';
import Button from '@/components/shared/small/Button';
import CustomizableSelect from '@/components/shared/small/CustomizeableSelect';
import TextField from '@/components/shared/small/TextField';
import { useCreateFormStrategyMutation } from '@/redux/apis/formApis';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
const renderFormField = (field, value, onChange, type = 'text', options = null, error = null) => {
  const labelText = field
    .split(/(?=[A-Z])/) // split camelCase into words
    .join(' ')
    .replace(/^\w/, c => c.toUpperCase());

  if (type === 'select' && options) {
    return (
      <div className="mb-4">
        <label className="text-textPrimary mb-1 block text-sm font-medium">{labelText}</label>
        <select
          name={field}
          value={value}
          onChange={e => onChange(field, e.target.value)}
          className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${
            error ? 'border-red-500' : 'border-frameColor'
          }`}
        >
          <option value="">Choose an option</option>
          {options?.map(opt => (
            <option key={opt?.value} value={opt?.value}>
              {opt?.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === 'checkbox') {
    return (
      <div className="mb-4 flex items-center space-x-2">
        <input type="checkbox" checked={value} onChange={() => onChange(field, !value)} />
        <label className="text-sm font-medium">{labelText}</label>
      </div>
    );
  }

  if (type === 'multi-select' && options) {
    console.log('options', options);

    return (
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">{labelText}</label>
        <DropdownCheckbox
          options={options}
          selected={value}
          defaultText={`Select ${labelText}`}
          onSelect={vals => onChange(field, vals)}
        />
      </div>
    );
  }

  // ✅ Default input using your TextField component
  return (
    <div className="mb-4">
      <TextField
        label={labelText}
        name={field}
        type={type}
        value={value}
        onChange={e => onChange(field, e.target.value)} // ensure handler works
        placeholder={`Enter ${labelText}`}
        className="w-full rounded border p-2 text-sm"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

function AddStrategies({ setIsModalOpen, forms = [], formKeys = [] }) {
  const [form, setForm] = useState({ name: '', form: [], searchStrategies: [] });
  const [createFormStrategy, { isLoading }] = useCreateFormStrategyMutation();

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.searchStrategies.length) return toast.error('Please fill all the fields');
    try {
      const res = await createFormStrategy(form).unwrap();
      if (res.success) {
        toast.success(res.message);
        setIsModalOpen(false);
        setForm({ name: '', form: '', searchStrategies: [] });
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || 'Failed to create form strategy');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderFormField('name', form.name, handleChange, 'text')}
      {renderFormField('form', form.form, handleChange, 'multi-select', forms)}
      {renderFormField('searchStrategies', form.searchStrategies, handleChange, 'multi-select', formKeys)}
      <div className="flex w-full justify-end">
        <Button
          type="submit"
          label={'Save'}
          disabled={isLoading}
          className={isLoading ? 'cursor-not-allowed opacity-50' : ''}
        />
      </div>
    </form>
  );
}

export default AddStrategies;
