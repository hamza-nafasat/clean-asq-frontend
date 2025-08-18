import DropdownCheckbox from '@/components/shared/DropdownCheckbox';
import TextField from '@/components/shared/small/TextField';
import { useState } from 'react';

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

const AddStrategies = ({ onSave, companyOptions, extractAsOptions }) => {
  const [form, setForm] = useState({
    searchObjectKey: '',
    companyIdentification: [],
    extractAs: '',
    searchTerms: '',
    extractionPrompt: '',
    active: true,
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderFormField('searchObjectKey', form.searchObjectKey, handleChange)}
      {renderFormField(
        'companyIdentification',
        form.companyIdentification,
        handleChange,
        'multi-select',
        companyOptions
      )}
      {renderFormField('extractAs', form.extractAs, handleChange, 'select', extractAsOptions)}
      {renderFormField('searchTerms', form.searchTerms, handleChange)}
      {renderFormField('extractionPrompt', form.extractionPrompt, handleChange)}
      {renderFormField('active', form.active, handleChange, 'checkbox')}

      <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700">
        Save
      </button>
    </form>
  );
};

export default AddStrategies;
