import DropdownCheckbox from '@/components/shared/DropdownCheckbox';
import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import { useCreateSearchStrategyMutation, useUpdateSearchStrategyMutation } from '@/redux/apis/formApis';
import { useState } from 'react';
import { toast } from 'react-toastify';

// ✅ Dynamic form field renderer
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
          <option value="">Select</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
  if (type === 'textarea') {
    return (
      <div className="mb-4">
        <label className="text-textPrimary mb-1 block text-sm font-medium">{labelText}</label>
        <textarea
          name={field}
          value={value}
          onChange={e => onChange(field, e.target.value)}
          className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${
            error ? 'border-red-500' : 'border-frameColor'
          }`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
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

const AddStrategiesKey = ({ selectedRow, companyOptions, extractAsOptions, setEditModalData, setIsModalOpen }) => {
  const [createSearchStrategy] = useCreateSearchStrategyMutation();
  const [updateSearchStrategy] = useUpdateSearchStrategyMutation();
  const [form, setForm] = useState({
    searchObjectKey: selectedRow?.searchObjectKey || '',
    companyIdentification: selectedRow?.companyIdentification || [],
    extractAs: selectedRow?.extractAs || '',
    searchTerms: selectedRow?.searchTerms || '',
    extractionPrompt: selectedRow?.extractionPrompt || '',
    active: selectedRow?.isActive || false,
  });

  console.log('form', form);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { active, companyIdentification, extractAs, extractionPrompt, searchObjectKey, searchTerms } = form;
      console.log('searchObjectKey', searchObjectKey);
      if (!searchObjectKey || !searchTerms || !extractionPrompt || !extractAs || !companyIdentification.length) {
        return toast.error('Please fill all required fields');
      }
      if (!selectedRow?._id) {
        const res = await createSearchStrategy({
          data: {
            searchObjectKey,
            searchTerms,
            extractionPrompt,
            extractAs,
            companyIdentification,
            active,
          },
        }).unwrap();
        if (res?.success) {
          toast.success('Search strategy created successfully');
        }
      } else {
        const res = await updateSearchStrategy({
          SearchStrategyId: selectedRow?._id,
          data: {
            searchObjectKey,
            searchTerms,
            extractionPrompt,
            extractAs,
            companyIdentification,
            active,
            _id: selectedRow?._id,
          },
        }).unwrap();
        if (res?.success) {
          toast.success('Search strategy updated successfully');
        }
      }
    } catch (error) {
      console.error('Error creating search strategy:', error);
      toast.error(error?.data?.message || 'Failed to create search strategy');
    } finally {
      if (selectedRow?._id) setEditModalData(null);
      else setIsModalOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderFormField('searchObjectKey', form?.searchObjectKey, handleChange)}
      {renderFormField(
        'companyIdentification',
        form.companyIdentification,
        handleChange,
        'multi-select',
        companyOptions
      )}
      {renderFormField('extractAs', form.extractAs, handleChange, 'select', extractAsOptions)}
      {renderFormField('searchTerms', form.searchTerms, handleChange)}
      {renderFormField('extractionPrompt', form.extractionPrompt, handleChange, 'textarea')}
      {renderFormField('active', form.active, handleChange, 'checkbox')}

      {/* <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700">
        Save
      </button> */}
      <div className="flex w-full justify-end">
        <Button type="submit" label={'Save'} />
      </div>
    </form>
  );
};

export default AddStrategiesKey;
